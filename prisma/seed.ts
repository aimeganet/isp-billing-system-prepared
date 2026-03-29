import { hashSync } from "bcryptjs";
import { PrismaClient, MessageChannel, UserRoleKey } from "@prisma/client";

const prisma = new PrismaClient();

// Next: Remove DATABASE_URL to get the seed running
// For now, let's use migration instead

const permissionGroups = [
  ["dashboard.view", "عرض لوحة التحكم"],
  ["subscribers.read", "عرض المشتركين"],
  ["subscribers.create", "إضافة مشترك"],
  ["subscribers.update", "تعديل مشترك"],
  ["subscribers.delete", "حذف مشترك"],
  ["transactions.read", "عرض العمليات"],
  ["transactions.create", "إضافة عملية"],
  ["transactions.update", "تعديل عملية"],
  ["transactions.delete", "حذف عملية"],
  ["invoices.read", "عرض الفواتير"],
  ["invoices.send", "إرسال الفواتير"],
  ["imports.read", "عرض الاستيراد"],
  ["imports.create", "استيراد ملفات"],
  ["templates.manage", "إدارة قوالب الرسائل"],
  ["settings.read", "عرض الإعدادات"],
  ["settings.update", "تعديل الإعدادات"],
  ["users.read", "عرض المستخدمين"],
  ["users.create", "إضافة مستخدم"],
  ["users.update", "تعديل مستخدم"],
  ["users.delete", "حذف مستخدم"],
  ["roles.read", "عرض الأدوار"],
  ["roles.update", "تعديل الأدوار والصلاحيات"],
  ["employees.manage", "إدارة الموظفين"],
  ["wallets.manage", "إدارة المحافظ"],
  ["packages.manage", "إدارة الباقات"],
  ["reports.read", "عرض التقارير"],
  ["sync.read", "عرض المزامنة"],
  ["sync.run", "تشغيل المزامنة"],
  ["audit.read", "عرض سجل المراجعة"]
] as const;

const rolePermissions = {
  admin: permissionGroups.map(([key]) => key),
  supervisor: [
    "dashboard.view",
    "subscribers.read",
    "subscribers.create",
    "subscribers.update",
    "transactions.read",
    "transactions.create",
    "invoices.read",
    "invoices.send",
    "imports.read",
    "imports.create",
    "templates.manage",
    "reports.read",
    "sync.read"
  ],
  employee: [
    "dashboard.view",
    "subscribers.read",
    "transactions.read",
    "transactions.create",
    "invoices.read"
  ]
} as const;

async function ensureRoles() {
  const roles = [
    ["admin", "مدير النظام", true],
    ["supervisor", "مشرف", true],
    ["employee", "موظف", true]
  ] as const;

  for (const [key, name, isSystem] of roles) {
    await prisma.role.upsert({
      where: { key },
      update: { name, isSystem, active: true },
      create: { key, name, isSystem, active: true }
    });
  }
}

async function ensurePermissions() {
  for (const [key, name] of permissionGroups) {
    await prisma.permission.upsert({
      where: { key },
      update: { name, active: true, isSystem: true },
      create: { key, name, active: true, isSystem: true }
    });
  }
}

async function connectRolePermissions() {
  const roles = await prisma.role.findMany();
  const permissions = await prisma.permission.findMany();
  const roleMap = new Map(roles.map((role) => [role.key, role]));
  const permissionMap = new Map(permissions.map((permission) => [permission.key, permission]));

  for (const [roleKey, keys] of Object.entries(rolePermissions)) {
    const role = roleMap.get(roleKey);
    if (!role) continue;

    for (const key of keys) {
      const permission = permissionMap.get(key);
      if (!permission) continue;

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id
          }
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: permission.id
        }
      });
    }
  }
}

