import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authOptions } from "@/lib/auth/config";
import { getTransactionsByUser } from "@/lib/db/queries/transactions";
import { getPaymentMethodsByUser } from "@/lib/db/queries/payment-methods";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, DollarSign } from "lucide-react";
import { SpendingCharts } from "@/components/dashboard/spending-charts";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const [transactions, paymentMethods] = await Promise.all([
    getTransactionsByUser(session.user.id, 100, 0),
    getPaymentMethodsByUser(session.user.id),
  ]);

  // Calculate summary
  const totalIncome = transactions
    .filter((t: any) => t.type === "income")
    .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

  const totalExpense = transactions
    .filter((t: any) => t.type === "expense")
    .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

  const netIncome = totalIncome - totalExpense;

  // Calculate total balance
  const totalBalance = paymentMethods.reduce(
    (sum: number, pm: any) => sum + Number(pm.current_balance),
    0
  );

  // Recent 5 transactions
  const recentTransactions = transactions.slice(0, 5);

  // Calculate category breakdown for expenses
  const categoryBreakdown = transactions
    .filter((t: any) => t.type === "expense")
    .reduce((acc: any, t: any) => {
      const category = t.category_name || "Uncategorized";
      if (!acc[category]) {
        acc[category] = { name: category, value: 0, icon: t.category_icon };
      }
      acc[category].value += Number(t.amount);
      return acc;
    }, {});

  const categoryData = Object.values(categoryBreakdown).slice(0, 6) as Array<{name: string; value: number; icon?: string}>; // Top 6 categories

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome back! Here's your financial overview.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 border-0 shadow-md bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase">
                Total Balance
              </CardTitle>
              <div className="h-8 w-8 bg-primary/20 rounded-full flex items-center justify-center">
                <Wallet className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              ${totalBalance.toFixed(2)}
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-xs text-muted-foreground">Available funds</span>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 border-0 shadow-md bg-gradient-to-br from-green-500/5 via-green-500/10 to-green-500/5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase">
                Total Income
              </CardTitle>
              <div className="h-8 w-8 bg-green-500/20 rounded-full flex items-center justify-center">
                <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-500" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-500">
              ${totalIncome.toFixed(2)}
            </div>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-xs text-muted-foreground">This month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 border-0 shadow-md bg-gradient-to-br from-red-500/5 via-red-500/10 to-red-500/5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase">
                Total Expenses
              </CardTitle>
              <div className="h-8 w-8 bg-destructive/20 rounded-full flex items-center justify-center">
                <ArrowDownRight className="h-4 w-4 text-destructive" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              ${totalExpense.toFixed(2)}
            </div>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-xs text-muted-foreground">This month</span>
            </div>
          </CardContent>
        </Card>

        <Card className={`overflow-hidden hover:shadow-lg transition-all duration-200 border-0 shadow-md ${netIncome >= 0 ? 'bg-gradient-to-br from-green-500/5 via-green-500/10 to-green-500/5' : 'bg-gradient-to-br from-red-500/5 via-red-500/10 to-red-500/5'}`}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase">
                Net Income
              </CardTitle>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${netIncome >= 0 ? 'bg-green-500/20' : 'bg-destructive/20'}`}>
                <DollarSign className={`h-4 w-4 ${netIncome >= 0 ? 'text-green-600 dark:text-green-500' : 'text-destructive'}`} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netIncome >= 0 ? "text-green-600 dark:text-green-500" : "text-destructive"}`}>
              ${Math.abs(netIncome).toFixed(2)}
            </div>
            <div className="flex items-center gap-1 mt-2">
              {netIncome >= 0 ? (
                <>
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600 dark:text-green-500">Positive</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3 text-destructive" />
                  <span className="text-xs text-destructive">Negative</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <SpendingCharts categoryData={categoryData} totalExpense={totalExpense} />

      {/* Account Balances */}
      <Card className="mb-6 hover:shadow-lg transition-all duration-200 border-0 shadow-md">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary" />
              Account Balances
            </CardTitle>
            <Link href="/accounts">
              <Button variant="ghost" size="sm" className="text-xs hover:bg-primary/10 hover:text-primary">
                View All →
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {paymentMethods.map((pm: any) => (
              <div
                key={pm.id}
                className="group flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 hover:shadow-sm transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                    {pm.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{pm.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{pm.type.replace("_", " ")}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-foreground">${Number(pm.current_balance).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">Balance</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="hover:shadow-lg transition-all duration-200 border-0 shadow-md">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-primary" />
              Recent Transactions
            </CardTitle>
            <Link href="/transactions">
              <Button variant="ghost" size="sm" className="text-xs hover:bg-primary/10 hover:text-primary">
                View All →
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowUpRight className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">
                No transactions yet. Add your first transaction to get started!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentTransactions.map((t: any) => (
                <div
                  key={t.id}
                  className="group flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 hover:shadow-sm transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-lg group-hover:scale-110 transition-transform ${
                      t.type === "income" ? "bg-green-500/10" : "bg-red-500/10"
                    }`}>
                      {t.category_icon || t.payment_method_icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground truncate">
                          {t.category_name || "Transfer"}
                        </p>
                        {t.type === "income" ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-500">
                            Income
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-500">
                            Expense
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{t.description}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-muted-foreground">
                          {new Date(t.transaction_date).toLocaleDateString()}
                        </p>
                        <span className="text-muted-foreground">•</span>
                        <p className="text-xs text-muted-foreground">{t.payment_method_name}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className={`text-base font-bold ${
                      t.type === "income" ? "text-green-600 dark:text-green-500" : "text-destructive"
                    }`}>
                      {t.type === "income" ? "+" : "-"}${Number(t.amount).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}