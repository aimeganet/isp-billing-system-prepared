"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ActionState } from "@/lib/utils";
import { createSession, destroyCurrentSession, getCurrentUser } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import { recordAudit } from "@/lib/audit";

export async function loginAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return {
      success: false,
      message: "البريد الإلكتروني وكلمة المرور مطلوبان."
    };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.active) {
    return {
      success: false,
      message: "تعذر تسجيل الدخول. تحقق من البيانات أو حالة المستخدم."
    };
  }

  const validPassword = await verifyPassword(password, user.passwordHash);
  if (!validPassword) {
    await recordAudit("LOGIN_FAILED", "user", user.id, { email });
    return {
      success: false,
      message: "البريد الإلكتروني أو كلمة المرور غير صحيحين."
    };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() }
  });

  await createSession(user.id);
  await recordAudit("LOGIN_SUCCESS", "user", user.id, { email });

  redirect("/dashboard");
  return { success: true, message: "تم تسجيل الدخول." };
}

export async function logoutAction() {
  const user = await getCurrentUser();
  await destroyCurrentSession();
  if (user) {
    await recordAudit("LOGOUT", "user", user.id, {});
  }
  redirect("/login");
}
