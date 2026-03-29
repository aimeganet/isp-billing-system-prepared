"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { ActionState } from "@/lib/utils";
import { requireUser } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";

export async function updateMyProfileAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const currentUser = await requireUser();

  const name = String(formData.get("name") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (name.length < 2) {
    return {
      success: false,
      message: "الاسم يجب أن يكون حرفين على الأقل."
    };
  }

  if (password && password.length < 6) {
    return {
      success: false,
      message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل."
    };
  }

  if (password && password !== confirmPassword) {
    return {
      success: false,
      message: "تأكيد كلمة المرور غير مطابق."
    };
  }

  const data: { name: string; passwordHash?: string } = { name };
  if (password) {
    data.passwordHash = await hashPassword(password);
  }

  await prisma.user.update({
    where: { id: currentUser.id },
    data
  });

  await recordAudit("UPDATE_PROFILE", "user", currentUser.id, {
    name,
    passwordUpdated: Boolean(password)
  });

  revalidatePath("/profile");
  revalidatePath("/dashboard");

  return {
    success: true,
    message: password ? "تم تحديث الملف الشخصي وكلمة المرور." : "تم تحديث بيانات الملف الشخصي."
  };
}
