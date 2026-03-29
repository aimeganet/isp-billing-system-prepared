import { notFound } from "next/navigation";
import { applyImportJobAction } from "@/actions/imports";
import { PageHeading } from "@/components/shared/page-heading";
import { Card } from "@/components/ui/card";
import { Table, TD, TH } from "@/components/ui/table";
import { can, requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export default async function ImportJobDetailsPage({ params }: { params: { id: string } }) {
  await requirePermission(PERMISSIONS.IMPORTS_READ, "/imports");
  const [job, canApplyImport] = await Promise.all([
    prisma.importJob.findUnique({
    where: { id: params.id },
    include: { rows: { orderBy: { rowIndex: "asc" } } }
    }),
    can(PERMISSIONS.IMPORTS_CREATE)
  ]);

  if (!job) notFound();

  return (
    <div className="space-y-6">
      <PageHeading title={job.fileName} description={`الحالة: ${job.status}`} />
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-slate-500">راجع النتائج قبل التطبيق النهائي.</div>
          {canApplyImport ? <form action={applyImportJobAction}>
            <input type="hidden" name="importJobId" value={job.id} />
            <button type="submit" className="rounded-xl bg-slate-950 px-4 py-2 text-sm text-white">تطبيق الاستيراد</button>
          </form> : null}
        </div>
        <div className="overflow-x-auto">
          <Table>
            <thead>
              <tr>
                <TH>#</TH>
                <TH>الاسم</TH>
                <TH>الهاتف</TH>
                <TH>المطابقة</TH>
                <TH>الاستهلاك</TH>
                <TH>المتبقي</TH>
                <TH>النتيجة</TH>
              </tr>
            </thead>
            <tbody>
              {job.rows.map((row) => (
                <tr key={row.id}>
                  <TD>{row.rowIndex}</TD>
                  <TD>{row.parsedName ?? "-"}</TD>
                  <TD dir="ltr">{row.parsedPhone ?? "-"}</TD>
                  <TD>{row.matchedSubscriberId ? "مطابق" : "جديد/غير مطابق"}</TD>
                  <TD>{row.usedGigabytes ?? "-"}</TD>
                  <TD>{row.remainingGigabytes ?? "-"}</TD>
                  <TD>{row.applyStatus}</TD>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
