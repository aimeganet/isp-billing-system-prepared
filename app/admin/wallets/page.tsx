import Link from "next/link";
import { deleteWalletProviderAction } from "@/actions/admin";
import { WalletForm } from "@/components/forms/wallet-form";
import { PageHeading } from "@/components/shared/page-heading";
import { Card } from "@/components/ui/card";
import { Table, TD, TH } from "@/components/ui/table";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export default async function WalletsPage() {
  await requirePermission(PERMISSIONS.WALLETS_MANAGE, "/dashboard");
  const wallets = await prisma.walletProvider.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <PageHeading title="المحافظ الإلكترونية" description="المحافظ التي تُظهر زر رفع صورة عند استخدامها في الدفع." />
      <WalletForm />
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <thead>
              <tr>
                <TH>الاسم</TH>
                <TH>الكود</TH>
                <TH>يتطلب صورة</TH>
                <TH>الحالة</TH>
                <TH>إجراءات</TH>
              </tr>
            </thead>
            <tbody>
              {wallets.map((wallet) => (
                <tr key={wallet.id}>
                  <TD>{wallet.name}</TD>
                  <TD>{wallet.code}</TD>
                  <TD>{wallet.requiresScreenshot ? "نعم" : "لا"}</TD>
                  <TD>{wallet.active ? "نشطة" : "موقوفة"}</TD>
                  <TD>
                    <div className="flex gap-3">
                      <Link href={`/admin/wallets/${wallet.id}`} className="text-blue-600">تعديل</Link>
                      <form action={deleteWalletProviderAction}>
                        <input type="hidden" name="id" value={wallet.id} />
                        <button type="submit" className="text-red-600">حذف</button>
                      </form>
                    </div>
                  </TD>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
