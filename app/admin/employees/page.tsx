import Link from "next/link";
import { deleteEmployeeAction } from "@/actions/admin";
import { EmployeeForm } from "@/components/forms/employee-form";
import { PageHeading } from "@/components/shared/page-heading";
import { Card } from "@/components/ui/card";
import { Table, TD, TH } from "@/components/ui/table";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export default async function EmployeesPage() {
  await requirePermission(PERMISSIONS.EMPLOYEES_MANAGE, "/dashboard");
  const employees = await prisma.employee.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <PageHeading title="الموظفون والمشرفون" description="الجهات البشرية التي يمكن تنفيذ العمليات من خلالها." />
      <EmployeeForm />
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <thead>
              <tr>
                <TH>الاسم</TH>
                <TH>الرمز</TH>
                <TH>الوصف الوظيفي</TH>
                <TH>الحالة</TH>
                <TH>إجراءات</TH>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id}>
                  <TD>{employee.name}</TD>
                  <TD>{employee.slug}</TD>
                  <TD>{employee.roleLabel}</TD>
                  <TD>{employee.active ? "نشط" : "موقوف"}</TD>
                  <TD>
                    <div className="flex gap-3">
                      <Link href={`/admin/employees/${employee.id}`} className="text-blue-600">تعديل</Link>
                      <form action={deleteEmployeeAction}>
                        <input type="hidden" name="id" value={employee.id} />
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
