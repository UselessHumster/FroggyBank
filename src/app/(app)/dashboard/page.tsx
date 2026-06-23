import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TransactionList } from "@/components/app/transaction-list";
import { getSummary, getTransactions } from "@/lib/data/queries";
import { formatMoney } from "@/lib/utils";

type Summary = {
  income: number;
  expense: number;
  balance: number;
  cardBalance: number;
  cashBalance: number;
};

export default async function DashboardPage() {
  const [allTime, currentMonth, previousMonth, recent] = await Promise.all([
    getSummary("all_time"),
    getSummary("current_month"),
    getSummary("previous_month"),
    getTransactions({ limit: 5 })
  ]);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-muted-foreground">Добро пожаловать</p>
          <h1 className="text-2xl font-black">Ваши финансы</h1>
        </div>
        <Button asChild size="icon" className="rounded-2xl">
          <Link href="/add" aria-label="Добавить операцию"><Plus className="h-5 w-5" /></Link>
        </Button>
      </header>

      <Card className="overflow-hidden border-0 bg-primary p-6 text-primary-foreground shadow-glow">
        <p className="text-sm font-semibold text-primary-foreground/70">Текущий баланс</p>
        <p className="mt-3 break-words text-5xl font-black tracking-normal">{formatMoney(allTime.balance)}</p>
        <p className="mt-2 text-sm font-semibold text-primary-foreground/75">
          Карта: {formatMoney(allTime.cardBalance)} · Наличные: {formatMoney(allTime.cashBalance)}
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/14 p-4">
            <ArrowUpRight className="mb-2 h-5 w-5" />
            <p className="text-xs text-primary-foreground/70">Доходы</p>
            <p className="text-lg font-black">{formatMoney(allTime.income)}</p>
          </div>
          <div className="rounded-2xl bg-white/14 p-4">
            <ArrowDownRight className="mb-2 h-5 w-5" />
            <p className="text-xs text-primary-foreground/70">Расходы</p>
            <p className="text-lg font-black">{formatMoney(allTime.expense)}</p>
          </div>
        </div>
      </Card>

      <section className="grid gap-3 md:grid-cols-3">
        <SummaryCard title="Текущий месяц" summary={currentMonth} />
        <SummaryCard title="Прошлый месяц" summary={previousMonth} />
        <SummaryCard title="Все время" summary={allTime} />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black">Последние операции</h2>
          <Button asChild variant="ghost" size="sm"><Link href="/history">Все</Link></Button>
        </div>
        <TransactionList transactions={recent} />
      </section>
    </div>
  );
}

function SummaryCard({ title, summary }: { title: string; summary: Summary }) {
  return (
    <Card className="p-5">
      <p className="text-sm font-semibold text-muted-foreground">{title}</p>
      <p className="mt-2 text-2xl font-black">{formatMoney(summary.balance)}</p>
      <div className="mt-4 flex justify-between text-sm">
        <span className="text-primary">+{formatMoney(summary.income)}</span>
        <span className="text-destructive">-{formatMoney(summary.expense)}</span>
      </div>
    </Card>
  );
}
