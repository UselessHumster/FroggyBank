import type { CategoryType, SystemCategoryKey } from "@/lib/types/database";

export const defaultCategories: Array<{ name: string; emoji: string; type: CategoryType; system_key?: SystemCategoryKey }> = [
  { name: "Еда", emoji: "🍔", type: "expense" },
  { name: "Транспорт", emoji: "🚗", type: "expense" },
  { name: "Жилье", emoji: "🏠", type: "expense" },
  { name: "Здоровье", emoji: "💊", type: "expense" },
  { name: "Развлечения", emoji: "🎮", type: "expense" },
  { name: "Покупки", emoji: "🛍️", type: "expense" },
  { name: "Зарплата", emoji: "💼", type: "income" },
  { name: "Инвестиции", emoji: "📈", type: "income" },
  { name: "Подарки", emoji: "🎁", type: "both" },
  { name: "Чаевые", emoji: "🤝", type: "expense", system_key: "tips" }
];
