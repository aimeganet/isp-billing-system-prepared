import Link from "next/link";
import { ImportForm } from "@/components/forms/import-form";
import { PageHeading } from "@/components/shared/page-heading";
import { Card } from "@/components/ui/card";
import { Table, TD, TH } from "@/components/ui/table";
import { can, requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function ImportsPage() {
  await requirePermission(PERMISSIONS.IMPORTS_READ, "/dashboard");
  const [jobs, canCreateImport] = await Promise.all([
    prisma.importJob.findMany({ orderBy: { createdAt: "desc" } }),
    can(PERMISSIONS.IMPORTS_CREATE)
  ]);

  return (
    <div className="space-y-6">
      <PageHeading title="الاستيراد" description="رفع ملفات PDF وWord والصور واستخراج بيانات المشتركين." />
      {canCreateImport ? <ImportForm /> : null}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <thead>
              <tr>
                <TH>الملف</TH>
                <TH>الوضع</TH>
                <TH>الحالة</TH>
                <TH>عدد الصفوف</TH>
                <TH>التاريخ</TH>
                <TH>إجراءات</TH>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id}>
                  <TD>{job.fileName}</TD>
                  <TD>{job.mode}</TD>
                  <TD>{job.status}</TD>
                  <TD>{job.totalRows}</TD>
                  <TD>{formatDate(job.createdAt)}</TD>
                  <TD><Link href={`/imports/${job.id}`} className="text-blue-600">فتح</Link></TD>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
