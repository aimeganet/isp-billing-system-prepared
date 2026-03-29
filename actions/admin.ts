"use server";

import { revalidatePath } from "next/cache";
import { UserRoleKey } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { enqueueSync } from "@/lib/sync";
import { ActionState, slugify } from "@/lib/utils";
import {
  employeeSchema,
  packageSchema,
  permissionSchema,
  roleSchema,
  userSchema,
  walletSchema
} from "@/lib/validators";
import { hashPassword } from "@/lib/password";
import { PERMISSIONS, roleKeyFromLegacyRole } from "@/lib/permissions";
import { requirePermission, requireUser } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";

function uniqueIds(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

async function syncUserRoles(userId: string, role: UserRoleKey, roleIds: string[]) {
  const normalizedRoleIds = uniqueIds(roleIds);
  const systemRole = await prisma.role.findUnique({
    where: { key: roleKeyFromLegacyRole[role] }
  });

  const finalRoleIds = uniqueIds([
    ...normalizedRoleIds,
    ...(systemRole ? [systemRole.id] : [])
  ]);

  await prisma.userRole.deleteMany({ where: { userId } });
  if (finalRoleIds.length > 0) {
    await prisma.userRole.createMany({
      data: finalRoleIds.map((roleId) => ({ userId, roleId }))
    });
  }
}

async function syncRolePermissions(roleId: string, permissionIds: string[]) {
  const finalPermissionIds = uniqueIds(permissionIds);
  await prisma.rolePermission.deleteMany({ where: { roleId } });

  if (finalPermissionIds.length > 0) {
    await prisma.rolePermission.createMany({
      data: finalPermissionIds.map((permissionId) => ({ roleId, permissionId }))
    });
  }
}

export async function createEmployeeAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requirePermission(PERMISSIONS.EMPLOYEES_MANAGE, "/dashboard");

  const raw = {
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    roleLabel: String(formData.get("roleLabel") ?? ""),
    active: formData.get("active") === "on"
  };

  const parsed = employeeSchema.safeParse({
    ...raw,
    slug: slugify(raw.slug || raw.name)
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "فشل إضافة الموظف.",
      errors: parsed.error.flatten().fieldErrors
    };
  }

  const employee = await prisma.employee.create({ data: parsed.data });
  await enqueueSync("employee", employee.id, "UPSERT", employee);
  await recordAudit("CREATE", "employee", employee.id, parsed.data);
  revalidatePath("/admin/employees");

  return { success: true, message: "تمت إضافة الموظف." };
}

export async function updateEmployeeAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requirePermission(PERMISSIONS.EMPLOYEES_MANAGE, "/dashboard");
  const employeeId = String(formData.get("employeeId") ?? "");
  const raw = {
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    roleLabel: String(formData.get("roleLabel") ?? ""),
    active: formData.get("active") === "on"
  };

  const parsed = employeeSchema.safeParse({
    ...raw,
    slug: slugify(raw.slug || raw.name)
  });

  if (!employeeId || !parsed.success) {
    return {
      success: false,
      message: "فشل تعديل الموظف.",
      errors: parsed.success ? undefined : parsed.error.flatten().fieldErrors
    };
  }

  const employee = await prisma.employee.update({
    where: { id: employeeId },
    data: parsed.data
  });

  await enqueueSync("employee", employee.id, "UPSERT", employee);
  await recordAudit("UPDATE", "employee", employee.id, parsed.data);
  revalidatePath("/admin/employees");
  revalidatePath(`/admin/employees/${employee.id}`);

  return { success: true, message: "تم حفظ تعديلات الموظف." };
}

export async function deleteEmployeeAction(formData: FormData) {
  await requirePermission(PERMISSIONS.EMPLOYEES_MANAGE, "/dashboard");
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.employee.delete({ where: { id } });
  await enqueueSync("employee", id, "DELETE", { id });
  await recordAudit("DELETE", "employee", id, { id });
  revalidatePath("/admin/employees");
}

export async function createWalletProviderAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requirePermission(PERMISSIONS.WALLETS_MANAGE, "/dashboard");
  const raw = {
    name: String(formData.get("name") ?? ""),
    code: String(formData.get("code") ?? ""),
    requiresScreenshot: formData.get("requiresScreenshot") === "on",
    active: formData.get("active") === "on"
  };

  const parsed = walletSchema.safeParse({
    ...raw,
    code: slugify(raw.code || raw.name)
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "فشل إضافة المحفظة.",
      errors: parsed.error.flatten().fieldErrors
    };
  }

  const wallet = await prisma.walletProvider.create({ data: parsed.data });
  await enqueueSync("walletProvider", wallet.id, "UPSERT", wallet);
  await recordAudit("CREATE", "walletProvider", wallet.id, parsed.data);
  revalidatePath("/admin/wallets");

  return { success: true, message: "تمت إضافة المحفظة." };
}

