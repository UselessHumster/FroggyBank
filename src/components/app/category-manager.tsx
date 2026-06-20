import type { Category } from "@/lib/types/database";
import { deleteCategory, upsertCategory } from "@/lib/actions/categories";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function CategoryManager({ categories }: { categories: Category[] }) {
  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h2 className="mb-4 text-lg font-bold">Новая категория</h2>
        <CategoryForm />
      </Card>
      <div className="space-y-3">
        {categories.map((category) => (
          <Card key={category.id} className="p-4">
            <CategoryForm category={category} />
          </Card>
        ))}
      </div>
    </div>
  );
}

function CategoryForm({ category }: { category?: Category }) {
  return (
    <form action={upsertCategory} className="grid gap-3 sm:grid-cols-[80px_1fr_150px_auto] sm:items-end">
      {category ? <input type="hidden" name="id" value={category.id} /> : null}
      <div className="space-y-2">
        <Label>Emoji</Label>
        <Input name="emoji" defaultValue={category?.emoji ?? "💸"} required />
      </div>
      <div className="space-y-2">
        <Label>Название</Label>
        <Input name="name" defaultValue={category?.name ?? ""} placeholder="Категория" required />
      </div>
      <div className="space-y-2">
        <Label>Тип</Label>
        <Select name="type" defaultValue={category?.type ?? "expense"}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="expense">Расход</SelectItem>
            <SelectItem value="income">Доход</SelectItem>
            <SelectItem value="both">Оба</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2">
        <Button type="submit" className="flex-1">{category ? "OK" : "Создать"}</Button>
        {category ? (
          <Button formAction={deleteCategory} variant="outline" name="id" value={category.id} type="submit">
            Удалить
          </Button>
        ) : null}
      </div>
    </form>
  );
}
