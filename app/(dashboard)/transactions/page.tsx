import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { getPaymentMethodsByUser } from "@/lib/db/queries/payment-methods";
import { getCategoriesByUser } from "@/lib/db/queries/categories";
import { getTransactionsByUser, getTransactionsCount } from "@/lib/db/queries/transactions";
import TransactionTable from "@/components/transactions/transaction-table";
import { authOptions } from "@/lib/auth/config";

const PAGE_SIZE = 50;

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const currentPage = parseInt(searchParams.page || "1");
  const offset = (currentPage - 1) * PAGE_SIZE;

  const [paymentMethods, categories, transactions, totalCount] = await Promise.all([
    getPaymentMethodsByUser(session.user.id),
    getCategoriesByUser(session.user.id),
    getTransactionsByUser(session.user.id, PAGE_SIZE, offset),
    getTransactionsCount(session.user.id),
  ]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Transactions</h1>
      
      <TransactionTable
        initialTransactions={transactions}
        paymentMethods={paymentMethods}
        categories={categories}
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
      />
    </div>
  );
}