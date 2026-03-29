import { SyncStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getBooleanSetting } from "@/lib/settings";

export async function enqueueSync(entityType: string, entityId: string, operation: string, payload: unknown) {
  const enabled = await getBooleanSetting("enableSync", process.env.ENABLE_SYNC === "true");

  const queueItem = await prisma.syncQueue.create({
    data: {
      entityType,
      entityId,
      operation,
      payloadJson: JSON.stringify(payload),
      status: enabled ? SyncStatus.PENDING : SyncStatus.FAILED,
      lastError: enabled ? undefined : "SYNC_DISABLED"
    }
  });

  if (enabled) {
    await tryPushSyncItem(queueItem.id);
  }

  return queueItem;
}

export async function tryPushSyncItem(queueId: string) {
  const queueItem = await prisma.syncQueue.findUnique({ where: { id: queueId } });
  if (!queueItem) return null;

  const remoteUrl = process.env.REMOTE_SYNC_URL;
  const secret = process.env.SYNC_SHARED_SECRET;

  if (!remoteUrl) {
    return prisma.syncQueue.update({
      where: { id: queueId },
      data: {
        status: SyncStatus.FAILED,
        lastError: "REMOTE_SYNC_URL_MISSING",
        attempts: { increment: 1 }
      }
    });
  }

  try {
    const response = await fetch(`${remoteUrl.replace(/\/$/, "")}/api/sync/push`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-sync-secret": secret ?? ""
      },
      body: JSON.stringify({
        id: queueItem.id,
        entityType: queueItem.entityType,
        entityId: queueItem.entityId,
        operation: queueItem.operation,
        payload: JSON.parse(queueItem.payloadJson)
      })
    });

    if (!response.ok) {
      throw new Error(`Remote sync failed with ${response.status}`);
    }

    return prisma.syncQueue.update({
      where: { id: queueId },
      data: {
        status: SyncStatus.SYNCED,
        syncedAt: new Date(),
        attempts: { increment: 1 },
        lastError: null
      }
    });
  } catch (error) {
    return prisma.syncQueue.update({
      where: { id: queueId },
      data: {
        status: SyncStatus.FAILED,
        attempts: { increment: 1 },
        lastError: error instanceof Error ? error.message : "SYNC_ERROR"
      }
    });
  }
}

export async function retryPendingSyncItems() {
  const items = await prisma.syncQueue.findMany({
    where: {
      status: { in: [SyncStatus.PENDING, SyncStatus.FAILED] }
    },
    orderBy: { createdAt: "asc" },
    take: 50
  });

  for (const item of items) {
    await tryPushSyncItem(item.id);
  }

  return items.length;
}
