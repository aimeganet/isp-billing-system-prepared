import Link from "next/link";
import { deleteSubscriberAction } from "@/actions/subscribers";
import { PageHeading } from "@/components/shared/page-heading";
import { Card } from "@/components/ui/card";
import { Table, TD, TH } from "@/components/ui/table";
import { can, requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function SubscribersPage() {
  await requirePermission(PERMISSIONS.SUBSCRIBERS_READ, "/dashboard");
  const [subscribers, canCreateSubscriber, canUpdateSubscriber, canDeleteSubscriber] = await Promise.all([
    prisma.subscriber.findMany({ orderBy: { createdAt: "desc" } }),
    can(PERMISSIONS.SUBSCRIBERS_CREATE),
    can(PERMISSIONS.SUBSCRIBERS_UPDATE),
    can(PERMISSIONS.SUBSCRIBERS_DELETE)
  ]);

  return (
    <div className="space-y-6">
      <PageHeading
        title="المشتركون"
        description="إدارة المشتركين والبحث داخل السجل المحلي مع كامل البيانات الأساسية."
        action={canCreateSubscriber ? <Link href="/subscribers/new" className="rounded-xl bg-slate-950 px-4 py-2 text-sm text-white">إضافة مشترك</Link> : null}
      />
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <thead>
              <tr>
                <TH>الاسم</TH>
                <TH>الكود</TH>
                <TH>الهاتف</TH>
                <TH>الحالة</TH>
                <TH>تاريخ الإضافة</TH>
                <TH>إجراءات</TH>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((subscriber) => (
                <tr key={subscriber.id}>
                  <TD>{subscriber.name}</TD>
                  <TD dir="ltr">{subscriber.subscriberCode}</TD>
                  <TD dir="ltr">{subscriber.phone ?? "-"}</TD>
                  <TD>{subscriber.status}</TD>
                  <TD>{formatDate(subscriber.createdAt)}</TD>
                  <TD>
                    <div className="flex flex-wrap gap-3">
                      <Link href={`/subscribers/${subscriber.id}`} className="text-slate-700">عرض</Link>
                      {canUpdateSubscriber ? <Link href={`/subscribers/${subscriber.id}/edit`} className="text-blue-600">تعديل</Link> : null}
                      {canDeleteSubscriber ? <form action={deleteSubscriberAction}><input type="hidden" name="id" value={subscriber.id} /><button type="submit" className="text-red-600">حذف</button></form> : null}
                    </div>
                  </TD>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
