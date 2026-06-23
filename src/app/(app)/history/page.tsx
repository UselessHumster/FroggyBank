import { Filter } from "lucide-react";
import { getCategories, getTransactions } from "@/lib/data/queries";
import { TransactionList } from "@/components/app/transaction-list";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default async function HistoryPage({
  searchParams
}: {
  searchParams: Promise<{ type?: "income" | "expense" | "conversion" | "all"; category?: string; from?: string; to?: string; q?: string }>;
}) {
  const params = await searchParams;
  const [categories, transactions] = await Promise.all([
    getCategories(),
    getTransactions(params)
  ]);

  return (
    <div className="space-y-5">
      <header>
        <p className="text-sm font-semibold text-muted-foreground">Все движения денег</p>
        <h1 className="text-3xl font-black">История</h1>
      </header>
      <Card className="p-4">
        <form className="grid gap-3 md:grid-cols-6">
          <Input name="q" placeholder="Поиск по комментарию" defaultValue={params.q ?? ""} className="md:col-span-2" />
          <Select name="type" defaultValue={params.type ?? "all"}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все типы</SelectItem>
              <SelectItem value="income">Доходы</SelectItem>
              <SelectItem value="expense">Расходы</SelectItem>
              <SelectItem value="conversion">Конвертации</SelectItem>
            </SelectContent>
          </Select>
          <Select name="category" defaultValue={params.category ?? "all"}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все категории</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>{category.emoji} {category.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input name="from" type="date" defaultValue={params.from ?? ""} />
          <Input name="to" type="date" defaultValue={params.to ?? ""} />
          <Button className="md:col-span-6"><Filter className="h-4 w-4" /> Применить</Button>
        </form>
      </Card>
      <TransactionList transactions={transactions} />
    </div>
  );
}
