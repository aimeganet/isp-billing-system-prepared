import { notFound } from "next/navigation";
import { WalletForm } from "@/components/forms/wallet-form";
import { PageHeading } from "@/components/shared/page-heading";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export default async function EditWalletPage({ params }: { params: { id: string } }) {
  await requirePermission(PERMISSIONS.WALLETS_MANAGE, "/admin/wallets");
  const wallet = await prisma.walletProvider.findUnique({ where: { id: params.id } });
  if (!wallet) notFound();

  return (
    <div className="space-y-6">
      <PageHeading title="تعديل المحفظة" description={wallet.name} />
      <WalletForm wallet={wallet} />
    </div>
  );
}
