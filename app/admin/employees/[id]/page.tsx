import { notFound } from "next/navigation";
import { EmployeeForm } from "@/components/forms/employee-form";
import { PageHeading } from "@/components/shared/page-heading";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export default async function EditEmployeePage({ params }: { params: { id: string } }) {
  await requirePermission(PERMISSIONS.EMPLOYEES_MANAGE, "/admin/employees");
  const employee = await prisma.employee.findUnique({ where: { id: params.id } });
  if (!employee) notFound();

  return (
    <div className="space-y-6">
      <PageHeading title="تعديل الموظف" description={employee.name} />
      <EmployeeForm employee={employee} />
    </div>
  );
}
