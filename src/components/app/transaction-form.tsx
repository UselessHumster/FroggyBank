"use client";

import { useMemo, useState } from "react";
import type { Category, MoneyAccount, Transaction, TransactionType } from "@/lib/types/database";
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
  const [conversionFrom, setConversionFrom] = useState<MoneyAccount>(transaction?.from_account ?? "card");
  const [tipsEnabled, setTipsEnabled] = useState(Boolean(transaction?.tip_transaction));
  const available = useMemo(
    () => categories.filter((category) => !category.system_key && type !== "conversion" && (category.type === type || category.type === "both")),
    [categories, type]
  );
  const conversionTo: MoneyAccount = conversionFrom === "cash" ? "card" : "cash";
  const defaultAccount = transaction?.account ?? "card";

  return (
    <form action={upsertTransaction} className="space-y-5">
      {transaction ? <input type="hidden" name="id" value={transaction.id} /> : null}
      <div className="grid grid-cols-3 gap-2 rounded-2xl bg-muted p-1">
        <label className="cursor-pointer">
          <input className="peer sr-only" type="radio" name="type" value="expense" checked={type === "expense"} onChange={() => setType("expense")} />
          <span className="block rounded-xl px-4 py-3 text-center text-sm font-bold text-muted-foreground peer-checked:bg-card peer-checked:text-destructive peer-checked:shadow-sm">Расход</span>
        </label>
        <label className="cursor-pointer">
          <input className="peer sr-only" type="radio" name="type" value="income" checked={type === "income"} onChange={() => setType("income")} />
          <span className="block rounded-xl px-4 py-3 text-center text-sm font-bold text-muted-foreground peer-checked:bg-card peer-checked:text-primary peer-checked:shadow-sm">Доход</span>
        </label>
        <label className="cursor-pointer">
          <input className="peer sr-only" type="radio" name="type" value="conversion" checked={type === "conversion"} onChange={() => setType("conversion")} />
          <span className="block rounded-xl px-2 py-3 text-center text-sm font-bold text-muted-foreground peer-checked:bg-card peer-checked:text-foreground peer-checked:shadow-sm">Конвертация</span>
        </label>
      </div>
      <div className="space-y-2">
        <Label htmlFor="amount">Сумма</Label>
        <Input id="amount" name="amount" type="number" min="1" step="1" placeholder="0 ₽" defaultValue={transaction?.amount ?? ""} required className="h-16 text-3xl font-black" />
      </div>
      {type === "conversion" ? (
        <div className="space-y-2">
          <Label>Направление</Label>
          <input type="hidden" name="from_account" value={conversionFrom} />
          <input type="hidden" name="to_account" value={conversionTo} />
          <Select value={conversionFrom} onValueChange={(value) => setConversionFrom(value as MoneyAccount)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="card">{"Карта -> Наличные"}</SelectItem>
              <SelectItem value="cash">{"Наличные -> Карта"}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <Label>Категория</Label>
            <Select key={type} name="category_id" defaultValue={available.some((category) => category.id === transaction?.category_id) ? transaction?.category_id ?? undefined : available[0]?.id} required>
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
            <Label>Счет</Label>
            <Select name="account" defaultValue={defaultAccount}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="card">Карта</SelectItem>
                <SelectItem value="cash">Наличные</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}
      {type === "expense" ? (
        <div className="space-y-3 rounded-2xl border border-border/70 p-4">
          <label className="flex items-center gap-3 text-sm font-semibold">
            <input name="tip_enabled" type="checkbox" checked={tipsEnabled} onChange={(event) => setTipsEnabled(event.target.checked)} className="h-4 w-4 accent-primary" />
            Чаевые
          </label>
          {tipsEnabled ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tip_amount">Сумма чаевых</Label>
                <Input id="tip_amount" name="tip_amount" type="number" min="1" step="1" defaultValue={transaction?.tip_transaction?.amount ?? ""} required={tipsEnabled} />
              </div>
              <div className="space-y-2">
                <Label>Списать чаевые</Label>
                <Select name="tip_account" defaultValue={transaction?.tip_transaction?.account ?? "cash"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Наличные</SelectItem>
                    <SelectItem value="card">Карта</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
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
