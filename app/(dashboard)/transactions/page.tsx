import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { getPaymentMethodsByUser } from "@/lib/db/queries/payment-methods";
import { getCategoriesByUser } from "@/lib/db/queries/categories";
import { getTransactionsByUser } from "@/lib/db/queries/transactions";
import TransactionTable from "@/components/transactions/transaction-table";
import { authOptions } from "@/lib/auth/config";

export default async function TransactionsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const [paymentMethods, categories, transactions] = await Promise.all([
    getPaymentMethodsByUser(session.user.id),
    getCategoriesByUser(session.user.id),
    getTransactionsByUser(session.user.id, 100, 0),
  ]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Transactions</h1>
      
      <TransactionTable
        initialTransactions={transactions}
        paymentMethods={paymentMethods}
        categories={categories}
      />
    </div>
  );
}