async function main() {
  await ensureRoles();
  await ensurePermissions();
  await connectRolePermissions();

  const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || "admin@local.test";
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || "ChangeMe123!";

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: UserRoleKey.ADMIN,
      active: true,
      passwordHash: hashSync(adminPassword, 10)
    },
    create: {
      name: "Administrator",
      email: adminEmail,
      role: UserRoleKey.ADMIN,
      active: true,
      passwordHash: hashSync(adminPassword, 10)
    }
  });

  const adminRole = await prisma.role.findUnique({ where: { key: "admin" } });
  if (adminRole) {
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: adminUser.id,
          roleId: adminRole.id
        }
      },
      update: {},
      create: {
        userId: adminUser.id,
        roleId: adminRole.id
      }
    });
  }

  // --- تحديث قائمة الموظفين المطلوبة (6 موظفين حصراً) ---
  const employees = [
    ["أحمد نور", "ahmed-nouer", "Admin"],
    ["محمود النحاس", "mahmoud-elnhas", "Supervisor"],
    ["كاش", "cash-operator", "Cashier"],
    ["الدسوقي", "desouky", "Cashier"],
    ["الزلزال", "el-zelzal", "Cashier"],
    ["ربيع ماهر", "rabee-maher", "Cashier"]
  ] as const;

  for (const [name, slug, roleLabel] of employees) {
    await prisma.employee.upsert({
      where: { slug },
      update: { name, roleLabel, active: true },
      create: { name, slug, roleLabel, active: true }
    });
  }

  const wallets = [
    ["Vodafone Cash", "vodafone-cash"],
    ["InstaPay", "instapay"],
    ["Fawry", "fawry"]
  ] as const;

  for (const [name, code] of wallets) {
    await prisma.walletProvider.upsert({
      where: { code },
      update: { name, active: true, requiresScreenshot: true },
      create: { name, code, active: true, requiresScreenshot: true }
    });
  }

  const packages = [
    ["4 جيجا", "P4", 4, 30, 100],
    ["10 جيجا", "P10", 10, 30, 200],
    ["20 جيجا", "P20", 20, 30, 350],
    ["باقة إضافية 5ج", "EXTRA5", 5, 30, 120]
  ] as const;

  for (const [name, code, gigabytes, durationDays, price] of packages) {
    await prisma.packagePlan.upsert({
      where: { code },
      update: { name, gigabytes: Number(gigabytes), durationDays: Number(durationDays), price: Number(price), active: true },
      create: {
        name,
        code,
        gigabytes: Number(gigabytes),
        durationDays: Number(durationDays),
        price: Number(price),
        active: true
      }
    });
  }

  const settings = [
    ["usePhoneAsIdentifier", "false", "Use phone as the visible subscriber code"],
    ["autoSendInvoices", "false", "Send invoice messages automatically after save"],
    ["allowManualSend", "true", "Allow manual sending from invoice detail page"],
    ["requireScreenshotForWallets", "true", "Require screenshot for wallet payments"],
    ["defaultMessageChannel", "WHATSAPP", "Default outbound channel"],
    ["currencySymbol", "جنيه", "Currency symbol for invoices"],
    ["currencyCode", "EGP", "ISO 4217 currency code"],
    ["enableSync", "false", "Enable local to remote sync"]
  ] as const;

  for (const [key, value, description] of settings) {
    await prisma.systemSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value, description }
    });
  }

  const templates = [
    {
      name: "فاتورة تجديد",
      slug: "invoice-renewal-whatsapp",
      channel: MessageChannel.WHATSAPP,
      eventKey: "invoice.renewal",
      content: "مرحبًا {name}، تم تجديد اشتراكك بنجاح. المبلغ: {amount} جنيه بواسطة {collector}. شكراً لتعاملك معنا.",
      active: true
    },
    {
      name: "تنبيه استهلاك",
      slug: "usage-alert-whatsapp",
      channel: MessageChannel.WHATSAPP,
      eventKey: "usage.alert",
      content: "عزيزي {name}، متبقي في رصيدك {remaining} جيجا بايت فقط. يرجى التجديد قريباً.",
      active: true
    }
  ];

  for (const template of templates) {
    await prisma.messageTemplate.upsert({
      where: { slug: template.slug },
      update: { content: template.content, active: true },
      create: template
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("✅ تم حقن البيانات (Seed) بنجاح!");
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });