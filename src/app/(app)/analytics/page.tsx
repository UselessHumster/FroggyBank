import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CategoryPie, CashflowChart } from "@/components/app/charts";
import { getCategoryAnalytics, getChartSeries } from "@/lib/data/queries";
import { formatMoney } from "@/lib/utils";

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ period?: "7d" | "30d" | "month" | "year" }> }) {
  const params = await searchParams;
  const period = params.period ?? "30d";
  const [categories, series] = await Promise.all([getCategoryAnalytics(), getChartSeries(period)]);

  return (
    <div className="space-y-5">
      <header>
        <p className="text-sm font-semibold text-muted-foreground">Понятная картина расходов</p>
        <h1 className="text-3xl font-black">Аналитика</h1>
      </header>
      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-black">Расходы по категориям</h2>
        </div>
        <CategoryPie data={categories} />
        <div className="mt-3 space-y-3">
          {categories.map((category) => (
            <div key={category.name} className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-muted text-xl">{category.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{category.name}</p>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${category.percent}%` }} />
                </div>
              </div>
              <div className="text-right">
                <p className="font-black">{formatMoney(category.amount)}</p>
                <p className="text-xs text-muted-foreground">{category.percent}%</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-5">
        <div className="mb-4 space-y-3">
          <h2 className="text-lg font-black">Доходы и расходы</h2>
          <div className="flex flex-wrap gap-2">
            {[
              ["7d", "7 дней"],
              ["30d", "30 дней"],
              ["month", "Месяц"],
              ["year", "Год"]
            ].map(([value, label]) => (
              <Button key={value} asChild size="sm" variant={period === value ? "default" : "outline"}>
                <Link href={`/analytics?period=${value}`}>{label}</Link>
              </Button>
            ))}
          </div>
        </div>
        <CashflowChart data={series} />
      </Card>
    </div>
  );
}
