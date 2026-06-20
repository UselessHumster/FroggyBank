export type TransactionType = "income" | "expense";
export type CategoryType = TransactionType | "both";

export type Category = {
  id: string;
  user_id: string;
  name: string;
  emoji: string;
  type: CategoryType;
  created_at: string;
};

export type Transaction = {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  type: TransactionType;
  note: string | null;
  transaction_date: string;
  created_at: string;
  categories?: Pick<Category, "id" | "name" | "emoji" | "type"> | null;
};

export type Period = "current_month" | "previous_month" | "all_time";
