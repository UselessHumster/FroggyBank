import { Card } from "@/components/ui/card";
import { TransactionForm } from "@/components/app/transaction-form";
import { getCategories, getTransactions } from "@/lib/data/queries";

export default async function AddPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const params = await searchParams;
  const categories = await getCategories();
  const transactions = params.id ? await getTransactions({ limit: 200 }) : [];
  const transaction = transactions.find((item) => item.id === params.id);

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <header>
        <p className="text-sm font-semibold text-muted-foreground">Минимум действий</p>
        <h1 className="text-3xl font-black">{transaction ? "Редактировать" : "Новая операция"}</h1>
      </header>
      <Card className="p-5">
        <TransactionForm categories={categories} transaction={transaction} />
      </Card>
    </div>
  );
}
