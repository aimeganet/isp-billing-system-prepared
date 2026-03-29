import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteSubscriberContactAction } from "@/actions/subscribers";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Table, TD, TH } from "@/components/ui/table";
import { PageHeading } from "@/components/shared/page-heading";
import { can, requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function SubscriberDetailsPage({ params }: { params: { id: string } }) {
  await requirePermission(PERMISSIONS.SUBSCRIBERS_READ, "/subscribers");

  const [subscriber, canUpdateSubscriber] = await Promise.all([
    prisma.subscriber.findUnique({
      where: { id: params.id },
      include: {
        currentPackage: true,
        contacts: { orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }] },
        transactions: {
          include: { packagePlan: true, employee: true, walletProvider: true },
          orderBy: { occurredAt: "desc" },
          take: 20
        },
        invoices: { orderBy: { createdAt: "desc" }, take: 10 },
        usageLogs: { orderBy: { capturedAt: "desc" }, take: 10 },
        messageLogs: { orderBy: { createdAt: "desc" }, take: 10 }
      }
    }),
    can(PERMISSIONS.SUBSCRIBERS_UPDATE)
  ]);

  if (!subscriber) notFound();

  return (
    <div className="space-y-6">
      <PageHeading
        title={subscriber.name}
        description={`الكود: ${subscriber.subscriberCode} — الحالة: ${subscriber.status}`}
        action={
          <div className="flex flex-wrap gap-3">
            {canUpdateSubscriber ? (
              <Link href={`/subscribers/${subscriber.id}/contacts/new`} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700">
                إضافة جهة اتصال
              </Link>
            ) : null}
            {canUpdateSubscriber ? (
              <Link href={`/subscribers/${subscriber.id}/edit`} className="rounded-xl bg-slate-950 px-4 py-2 text-sm text-white">
                تعديل
              </Link>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardDescription>الهاتف الأساسي</CardDescription>
          <CardTitle dir="ltr">{subscriber.phone ?? "-"}</CardTitle>
        </Card>
        <Card>
          <CardDescription>الباقة الحالية</CardDescription>
          <CardTitle>{subscriber.currentPackage?.name ?? "-"}</CardTitle>
        </Card>
        <Card>
          <CardDescription>بداية الدورة</CardDescription>
          <CardTitle>{formatDate(subscriber.currentStartDate)}</CardTitle>
        </Card>
        <Card>
          <CardDescription>نهاية الدورة</CardDescription>
          <CardTitle>{formatDate(subscriber.currentEndDate)}</CardTitle>
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <CardTitle>جهات الاتصال</CardTitle>
          <CardDescription>اختر الجهة الأساسية التي ستستخدم للفواتير والرسائل.</CardDescription>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <thead>
              <tr>
                <TH>الوصف</TH>
                <TH>الهاتف</TH>
                <TH>واتساب</TH>
                <TH>تيليجرام</TH>
                <TH>أساسي</TH>
                <TH>إجراءات</TH>
              </tr>
            </thead>
            <tbody>
              {subscriber.contacts.length === 0 ? (
                <tr>
                  <TD colSpan={6} className="text-center text-slate-500">لا توجد جهات اتصال مضافة بعد.</TD>
                </tr>
              ) : (
                subscriber.contacts.map((contact) => (
                  <tr key={contact.id}>
                    <TD>{contact.label ?? "-"}</TD>
                    <TD dir="ltr">{contact.phone}</TD>
                    <TD>{contact.whatsappEnabled ? "نعم" : "لا"}</TD>
                    <TD>{contact.telegramEnabled ? "نعم" : "لا"}</TD>
                    <TD>{contact.isPrimary ? "نعم" : "لا"}</TD>
                    <TD>
                      <div className="flex flex-wrap gap-3">
                        {canUpdateSubscriber ? (
                          <Link href={`/subscribers/${subscriber.id}/contacts/${contact.id}`} className="text-blue-600">
                            تعديل
                          </Link>
                        ) : null}
                        {canUpdateSubscriber ? (
                          <form action={deleteSubscriberContactAction}>
                            <input type="hidden" name="id" value={contact.id} />
                            <input type="hidden" name="subscriberId" value={subscriber.id} />
                            <button type="submit" className="text-red-600">حذف</button>
                          </form>
                        ) : null}
                      </div>
                    </TD>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </Card>

      <Card>
        <CardTitle className="mb-4">آخر العمليات</CardTitle>
        <div className="overflow-x-auto">
          <Table>
            <thead>
              <tr>
                <TH>الرقم</TH>
                <TH>النوع</TH>
                <TH>المبلغ</TH>
                <TH>الطريقة</TH>
                <TH>التاريخ</TH>
              </tr>
            </thead>
            <tbody>
              {subscriber.transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <TD>{transaction.transactionNo}</TD>
                  <TD>{transaction.type}</TD>
                  <TD>{formatCurrency(transaction.amount)}</TD>
                  <TD>{transaction.employee?.name ?? transaction.walletProvider?.name ?? transaction.methodType}</TD>
                  <TD>{formatDate(transaction.occurredAt)}</TD>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card>

      <Card>
        <CardTitle className="mb-4">آخر الفواتير</CardTitle>
        <div className="overflow-x-auto">
          <Table>
            <thead>
              <tr>
                <TH>رقم الفاتورة</TH>
                <TH>الإجمالي</TH>
                <TH>الحالة</TH>
                <TH>التاريخ</TH>
              </tr>
            </thead>
            <tbody>
              {subscriber.invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <TD>{invoice.invoiceNo}</TD>
                  <TD>{formatCurrency(invoice.total)}</TD>
                  <TD>{invoice.status}</TD>
                  <TD>{formatDate(invoice.createdAt)}</TD>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card>

      <Card>
        <CardTitle className="mb-4">آخر سجلات الرسائل</CardTitle>
        <div className="overflow-x-auto">
          <Table>
            <thead>
              <tr>
                <TH>القناة</TH>
                <TH>الهاتف</TH>
                <TH>الحالة</TH>
                <TH>التاريخ</TH>
              </tr>
            </thead>
            <tbody>
              {subscriber.messageLogs.length === 0 ? (
                <tr>
                  <TD colSpan={4} className="text-center text-slate-500">لا توجد رسائل مرسلة بعد.</TD>
                </tr>
              ) : (
                subscriber.messageLogs.map((log) => (
                  <tr key={log.id}>
                    <TD>{log.channel}</TD>
                    <TD dir="ltr">{log.phone}</TD>
                    <TD>{log.status}</TD>
                    <TD>{formatDate(log.createdAt)}</TD>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
