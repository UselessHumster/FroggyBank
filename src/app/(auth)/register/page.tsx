import Link from "next/link";
import { signUp } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <Card className="w-full max-w-md p-6">
        <div className="mb-7">
          <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-primary text-2xl text-primary-foreground">₽</div>
          <h1 className="text-3xl font-black">Создайте аккаунт</h1>
          <p className="mt-2 text-sm text-muted-foreground">Категории появятся автоматически после регистрации.</p>
        </div>
        <form action={signUp} className="space-y-4">
          {params.error ? <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{params.error}</p> : null}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input id="password" name="password" type="password" minLength={6} autoComplete="new-password" required />
          </div>
          <Button className="w-full" size="lg">Зарегистрироваться</Button>
          <p className="text-center text-sm text-muted-foreground">
            Уже есть аккаунт? <Link href="/login" className="font-semibold text-primary">Войти</Link>
          </p>
        </form>
      </Card>
    </main>
  );
}
