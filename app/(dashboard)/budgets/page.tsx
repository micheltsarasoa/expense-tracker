import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/config";
import { getBudgetsByUser } from "@/lib/db/queries/budgets";
import { getCategoriesByUser } from "@/lib/db/queries/categories";
import BudgetList from "@/components/budgets/budget-list";

export default async function BudgetsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const [budgets, categories] = await Promise.all([
    getBudgetsByUser(session.user.id),
    getCategoriesByUser(session.user.id),
  ]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Budgets</h1>
      <BudgetList initialBudgets={budgets} categories={categories} />
    </div>
  );
}