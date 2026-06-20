"use client";

import { Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatMoney } from "@/lib/utils";

const colors = ["#16a064", "#f2bd2e", "#38aeea", "#ef5858", "#8b5cf6", "#f97316", "#14b8a6"];

export function CategoryPie({ data }: { data: Array<{ name: string; emoji: string; amount: number; percent: number }> }) {
  if (!data.length) return <div className="grid h-64 place-items-center text-muted-foreground">Нет расходов для графика</div>;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="amount" nameKey="name" innerRadius={62} outerRadius={100} paddingAngle={4}>
          {data.map((_, index) => <Cell key={index} fill={colors[index % colors.length]} />)}
        </Pie>
        <Tooltip formatter={(value) => formatMoney(Number(value))} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function CashflowChart({ data }: { data: Array<{ date: string; Доходы: number; Расходы: number }> }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ left: -18, right: 8, top: 12, bottom: 0 }}>
        <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis tickFormatter={(value) => `${Math.round(Number(value) / 1000)}к`} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <Tooltip formatter={(value) => formatMoney(Number(value))} />
        <Line type="monotone" dataKey="Доходы" stroke="#16a064" strokeWidth={3} dot={false} />
        <Line type="monotone" dataKey="Расходы" stroke="#ef5858" strokeWidth={3} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
