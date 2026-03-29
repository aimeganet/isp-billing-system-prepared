"use server";

import { revalidatePath } from "next/cache";
import { retryPendingSyncItems } from "@/lib/sync";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { recordAudit } from "@/lib/audit";

export async function retrySyncQueueAction() {
  await requirePermission(PERMISSIONS.SYNC_RUN, "/dashboard");
  await retryPendingSyncItems();
  await recordAudit("RETRY", "syncQueue", "bulk", {});
  revalidatePath("/sync");
}
