import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function recordAudit(
  action: string,
  entityType: string,
  entityId: string,
  payload?: unknown
) {
  const user = await getCurrentUser().catch(() => null);

  await prisma.auditLog.create({
    data: {
      userId: user?.id,
      action,
      entityType,
      entityId,
      payloadJson: payload ? JSON.stringify(payload) : null
    }
  });
}
