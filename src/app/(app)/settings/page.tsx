import { Mail } from "lucide-react";
import { signOut } from "@/lib/actions/auth";
import { getCategories, getUserContext } from "@/lib/data/queries";
import { CategoryManager } from "@/components/app/category-manager";
import { FontSelector } from "@/components/app/font-selector";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default async function SettingsPage() {
  const [{ user }, categories] = await Promise.all([getUserContext(), getCategories()]);

  return (
    <div className="space-y-5">
      <header>
        <p className="text-sm font-semibold text-muted-foreground">Профиль и категории</p>
        <h1 className="text-3xl font-black">Настройки</h1>
      </header>
      <Card className="space-y-4 p-5">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/12 text-primary">
            <Mail className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold">Пользователь</p>
            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <div>
          <form action={signOut}>
            <Button variant="destructive">Выйти</Button>
          </form>
        </div>
      </Card>
      <section className="space-y-3">
        <h2 className="text-xl font-black">Оформление</h2>
        <ThemeToggle />
        <FontSelector />
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-black">Категории</h2>
        <CategoryManager categories={categories} />
      </section>
    </div>
  );
}
