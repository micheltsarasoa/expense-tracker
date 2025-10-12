import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { getPaymentMethodsByUser } from "@/lib/db/queries/payment-methods";
import { authOptions } from "@/lib/auth/config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AddAccountDialog from "@/components/accounts/add-account-dialog";

export default async function AccountsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const paymentMethods = await getPaymentMethodsByUser(session.user.id);

  const totalBalance = paymentMethods.reduce(
    (sum: number, pm: any) => sum + Number(pm.current_balance),
    0
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Accounts</h1>
          <p className="text-gray-600 mt-1">
            Total Net Worth: <span className="font-bold text-blue-600">${totalBalance.toFixed(2)}</span>
          </p>
        </div>
        <AddAccountDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {paymentMethods.map((pm: any) => (
          <Card key={pm.id}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{pm.icon}</span>
                <div className="flex-1">
                  <CardTitle className="text-lg">{pm.name}</CardTitle>
                  <p className="text-sm text-gray-500 capitalize">
                    {pm.type.replace("_", " ")}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Current Balance</p>
                  <p className="text-2xl font-bold">${Number(pm.current_balance).toFixed(2)}</p>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-xs text-gray-500">
                    Initial: ${Number(pm.initial_balance).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Created: {new Date(pm.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {paymentMethods.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">No accounts yet</p>
            <AddAccountDialog />
          </CardContent>
        </Card>
      )}
    </div>
  );
}