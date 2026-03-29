import { retrySyncQueueAction } from "@/actions/sync";
import { PageHeading } from "@/components/shared/page-heading";
import { Card } from "@/components/ui/card";
import { Table, TD, TH } from "@/components/ui/table";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function SyncPage() {
  await requirePermission(PERMISSIONS.SYNC_READ, "/dashboard");
  const queue = await prisma.syncQueue.findMany({ orderBy: { createdAt: "desc" }, take: 200 });

  return (
    <div className="space-y-6">
      <PageHeading title="المزامنة" description="مراجعة العناصر المنتظرة أو الفاشلة في الدفع إلى الخادم البعيد." />
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-slate-500">أعد المحاولة للعناصر المعلقة أو الفاشلة.</div>
          <form action={retrySyncQueueAction}>
            <button type="submit" className="rounded-xl bg-slate-950 px-4 py-2 text-sm text-white">إعادة المحاولة</button>
          </form>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <thead>
              <tr>
                <TH>الكيان</TH>
                <TH>المعرف</TH>
                <TH>العملية</TH>
                <TH>الحالة</TH>
                <TH>المحاولات</TH>
                <TH>آخر خطأ</TH>
                <TH>التاريخ</TH>
              </tr>
            </thead>
            <tbody>
              {queue.map((item) => (
                <tr key={item.id}>
                  <TD>{item.entityType}</TD>
                  <TD dir="ltr">{item.entityId}</TD>
                  <TD>{item.operation}</TD>
                  <TD>{item.status}</TD>
                  <TD>{item.attempts}</TD>
                  <TD>{item.lastError ?? "-"}</TD>
                  <TD>{formatDate(item.createdAt)}</TD>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
