import { PageHeading } from "@/components/shared/page-heading";
import { Card } from "@/components/ui/card";
import { Table, TD, TH } from "@/components/ui/table";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function AuditPage() {
  await requirePermission(PERMISSIONS.AUDIT_READ, "/dashboard");
  const logs = await prisma.auditLog.findMany({ include: { user: true }, orderBy: { createdAt: "desc" }, take: 200 });

  return (
    <div className="space-y-6">
      <PageHeading title="سجل المراجعة" description="كل الإضافات والتعديلات والحذف وتسجيل الدخول والإرسال." />
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <thead>
              <tr>
                <TH>الوقت</TH>
                <TH>المستخدم</TH>
                <TH>الإجراء</TH>
                <TH>الكيان</TH>
                <TH>المرجع</TH>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <TD>{formatDate(log.createdAt)}</TD>
                  <TD>{log.user?.name ?? "نظام"}</TD>
                  <TD>{log.action}</TD>
                  <TD>{log.entityType}</TD>
                  <TD dir="ltr">{log.entityId}</TD>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
