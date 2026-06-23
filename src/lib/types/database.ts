export type TransactionType = "income" | "expense" | "conversion";
export type CategoryType = "income" | "expense" | "both";
export type MoneyAccount = "card" | "cash";
export type SystemCategoryKey = "tips";

export type Category = {
  id: string;
  user_id: string;
  name: string;
  emoji: string;
  type: CategoryType;
  system_key: SystemCategoryKey | null;
  created_at: string;
};

export type Transaction = {
  id: string;
  user_id: string;
  category_id: string | null;
  amount: number;
  type: TransactionType;
  account: MoneyAccount;
  from_account: MoneyAccount | null;
  to_account: MoneyAccount | null;
  parent_transaction_id: string | null;
  note: string | null;
  transaction_date: string;
  created_at: string;
  categories?: Pick<Category, "id" | "name" | "emoji" | "type" | "system_key"> | null;
  tip_transaction?: (Transaction & { categories?: Pick<Category, "id" | "name" | "emoji" | "type" | "system_key"> | null }) | null;
};

export type Period = "current_month" | "previous_month" | "all_time";
