"use client";

import { useMemo, useState } from "react";
import type { Category, Transaction, TransactionType } from "@/lib/types/database";
import { upsertTransaction } from "@/lib/actions/transactions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toDateInputValue } from "@/lib/utils";

export function TransactionForm({
  categories,
  transaction
}: {
  categories: Category[];
  transaction?: Transaction;
}) {
  const [type, setType] = useState<TransactionType>(transaction?.type ?? "expense");
  const available = useMemo(
    () => categories.filter((category) => category.type === type || category.type === "both"),
    [categories, type]
  );

  return (
    <form action={upsertTransaction} className="space-y-5">
      {transaction ? <input type="hidden" name="id" value={transaction.id} /> : null}
      <div className="grid grid-cols-2 gap-3 rounded-2xl bg-muted p-1">
        <label className="cursor-pointer">
          <input className="peer sr-only" type="radio" name="type" value="expense" checked={type === "expense"} onChange={() => setType("expense")} />
          <span className="block rounded-xl px-4 py-3 text-center text-sm font-bold text-muted-foreground peer-checked:bg-card peer-checked:text-destructive peer-checked:shadow-sm">Расход</span>
        </label>
        <label className="cursor-pointer">
          <input className="peer sr-only" type="radio" name="type" value="income" checked={type === "income"} onChange={() => setType("income")} />
          <span className="block rounded-xl px-4 py-3 text-center text-sm font-bold text-muted-foreground peer-checked:bg-card peer-checked:text-primary peer-checked:shadow-sm">Доход</span>
        </label>
      </div>
      <div className="space-y-2">
        <Label htmlFor="amount">Сумма</Label>
        <Input id="amount" name="amount" type="number" min="1" step="1" placeholder="0 ₽" defaultValue={transaction?.amount ?? ""} required className="h-16 text-3xl font-black" />
      </div>
      <div className="space-y-2">
        <Label>Категория</Label>
        <Select key={type} name="category_id" defaultValue={available.some((category) => category.id === transaction?.category_id) ? transaction?.category_id : available[0]?.id} required>
          <SelectTrigger>
            <SelectValue placeholder="Выберите категорию" />
          </SelectTrigger>
          <SelectContent>
            {available.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.emoji} {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="transaction_date">Дата</Label>
        <Input id="transaction_date" name="transaction_date" type="date" defaultValue={transaction?.transaction_date ?? toDateInputValue()} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="note">Комментарий</Label>
        <Textarea id="note" name="note" placeholder="Например: кофе перед встречей" defaultValue={transaction?.note ?? ""} />
      </div>
      <Button className="w-full" size="lg">{transaction ? "Сохранить" : "Добавить операцию"}</Button>
    </form>
  );
}
