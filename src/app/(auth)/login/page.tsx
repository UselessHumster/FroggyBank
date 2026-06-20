import Link from "next/link";
import Image from "next/image";
import { signIn } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <Card className="w-full max-w-md overflow-hidden">
        <div className="bg-primary p-7 text-primary-foreground">
          <Image src="/icons/icon-192.png" alt="" width={56} height={56} className="mb-10 h-14 w-14 rounded-2xl object-cover" priority />
          <h1 className="text-3xl font-black">Жабжет</h1>
          <p className="mt-2 text-sm text-primary-foreground/80">Быстрый учет денег без ощущения таблицы.</p>
        </div>
        <form action={signIn} className="space-y-4 p-6">
          {params.error ? <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{params.error}</p> : null}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input id="password" name="password" type="password" autoComplete="current-password" required />
          </div>
          <Button className="w-full" size="lg">Войти</Button>
          <p className="text-center text-sm text-muted-foreground">
            Нет аккаунта? <Link href="/register" className="font-semibold text-primary">Зарегистрироваться</Link>
          </p>
        </form>
      </Card>
    </main>
  );
}
