import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { getPaymentMethodsByUser } from "@/lib/db/queries/payment-methods";
import { getCategoriesByUser } from "@/lib/db/queries/categories";
import { getTransactionsByUser, getTransactionsCount } from "@/lib/db/queries/transactions";
import TransactionTable from "@/components/transactions/transaction-table";
import { authOptions } from "@/lib/auth/config";

const PAGE_SIZE = 100;

type TransactionFilters = {
  type?: string;
  categoryId?: string;
  dateFrom?: Date;
  dateTo?: Date;
};

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ 
    page?: string;
    type?: string;
    category?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const params = await searchParams;

  // Pagination
  const currentPage = parseInt(params.page || "1");
  const offset = (currentPage - 1) * PAGE_SIZE;

  // Build filters object
  const filters: TransactionFilters = {};
  
  if (params.type && params.type !== "all") {
    filters.type = params.type;
  }
  
  if (params.category && params.category !== "all") {
    filters.categoryId = params.category;
  }
  
  if (params.dateFrom) {
    filters.dateFrom = new Date(params.dateFrom);
  }
  
  if (params.dateTo) {
    const endDate = new Date(params.dateTo);
    endDate.setHours(23, 59, 59, 999); // End of day
    filters.dateTo = endDate;
  }

  // Check if filters exist
  const hasFilters = Object.keys(filters).length > 0;

  // Fetch data with filters
  const [paymentMethods, categories, transactions, totalCount] = await Promise.all([
    getPaymentMethodsByUser(session.user.id),
    getCategoriesByUser(session.user.id),
    getTransactionsByUser(session.user.id, PAGE_SIZE, offset, hasFilters ? filters : undefined),
    getTransactionsCount(session.user.id, hasFilters ? filters : undefined),
  ]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground mb-6">Transactions</h1>

      <TransactionTable
        initialTransactions={transactions}
        paymentMethods={paymentMethods}
        categories={categories}
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        itemPerPage={PAGE_SIZE}
      />
    </div>
  );
}