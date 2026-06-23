import { startOfMonth, subMonths, endOfMonth, subDays, startOfYear, format } from "date-fns";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Category, Period, Transaction, TransactionType } from "@/lib/types/database";
import type { WebAuthnCredentialRow } from "@/lib/webauthn";

export async function getUserContext() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

export async function getCategories() {
  const { supabase, user } = await getUserContext();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", user.id)
    .order("type")
    .order("name");
  return (data ?? []) as Category[];
}

export async function getWebAuthnCredentials() {
  const { supabase, user } = await getUserContext();
  const { data } = await supabase
    .from("webauthn_credentials")
    .select("id, credential_id, device_type, backed_up, created_at, last_used_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (data ?? []) as Pick<
    WebAuthnCredentialRow,
    "id" | "credential_id" | "device_type" | "backed_up" | "created_at" | "last_used_at"
  >[];
}

export async function getTransactions(params?: {
  type?: TransactionType | "all";
  category?: string;
  from?: string;
  to?: string;
  q?: string;
  limit?: number;
  includeChildren?: boolean;
}) {
  const { supabase, user } = await getUserContext();
  let query = supabase
    .from("transactions")
    .select("*, categories(id,name,emoji,type,system_key)")
    .eq("user_id", user.id)
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (params?.type && params.type !== "all") query = query.eq("type", params.type);
  if (params?.category && params.category !== "all") query = query.eq("category_id", params.category);
  if (!params?.includeChildren) query = query.is("parent_transaction_id", null);
  if (params?.from) query = query.gte("transaction_date", params.from);
  if (params?.to) query = query.lte("transaction_date", params.to);
  if (params?.q) query = query.ilike("note", `%${params.q}%`);
  if (params?.limit) query = query.limit(params.limit);

  const { data } = await query;
  const transactions = (data ?? []) as Transaction[];

  if (params?.includeChildren || !transactions.length) return transactions;

  const parentIds = transactions.map((transaction) => transaction.id);
  const { data: tips } = await supabase
    .from("transactions")
    .select("*, categories(id,name,emoji,type,system_key)")
    .eq("user_id", user.id)
    .in("parent_transaction_id", parentIds);

  const tipsByParent = new Map((tips ?? []).map((tip) => [(tip as Transaction).parent_transaction_id, tip as Transaction]));
  return transactions.map((transaction) => ({
    ...transaction,
    tip_transaction: tipsByParent.get(transaction.id) ?? null
  }));
}

function periodRange(period: Period) {
  const now = new Date();
  if (period === "current_month") return { from: startOfMonth(now), to: endOfMonth(now) };
  if (period === "previous_month") {
    const previous = subMonths(now, 1);
    return { from: startOfMonth(previous), to: endOfMonth(previous) };
  }
  return {};
}

export async function getSummary(period: Period = "current_month") {
  const { supabase, user } = await getUserContext();
  const range = periodRange(period);
  let query = supabase.from("transactions").select("amount,type,account,from_account,to_account,transaction_date").eq("user_id", user.id);
  if (range.from) query = query.gte("transaction_date", format(range.from, "yyyy-MM-dd"));
  if (range.to) query = query.lte("transaction_date", format(range.to, "yyyy-MM-dd"));
  const { data } = await query;
  const rows = (data ?? []) as Array<Pick<Transaction, "amount" | "type" | "account" | "from_account" | "to_account">>;
  const income = rows.filter((row) => row.type === "income").reduce((sum, row) => sum + Number(row.amount), 0);
  const expense = rows.filter((row) => row.type === "expense").reduce((sum, row) => sum + Number(row.amount), 0);
  const accounts = rows.reduce(
    (totals, row) => {
      const amount = Number(row.amount);
      if (row.type === "income") totals[row.account] += amount;
      if (row.type === "expense") totals[row.account] -= amount;
      if (row.type === "conversion" && row.from_account && row.to_account) {
        totals[row.from_account] -= amount;
        totals[row.to_account] += amount;
      }
      return totals;
    },
    { card: 0, cash: 0 }
  );

  return { income, expense, balance: accounts.card + accounts.cash, cardBalance: accounts.card, cashBalance: accounts.cash };
}

export async function getCategoryAnalytics() {
  const transactions = await getTransactions({ type: "expense", includeChildren: true });
  const totals = new Map<string, { name: string; emoji: string; amount: number }>();

  for (const transaction of transactions) {
    const category = transaction.categories;
    const key = category?.id ?? "unknown";
    const current = totals.get(key) ?? { name: category?.name ?? "Без категории", emoji: category?.emoji ?? "•", amount: 0 };
    current.amount += Number(transaction.amount);
    totals.set(key, current);
  }

  const total = Array.from(totals.values()).reduce((sum, item) => sum + item.amount, 0);
  return Array.from(totals.values())
    .map((item) => ({ ...item, percent: total ? Math.round((item.amount / total) * 100) : 0 }))
    .sort((a, b) => b.amount - a.amount);
}

export async function getChartSeries(period: "7d" | "30d" | "month" | "year") {
  const now = new Date();
  const from =
    period === "7d"
      ? subDays(now, 6)
      : period === "30d"
        ? subDays(now, 29)
        : period === "month"
          ? startOfMonth(now)
          : startOfYear(now);

  const transactions = await getTransactions({ from: format(from, "yyyy-MM-dd"), to: format(now, "yyyy-MM-dd"), includeChildren: true });
  const map = new Map<string, { date: string; Доходы: number; Расходы: number }>();

  for (const transaction of transactions) {
    if (transaction.type === "conversion") continue;
    const key = transaction.transaction_date;
    const row = map.get(key) ?? { date: key, Доходы: 0, Расходы: 0 };
    if (transaction.type === "income") row.Доходы += Number(transaction.amount);
    if (transaction.type === "expense") row.Расходы += Number(transaction.amount);
    map.set(key, row);
  }

  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}
