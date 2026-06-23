import { format, isToday, isYesterday, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import type { Transaction } from "@/lib/types/database";
import { deleteTransaction } from "@/lib/actions/transactions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatMoney } from "@/lib/utils";

const accountLabels = {
  card: "Карта",
  cash: "Наличные"
};

function groupLabel(date: string) {
  const parsed = parseISO(date);
  if (isToday(parsed)) return "Сегодня";
  if (isYesterday(parsed)) return "Вчера";
  return format(parsed, "d MMMM yyyy", { locale: ru });
}

export function TransactionList({ transactions }: { transactions: Transaction[] }) {
  const groups = transactions.reduce<Record<string, Transaction[]>>((acc, transaction) => {
    const label = groupLabel(transaction.transaction_date);
    acc[label] = acc[label] ?? [];
    acc[label].push(transaction);
    return acc;
  }, {});

  if (!transactions.length) {
    return <Card className="p-8 text-center text-muted-foreground">Операций пока нет.</Card>;
  }

  return (
    <div className="space-y-6">
      {Object.entries(groups).map(([label, rows]) => (
        <section key={label} className="space-y-3">
          <h2 className="px-1 text-sm font-bold uppercase tracking-wide text-muted-foreground">{label}</h2>
          <div className="space-y-2">
            {rows.map((transaction) => (
              <Card key={transaction.id} className="flex items-center gap-3 p-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-muted text-2xl">
                  {transaction.type === "conversion" ? "↔" : transaction.categories?.emoji ?? "💸"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">
                    {transaction.type === "conversion"
                      ? `${accountLabels[transaction.from_account ?? "cash"]} -> ${accountLabels[transaction.to_account ?? "card"]}`
                      : transaction.categories?.name ?? "Без категории"}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {transaction.note || (transaction.type === "conversion" ? "Конвертация" : accountLabels[transaction.account]) || format(parseISO(transaction.transaction_date), "d MMMM", { locale: ru })}
                  </p>
                  {transaction.tip_transaction ? (
                    <p className="mt-1 truncate text-sm font-semibold text-destructive">
                      -{formatMoney(Number(transaction.tip_transaction.amount))} Чаевые · {accountLabels[transaction.tip_transaction.account]}
                    </p>
                  ) : null}
                </div>
                <div className="text-right">
                  <p className={transaction.type === "income" ? "font-black text-primary" : transaction.type === "expense" ? "font-black text-destructive" : "font-black text-foreground"}>
                    {transaction.type === "income" ? "+" : transaction.type === "expense" ? "-" : ""}{formatMoney(Number(transaction.amount))}
                  </p>
                  <div className="mt-1 flex justify-end gap-1">
                    <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                      <Link href={`/add?id=${transaction.id}`} aria-label="Редактировать">
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <form action={deleteTransaction}>
                      <input type="hidden" name="id" value={transaction.id} />
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" aria-label="Удалить">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