export async function updateWalletProviderAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requirePermission(PERMISSIONS.WALLETS_MANAGE, "/dashboard");
  const walletId = String(formData.get("walletId") ?? "");
  const raw = {
    name: String(formData.get("name") ?? ""),
    code: String(formData.get("code") ?? ""),
    requiresScreenshot: formData.get("requiresScreenshot") === "on",
    active: formData.get("active") === "on"
  };

  const parsed = walletSchema.safeParse({
    ...raw,
    code: slugify(raw.code || raw.name)
  });

  if (!walletId || !parsed.success) {
    return {
      success: false,
      message: "فشل تعديل المحفظة.",
      errors: parsed.success ? undefined : parsed.error.flatten().fieldErrors
    };
  }

  const wallet = await prisma.walletProvider.update({
    where: { id: walletId },
    data: parsed.data
  });

  await enqueueSync("walletProvider", wallet.id, "UPSERT", wallet);
  await recordAudit("UPDATE", "walletProvider", wallet.id, parsed.data);
  revalidatePath("/admin/wallets");
  revalidatePath(`/admin/wallets/${wallet.id}`);

  return { success: true, message: "تم حفظ تعديلات المحفظة." };
}

export async function deleteWalletProviderAction(formData: FormData) {
  await requirePermission(PERMISSIONS.WALLETS_MANAGE, "/dashboard");
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.walletProvider.delete({ where: { id } });
  await enqueueSync("walletProvider", id, "DELETE", { id });
  await recordAudit("DELETE", "walletProvider", id, { id });
  revalidatePath("/admin/wallets");
}

export async function createPackagePlanAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requirePermission(PERMISSIONS.PACKAGES_MANAGE, "/dashboard");
  const raw = {
    name: String(formData.get("name") ?? ""),
    code: String(formData.get("code") ?? ""),
    gigabytes: String(formData.get("gigabytes") ?? ""),
    durationDays: String(formData.get("durationDays") ?? ""),
    price: String(formData.get("price") ?? ""),
    active: formData.get("active") === "on"
  };

  const parsed = packageSchema.safeParse({
    ...raw,
    code: slugify(raw.code || raw.name)
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "فشل إضافة الباقة.",
      errors: parsed.error.flatten().fieldErrors
    };
  }

  const plan = await prisma.packagePlan.create({ data: parsed.data });
  await enqueueSync("packagePlan", plan.id, "UPSERT", plan);
  await recordAudit("CREATE", "packagePlan", plan.id, parsed.data);
  revalidatePath("/settings");
  revalidatePath("/transactions/new");

  return { success: true, message: "تمت إضافة الباقة." };
}

export async function updatePackagePlanAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requirePermission(PERMISSIONS.PACKAGES_MANAGE, "/dashboard");
  const packageId = String(formData.get("packageId") ?? "");
  const raw = {
    name: String(formData.get("name") ?? ""),
    code: String(formData.get("code") ?? ""),
    gigabytes: String(formData.get("gigabytes") ?? ""),
    durationDays: String(formData.get("durationDays") ?? ""),
    price: String(formData.get("price") ?? ""),
    active: formData.get("active") === "on"
  };

  const parsed = packageSchema.safeParse({
    ...raw,
    code: slugify(raw.code || raw.name)
  });

  if (!packageId || !parsed.success) {
    return {
      success: false,
      message: "فشل تعديل الباقة.",
      errors: parsed.success ? undefined : parsed.error.flatten().fieldErrors
    };
  }

  const plan = await prisma.packagePlan.update({
    where: { id: packageId },
    data: parsed.data
  });

  await enqueueSync("packagePlan", plan.id, "UPSERT", plan);
  await recordAudit("UPDATE", "packagePlan", plan.id, parsed.data);
  revalidatePath("/settings");
  revalidatePath(`/settings/packages/${plan.id}`);
  revalidatePath("/transactions/new");

  return { success: true, message: "تم حفظ تعديلات الباقة." };
}

export async function deletePackagePlanAction(formData: FormData) {
  await requirePermission(PERMISSIONS.PACKAGES_MANAGE, "/dashboard");
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.packagePlan.delete({ where: { id } });
  await enqueueSync("packagePlan", id, "DELETE", { id });
  await recordAudit("DELETE", "packagePlan", id, { id });
  revalidatePath("/settings");
  revalidatePath("/transactions/new");
}

