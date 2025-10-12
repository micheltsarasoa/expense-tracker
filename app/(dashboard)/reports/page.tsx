import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/config";
import { getTransactionsByUser } from "@/lib/db/queries/transactions";
import { getCategoriesByUser } from "@/lib/db/queries/categories";
import ReportsView from "@/components/reports/reports-view";

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const [transactions, categories] = await Promise.all([
    getTransactionsByUser(session.user.id, 1000, 0), // Get more for better analysis
    getCategoriesByUser(session.user.id),
  ]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Reports & Analytics</h1>
      <ReportsView transactions={transactions} categories={categories} />
    </div>
  );
}