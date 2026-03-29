"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { saveUploadedFile } from "@/lib/storage";
import { fileToBuffer, normalizePhone } from "@/lib/utils";
import { parseUploadedDocument } from "@/lib/importers";
import { generateSubscriberCode } from "@/lib/ids";
import { enqueueSync } from "@/lib/sync";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { recordAudit } from "@/lib/audit";

type ImportPreviewState = {
  success: boolean;
  message: string;
  meta?: {
    importJobId: string;
  };
};

const initialImportPreviewState: ImportPreviewState = {
  success: false,
  message: ""
};

export async function createImportPreviewAction(
  _prevState: ImportPreviewState = initialImportPreviewState,
  formData: FormData
): Promise<ImportPreviewState> {
  await requirePermission(PERMISSIONS.IMPORTS_CREATE, "/dashboard");
  const file = formData.get("file");
  const mode = String(formData.get("mode") ?? "UPDATE_EXISTING");

  if (!(file instanceof File) || file.size === 0) {
    return {
      success: false,
      message: "اختر ملفًا أولًا."
    };
  }

  const stored = await saveUploadedFile(file, "imports");
  const buffer = await fileToBuffer(file);
  const parsed = await parseUploadedDocument(file.name, buffer, file.type);

  const job = await prisma.importJob.create({
    data: {
      fileName: file.name,
      fileType: file.type || "application/octet-stream",
      sourcePath: stored.relativePath,
      mode: mode === "BULK_CREATE" ? "BULK_CREATE" : "UPDATE_EXISTING",
      totalRows: parsed.rows.length,
      rows: {
        create: await Promise.all(
          parsed.rows.map(async (row) => {
            const match = row.parsedPhone
              ? await prisma.subscriber.findFirst({
                  where: { phone: normalizePhone(row.parsedPhone) }
                })
              : row.parsedName
                ? await prisma.subscriber.findFirst({
                    where: { name: row.parsedName }
                  })
                : null;

            return {
              rowIndex: row.rowIndex,
              rawText: row.rawText,
              parsedName: row.parsedName,
              parsedPhone: row.parsedPhone,
              usedGigabytes: row.usedGigabytes,
              remainingGigabytes: row.remainingGigabytes,
              matchedSubscriberId: match?.id
            };
          })
        )
      }
    }
  });

  await recordAudit("CREATE_PREVIEW", "importJob", job.id, { fileName: file.name, mode });
  revalidatePath("/imports");
  return {
    success: true,
    message: "تم تجهيز معاينة الاستيراد.",
    meta: { importJobId: job.id }
  };
}

export async function applyImportJobAction(formData: FormData) {
  await requirePermission(PERMISSIONS.IMPORTS_CREATE, "/dashboard");
  const importJobId = String(formData.get("importJobId") ?? "");
  if (!importJobId) return;

  const job = await prisma.importJob.findUnique({
    where: { id: importJobId },
    include: { rows: true }
  });

  if (!job) return;

  let createdRows = 0;
  let updatedRows = 0;
  let failedRows = 0;

  await prisma.importJob.update({
    where: { id: importJobId },
    data: { status: "APPLYING" }
  });

  for (const row of job.rows) {
    try {
      let subscriberId = row.matchedSubscriberId ?? null;

      if (!subscriberId && job.mode === "BULK_CREATE" && row.parsedName) {
        const subscriber = await prisma.subscriber.create({
          data: {
            subscriberCode: await generateSubscriberCode(row.parsedPhone, false),
            name: row.parsedName,
            phone: row.parsedPhone || null,
            contacts: row.parsedPhone
              ? {
                  create: {
                    phone: row.parsedPhone,
                    label: "الأساسي",
                    isPrimary: true
                  }
                }
              : undefined
          }
        });

        subscriberId = subscriber.id;
        createdRows += 1;
        await enqueueSync("subscriber", subscriber.id, "UPSERT", subscriber);
      }

      if (subscriberId) {
const usageLog = await prisma.usageLog.create({
  data: {
    subscriberId,
    importRowId: row.id,
    usedGigabytes: row.usedGigabytes ?? null,
    remainingGigabytes: row.remainingGigabytes ?? null,
    notes: `Imported from job ${job.fileName}`
  }
});

await enqueueSync("usageLog", usageLog.id, "UPSERT", usageLog);

        if (row.matchedSubscriberId) {
          updatedRows += 1;
        }

        await prisma.importRow.update({
          where: { id: row.id },
          data: {
            applyStatus: "APPLIED",
            resultMessage: "Applied successfully",
            matchedSubscriberId: subscriberId
          }
        });
      } else {
        failedRows += 1;
        await prisma.importRow.update({
          where: { id: row.id },
          data: {
            applyStatus: "FAILED",
            resultMessage: "No matching subscriber and bulk create disabled"
          }
        });
      }
    } catch (error) {
      failedRows += 1;
      await prisma.importRow.update({
        where: { id: row.id },
        data: {
          applyStatus: "FAILED",
          resultMessage: error instanceof Error ? error.message : "Unknown error"
        }
      });
    }
  }

  await prisma.importJob.update({
    where: { id: importJobId },
    data: {
      status: failedRows > 0 ? "FAILED" : "COMPLETED",
      createdRows,
      updatedRows,
      failedRows
    }
  });

  await recordAudit("APPLY", "importJob", importJobId, { createdRows, updatedRows, failedRows });
  revalidatePath("/imports");
  revalidatePath(`/imports/${importJobId}`);
}
