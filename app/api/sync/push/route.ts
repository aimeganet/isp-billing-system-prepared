import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Payload = {
  entityType: string;
  entityId: string;
  operation: string;
  payload: Record<string, unknown>;
};

async function deleteEntity(entityType: string, entityId: string) {
  try {
    switch (entityType) {
      case "subscriber":
        await prisma.subscriber.delete({ where: { id: entityId } });
        break;
      case "subscriberContact":
        await prisma.subscriberContact.delete({ where: { id: entityId } });
        break;
      case "employee":
        await prisma.employee.delete({ where: { id: entityId } });
        break;
      case "walletProvider":
        await prisma.walletProvider.delete({ where: { id: entityId } });
        break;
      case "packagePlan":
        await prisma.packagePlan.delete({ where: { id: entityId } });
        break;
      case "transaction":
        await prisma.transaction.delete({ where: { id: entityId } });
        break;
      case "transactionAttachment":
        await prisma.transactionAttachment.delete({ where: { id: entityId } });
        break;
      case "invoice":
        await prisma.invoice.delete({ where: { id: entityId } });
        break;
      case "invoiceItem":
        await prisma.invoiceItem.delete({ where: { id: entityId } });
        break;
      case "messageTemplate":
        await prisma.messageTemplate.delete({ where: { id: entityId } });
        break;
      case "user":
        await prisma.user.delete({ where: { id: entityId } });
        break;
      case "usageLog":
        await prisma.usageLog.delete({ where: { id: entityId } });
        break;
      case "messageLog":
        await prisma.messageLog.delete({ where: { id: entityId } });
        break;
      default:
        break;
    }
  } catch {
    // ignore missing records
  }
}

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-sync-secret") ?? "";
  if ((process.env.SYNC_SHARED_SECRET ?? "") && secret !== process.env.SYNC_SHARED_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as Payload;

  try {
    if (body.operation === "DELETE") {
      await deleteEntity(body.entityType, body.entityId);
      return NextResponse.json({ ok: true });
    }

    switch (body.entityType) {
      case "subscriber":
        await prisma.subscriber.upsert({
          where: { id: body.entityId },
          update: body.payload as never,
          create: body.payload as never
        });
        break;
      case "subscriberContact":
        await prisma.subscriberContact.upsert({
          where: { id: body.entityId },
          update: body.payload as never,
          create: body.payload as never
        });
        break;
      case "employee":
        await prisma.employee.upsert({
          where: { id: body.entityId },
          update: body.payload as never,
          create: body.payload as never
        });
        break;
      case "walletProvider":
        await prisma.walletProvider.upsert({
          where: { id: body.entityId },
          update: body.payload as never,
          create: body.payload as never
        });
        break;
      case "packagePlan":
        await prisma.packagePlan.upsert({
          where: { id: body.entityId },
          update: body.payload as never,
          create: body.payload as never
        });
        break;
      case "transaction":
        await prisma.transaction.upsert({
          where: { id: body.entityId },
          update: body.payload as never,
          create: body.payload as never
        });
        break;
      case "transactionAttachment":
        await prisma.transactionAttachment.upsert({
          where: { id: body.entityId },
          update: body.payload as never,
          create: body.payload as never
        });
        break;
      case "invoice":
        await prisma.invoice.upsert({
          where: { id: body.entityId },
          update: body.payload as never,
          create: body.payload as never
        });
        break;
      case "invoiceItem":
        await prisma.invoiceItem.upsert({
          where: { id: body.entityId },
          update: body.payload as never,
          create: body.payload as never
        });
        break;
      case "messageTemplate":
        await prisma.messageTemplate.upsert({
          where: { id: body.entityId },
          update: body.payload as never,
          create: body.payload as never
        });
        break;
      case "user":
        await prisma.user.upsert({
          where: { id: body.entityId },
          update: body.payload as never,
          create: body.payload as never
        });
        break;
      case "usageLog":
        await prisma.usageLog.upsert({
          where: { id: body.entityId },
          update: body.payload as never,
          create: body.payload as never
        });
        break;
      case "messageLog":
        await prisma.messageLog.upsert({
          where: { id: body.entityId },
          update: body.payload as never,
          create: body.payload as never
        });
        break;
      default:
        break;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown sync error" },
      { status: 500 }
    );
  }
}
