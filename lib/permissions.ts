import { UserRoleKey } from "@prisma/client";

export const PERMISSIONS = {
  DASHBOARD_VIEW: "dashboard.view",
  SUBSCRIBERS_READ: "subscribers.read",
  SUBSCRIBERS_CREATE: "subscribers.create",
  SUBSCRIBERS_UPDATE: "subscribers.update",
  SUBSCRIBERS_DELETE: "subscribers.delete",
  TRANSACTIONS_READ: "transactions.read",
  TRANSACTIONS_CREATE: "transactions.create",
  TRANSACTIONS_UPDATE: "transactions.update",
  TRANSACTIONS_DELETE: "transactions.delete",
  INVOICES_READ: "invoices.read",
  INVOICES_SEND: "invoices.send",
  IMPORTS_READ: "imports.read",
  IMPORTS_CREATE: "imports.create",
  TEMPLATES_MANAGE: "templates.manage",
  SETTINGS_READ: "settings.read",
  SETTINGS_UPDATE: "settings.update",
  USERS_READ: "users.read",
  USERS_CREATE: "users.create",
  USERS_UPDATE: "users.update",
  USERS_DELETE: "users.delete",
  ROLES_READ: "roles.read",
  ROLES_UPDATE: "roles.update",
  EMPLOYEES_MANAGE: "employees.manage",
  WALLETS_MANAGE: "wallets.manage",
  PACKAGES_MANAGE: "packages.manage",
  REPORTS_READ: "reports.read",
  SYNC_READ: "sync.read",
  SYNC_RUN: "sync.run",
  AUDIT_READ: "audit.read"
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const permissionLabels: Record<PermissionKey, string> = {
  [PERMISSIONS.DASHBOARD_VIEW]: "عرض لوحة التحكم",
  [PERMISSIONS.SUBSCRIBERS_READ]: "عرض المشتركين",
  [PERMISSIONS.SUBSCRIBERS_CREATE]: "إضافة مشترك",
  [PERMISSIONS.SUBSCRIBERS_UPDATE]: "تعديل مشترك",
  [PERMISSIONS.SUBSCRIBERS_DELETE]: "حذف مشترك",
  [PERMISSIONS.TRANSACTIONS_READ]: "عرض العمليات",
  [PERMISSIONS.TRANSACTIONS_CREATE]: "إضافة عملية",
  [PERMISSIONS.TRANSACTIONS_UPDATE]: "تعديل عملية",
  [PERMISSIONS.TRANSACTIONS_DELETE]: "حذف عملية",
  [PERMISSIONS.INVOICES_READ]: "عرض الفواتير",
  [PERMISSIONS.INVOICES_SEND]: "إرسال الفواتير",
  [PERMISSIONS.IMPORTS_READ]: "عرض الاستيراد",
  [PERMISSIONS.IMPORTS_CREATE]: "استيراد الملفات",
  [PERMISSIONS.TEMPLATES_MANAGE]: "إدارة القوالب",
  [PERMISSIONS.SETTINGS_READ]: "عرض الإعدادات",
  [PERMISSIONS.SETTINGS_UPDATE]: "تعديل الإعدادات",
  [PERMISSIONS.USERS_READ]: "عرض المستخدمين",
  [PERMISSIONS.USERS_CREATE]: "إضافة مستخدم",
  [PERMISSIONS.USERS_UPDATE]: "تعديل مستخدم",
  [PERMISSIONS.USERS_DELETE]: "حذف مستخدم",
  [PERMISSIONS.ROLES_READ]: "عرض الأدوار",
  [PERMISSIONS.ROLES_UPDATE]: "تعديل الأدوار",
  [PERMISSIONS.EMPLOYEES_MANAGE]: "إدارة الموظفين",
  [PERMISSIONS.WALLETS_MANAGE]: "إدارة المحافظ",
  [PERMISSIONS.PACKAGES_MANAGE]: "إدارة الباقات",
  [PERMISSIONS.REPORTS_READ]: "عرض التقارير",
  [PERMISSIONS.SYNC_READ]: "عرض المزامنة",
  [PERMISSIONS.SYNC_RUN]: "تشغيل المزامنة",
  [PERMISSIONS.AUDIT_READ]: "عرض سجل المراجعة"
};

export const roleKeyFromLegacyRole: Record<UserRoleKey, string> = {
  ADMIN: "admin",
  SUPERVISOR: "supervisor",
  EMPLOYEE: "employee"
};

export const defaultRolePermissions: Record<UserRoleKey, PermissionKey[]> = {
  ADMIN: Object.values(PERMISSIONS),
  SUPERVISOR: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.SUBSCRIBERS_READ,
    PERMISSIONS.SUBSCRIBERS_CREATE,
    PERMISSIONS.SUBSCRIBERS_UPDATE,
    PERMISSIONS.TRANSACTIONS_READ,
    PERMISSIONS.TRANSACTIONS_CREATE,
    PERMISSIONS.INVOICES_READ,
    PERMISSIONS.INVOICES_SEND,
    PERMISSIONS.IMPORTS_READ,
    PERMISSIONS.IMPORTS_CREATE,
    PERMISSIONS.TEMPLATES_MANAGE,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.SYNC_READ
  ],
  EMPLOYEE: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.SUBSCRIBERS_READ,
    PERMISSIONS.TRANSACTIONS_READ,
    PERMISSIONS.TRANSACTIONS_CREATE,
    PERMISSIONS.INVOICES_READ
  ]
};

type RolePermissionNode = {
  permission: { key: string; active?: boolean };
};

type UserRoleNode = {
  role: {
    active?: boolean;
    permissions?: RolePermissionNode[];
  };
};

type PermissionAwareUser = {
  role: UserRoleKey;
  userRoles?: UserRoleNode[];
};

export function getPermissionSetFromUser(user: PermissionAwareUser | null | undefined) {
  const set = new Set<PermissionKey>();
  if (!user) return set;

  for (const permission of defaultRolePermissions[user.role] ?? []) {
    set.add(permission);
  }

  for (const userRole of user.userRoles ?? []) {
    if (userRole.role.active === false) continue;
    for (const rolePermission of userRole.role.permissions ?? []) {
      if (rolePermission.permission.active === false) continue;
      set.add(rolePermission.permission.key as PermissionKey);
    }
  }

  return set;
}

export function hasPermissionFromUser(
  user: PermissionAwareUser | null | undefined,
  permission: PermissionKey
) {
  return getPermissionSetFromUser(user).has(permission);
}
