"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const transactionSchema = z.object({
  id: z.string().uuid().optional(),
  amount: z.coerce.number().positive(),
  type: z.enum(["income", "expense", "conversion"]),
  account: z.enum(["card", "cash"]).optional(),
  category_id: z.string().uuid().optional(),
  from_account: z.enum(["card", "cash"]).optional(),
  to_account: z.enum(["card", "cash"]).optional(),
  tip_enabled: z.coerce.boolean().optional(),
  tip_amount: z.coerce.number().positive().optional(),
  tip_account: z.enum(["card", "cash"]).optional(),
  transaction_date: z.string().min(10),
  note: z.string().trim().max(180).optional()
}).superRefine((value, ctx) => {
  if (value.type === "conversion") {
    if (!value.from_account || !value.to_account || value.from_account === value.to_account) {
      ctx.addIssue({ code: "custom", path: ["from_account"], message: "Choose different conversion accounts" });
    }
    return;
  }

  if (!value.category_id) {
    ctx.addIssue({ code: "custom", path: ["category_id"], message: "Category is required" });
  }
});

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

async function getTipsCategoryId(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data: existing } = await supabase
    .from("categories")
    .select("id")
    .eq("user_id", userId)
    .eq("system_key", "tips")
    .maybeSingle();

  if (existing?.id) return existing.id as string;

  const { data } = await supabase
    .from("categories")
    .insert({ user_id: userId, name: "Чаевые", emoji: "🤝", type: "expense", system_key: "tips" })
    .select("id")
    .single();

  if (!data?.id) throw new Error("Unable to create tips category");
  return data.id as string;
}

function throwOnError(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

export async function upsertTransaction(formData: FormData) {
  const parsed = transactionSchema.parse({
    id: formData.get("id") || undefined,
    amount: formData.get("amount"),
    type: formData.get("type"),
    account: formData.get("account") || undefined,
    category_id: formData.get("category_id") || undefined,
    from_account: formData.get("from_account") || undefined,
    to_account: formData.get("to_account") || undefined,
    tip_enabled: formData.get("tip_enabled") === "on",
    tip_amount: formData.get("tip_amount") || undefined,
    tip_account: formData.get("tip_account") || undefined,
    transaction_date: formData.get("transaction_date"),
    note: formData.get("note") || undefined
  });
  const { supabase, user } = await requireUser();

  const payload: Record<string, unknown> = parsed.type === "conversion" ? {
    user_id: user.id,
    amount: parsed.amount,
    type: parsed.type,
    category_id: null,
    account: "card",
    from_account: parsed.from_account,
    to_account: parsed.to_account,
    transaction_date: parsed.transaction_date,
    note: parsed.note || null
  } : {
    user_id: user.id,
    amount: parsed.amount,
    type: parsed.type,
    category_id: parsed.category_id as string,
    account: parsed.account ?? "card",
    from_account: null,
    to_account: null,
    transaction_date: parsed.transaction_date,
    note: parsed.note || null
  };

  let transactionId = parsed.id;
  if (parsed.id) {
    const { error } = await supabase.from("transactions").update(payload).eq("id", parsed.id).eq("user_id", user.id);
    throwOnError(error);
  } else {
    const { data, error } = await supabase.from("transactions").insert(payload).select("id").single();
    throwOnError(error);
    transactionId = data?.id as string | undefined;
  }

  if (transactionId) {
    const { error } = await supabase.from("transactions").delete().eq("parent_transaction_id", transactionId).eq("user_id", user.id);
    throwOnError(error);
  }

  if (parsed.type === "expense" && parsed.tip_enabled && parsed.tip_amount && transactionId) {
    const tipsCategoryId = await getTipsCategoryId(supabase, user.id);
    const { error } = await supabase.from("transactions").insert({
      user_id: user.id,
      parent_transaction_id: transactionId,
      amount: parsed.tip_amount,
      type: "expense",
      category_id: tipsCategoryId,
      account: parsed.tip_account ?? "cash",
      from_account: null,
      to_account: null,
      transaction_date: parsed.transaction_date,
      note: "Чаевые"
    });
    throwOnError(error);
  }

  revalidatePath("/", "layout");
  redirect("/history");
}

export async function deleteTransaction(formData: FormData) {
  const id = z.string().uuid().parse(formData.get("id"));
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("transactions").delete().eq("id", id).eq("user_id", user.id);
  throwOnError(error);
  revalidatePath("/", "layout");
}
