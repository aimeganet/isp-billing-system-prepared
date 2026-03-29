import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeading } from "@/components/shared/page-heading";
import { MessageTemplateForm } from "@/components/forms/message-template-form";
import { Card } from "@/components/ui/card";
import { Table, TD, TH } from "@/components/ui/table";
import { deleteMessageTemplateAction } from "@/actions/settings";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";

export default async function MessageTemplatesPage() {
  await requirePermission(PERMISSIONS.TEMPLATES_MANAGE, "/dashboard");
  const templates = await prisma.messageTemplate.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <PageHeading title="قوالب الرسائل" description="تعديل نصوص الرسائل المرسلة عبر واتساب أو تيليجرام." />
      <MessageTemplateForm />
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <thead>
              <tr>
                <TH>الاسم</TH>
                <TH>الحدث</TH>
                <TH>القناة</TH>
                <TH>الحالة</TH>
                <TH>إجراءات</TH>
              </tr>
            </thead>
            <tbody>
              {templates.map((template) => (
                <tr key={template.id}>
                  <TD>{template.name}</TD>
                  <TD>{template.eventKey}</TD>
                  <TD>{template.channel}</TD>
                  <TD>{template.active ? "نشط" : "موقوف"}</TD>
                  <TD>
                    <div className="flex gap-3">
                      <Link href={`/messaging/templates/${template.id}`} className="text-blue-600">تعديل</Link>
                      <form action={deleteMessageTemplateAction}>
                        <input type="hidden" name="id" value={template.id} />
                        <button type="submit" className="text-red-600">حذف</button>
                      </form>
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