export async function createUserAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requirePermission(PERMISSIONS.USERS_CREATE, "/dashboard");
  const raw = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
    role: String(formData.get("role") ?? "EMPLOYEE"),
    active: formData.get("active") === "on",
    roleIds: formData.getAll("roleIds").map(String)
  };

  const parsed = userSchema.safeParse(raw);

  if (!parsed.success || !parsed.data.password) {
    return {
      success: false,
      message: !parsed.success ? "فشل إضافة المستخدم." : "كلمة المرور مطلوبة عند إنشاء مستخدم جديد.",
      errors: parsed.success ? undefined : parsed.error.flatten().fieldErrors
    };
  }

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash: await hashPassword(parsed.data.password),
      role: parsed.data.role,
      active: parsed.data.active ?? true
    }
  });

  await syncUserRoles(user.id, parsed.data.role, parsed.data.roleIds ?? []);
  await enqueueSync("user", user.id, "UPSERT", user);
  await recordAudit("CREATE", "user", user.id, {
    ...parsed.data,
    password: undefined
  });
  revalidatePath("/admin/users");

  return { success: true, message: "تمت إضافة المستخدم." };
}

export async function updateUserAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requirePermission(PERMISSIONS.USERS_UPDATE, "/dashboard");
  const userId = String(formData.get("userId") ?? "");
  const raw = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
    role: String(formData.get("role") ?? "EMPLOYEE"),
    active: formData.get("active") === "on",
    roleIds: formData.getAll("roleIds").map(String)
  };

  const parsed = userSchema.safeParse(raw);

  if (!userId || !parsed.success) {
    return {
      success: false,
      message: "فشل تعديل المستخدم.",
      errors: parsed.success ? undefined : parsed.error.flatten().fieldErrors
    };
  }

  const data: {
    name: string;
    email: string;
    role: UserRoleKey;
    active: boolean;
    passwordHash?: string;
  } = {
    name: parsed.data.name,
    email: parsed.data.email,
    role: parsed.data.role,
    active: parsed.data.active ?? true
  };

  if (parsed.data.password) {
    data.passwordHash = await hashPassword(parsed.data.password);
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data
  });

  await syncUserRoles(user.id, parsed.data.role, parsed.data.roleIds ?? []);
  await enqueueSync("user", user.id, "UPSERT", user);
  await recordAudit("UPDATE", "user", user.id, {
    ...parsed.data,
    password: parsed.data.password ? "***" : undefined
  });
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${user.id}`);

  return { success: true, message: "تم حفظ بيانات المستخدم." };
}

export async function deleteUserAction(formData: FormData) {
  const currentUser = await requireUser();
  await requirePermission(PERMISSIONS.USERS_DELETE, "/dashboard");
  const id = String(formData.get("id") ?? "");
  if (!id || id === currentUser.id) return;

  await prisma.session.deleteMany({ where: { userId: id } });
  await prisma.userRole.deleteMany({ where: { userId: id } });
  await prisma.user.delete({ where: { id } });
  await enqueueSync("user", id, "DELETE", { id });
  await recordAudit("DELETE", "user", id, { id });
  revalidatePath("/admin/users");
}

export async function createRoleAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requirePermission(PERMISSIONS.ROLES_UPDATE, "/dashboard");
  const raw = {
    name: String(formData.get("name") ?? ""),
    key: String(formData.get("key") ?? ""),
    description: String(formData.get("description") ?? ""),
    active: formData.get("active") === "on",
    permissionIds: formData.getAll("permissionIds").map(String)
  };

  const parsed = roleSchema.safeParse({
    ...raw,
    key: slugify(raw.key || raw.name)
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "فشل إضافة الدور.",
      errors: parsed.error.flatten().fieldErrors
    };
  }

  const role = await prisma.role.create({
    data: {
      key: parsed.data.key,
      name: parsed.data.name,
      description: parsed.data.description || null,
      active: parsed.data.active ?? true
    }
  });

  await syncRolePermissions(role.id, parsed.data.permissionIds ?? []);
  await enqueueSync("role", role.id, "UPSERT", role);
  await recordAudit("CREATE", "role", role.id, parsed.data);
  revalidatePath("/admin/roles");

  return { success: true, message: "تمت إضافة الدور." };
}

export async function updateRoleAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requirePermission(PERMISSIONS.ROLES_UPDATE, "/dashboard");
  const roleId = String(formData.get("roleId") ?? "");
  const raw = {
    name: String(formData.get("name") ?? ""),
    key: String(formData.get("key") ?? ""),
    description: String(formData.get("description") ?? ""),
    active: formData.get("active") === "on",
    permissionIds: formData.getAll("permissionIds").map(String)
  };

  const parsed = roleSchema.safeParse({
    ...raw,
    key: slugify(raw.key || raw.name)
  });

  if (!roleId || !parsed.success) {
    return {
      success: false,
      message: "فشل تعديل الدور.",
      errors: parsed.success ? undefined : parsed.error.flatten().fieldErrors
    };
  }

  const currentRole = await prisma.role.findUnique({ where: { id: roleId } });
  if (!currentRole) {
    return { success: false, message: "الدور غير موجود." };
  }

  const role = await prisma.role.update({
    where: { id: roleId },
    data: {
      key: currentRole.isSystem ? currentRole.key : parsed.data.key,
      name: parsed.data.name,
      description: parsed.data.description || null,
      active: parsed.data.active ?? true
    }
  });

  await syncRolePermissions(role.id, parsed.data.permissionIds ?? []);
  await enqueueSync("role", role.id, "UPSERT", role);
  await recordAudit("UPDATE", "role", role.id, parsed.data);
  revalidatePath("/admin/roles");
  revalidatePath(`/admin/roles/${role.id}`);

  return { success: true, message: "تم حفظ الدور." };
}

export async function deleteRoleAction(formData: FormData) {
  await requirePermission(PERMISSIONS.ROLES_UPDATE, "/dashboard");
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const role = await prisma.role.findUnique({ where: { id } });
  if (!role || role.isSystem) return;

  await prisma.role.delete({ where: { id } });
  await enqueueSync("role", id, "DELETE", { id });
  await recordAudit("DELETE", "role", id, { id });
  revalidatePath("/admin/roles");
}

export async function createPermissionAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requirePermission(PERMISSIONS.ROLES_UPDATE, "/dashboard");
  const raw = {
    name: String(formData.get("name") ?? ""),
    key: String(formData.get("key") ?? ""),
    description: String(formData.get("description") ?? ""),
    active: formData.get("active") === "on"
  };

  const parsed = permissionSchema.safeParse({
    ...raw,
    key: slugify(raw.key || raw.name)
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "فشل إضافة الصلاحية.",
      errors: parsed.error.flatten().fieldErrors
    };
  }

  const permission = await prisma.permission.create({
    data: {
      key: parsed.data.key,
      name: parsed.data.name,
      description: parsed.data.description || null,
      active: parsed.data.active ?? true
    }
  });

  await enqueueSync("permission", permission.id, "UPSERT", permission);
  await recordAudit("CREATE", "permission", permission.id, parsed.data);
  revalidatePath("/admin/permissions");
  revalidatePath("/admin/roles");

  return { success: true, message: "تمت إضافة الصلاحية." };
}

export async function updatePermissionAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requirePermission(PERMISSIONS.ROLES_UPDATE, "/dashboard");
  const permissionId = String(formData.get("permissionId") ?? "");
  const raw = {
    name: String(formData.get("name") ?? ""),
    key: String(formData.get("key") ?? ""),
    description: String(formData.get("description") ?? ""),
    active: formData.get("active") === "on"
  };

  const parsed = permissionSchema.safeParse({
    ...raw,
    key: slugify(raw.key || raw.name)
  });

  if (!permissionId || !parsed.success) {
    return {
      success: false,
      message: "فشل تعديل الصلاحية.",
      errors: parsed.success ? undefined : parsed.error.flatten().fieldErrors
    };
  }

  const currentPermission = await prisma.permission.findUnique({ where: { id: permissionId } });
  if (!currentPermission) {
    return { success: false, message: "الصلاحية غير موجودة." };
  }

  const permission = await prisma.permission.update({
    where: { id: permissionId },
    data: {
      key: currentPermission.isSystem ? currentPermission.key : parsed.data.key,
      name: parsed.data.name,
      description: parsed.data.description || null,
      active: parsed.data.active ?? true
    }
  });

  await enqueueSync("permission", permission.id, "UPSERT", permission);
  await recordAudit("UPDATE", "permission", permission.id, parsed.data);
  revalidatePath("/admin/permissions");
  revalidatePath(`/admin/permissions/${permission.id}`);
  revalidatePath("/admin/roles");

  return { success: true, message: "تم حفظ الصلاحية." };
}

export async function deletePermissionAction(formData: FormData) {
  await requirePermission(PERMISSIONS.ROLES_UPDATE, "/dashboard");
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const permission = await prisma.permission.findUnique({ where: { id } });
  if (!permission || permission.isSystem) return;

  await prisma.permission.delete({ where: { id } });
  await enqueueSync("permission", id, "DELETE", { id });
  await recordAudit("DELETE", "permission", id, { id });
  revalidatePath("/admin/permissions");
  revalidatePath("/admin/roles");
}
