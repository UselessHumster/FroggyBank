"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const transactionSchema = z.object({
  id: z.string().uuid().optional(),
  amount: z.coerce.number().positive(),
  type: z.enum(["income", "expense"]),
  category_id: z.string().uuid(),
  transaction_date: z.string().min(10),
  note: z.string().trim().max(180).optional()
});

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

export async function upsertTransaction(formData: FormData) {
  const parsed = transactionSchema.parse({
    id: formData.get("id") || undefined,
    amount: formData.get("amount"),
    type: formData.get("type"),
    category_id: formData.get("category_id"),
    transaction_date: formData.get("transaction_date"),
    note: formData.get("note") || undefined
  });
  const { supabase, user } = await requireUser();

  const payload = {
    user_id: user.id,
    amount: parsed.amount,
    type: parsed.type,
    category_id: parsed.category_id,
    transaction_date: parsed.transaction_date,
    note: parsed.note || null
  };

  if (parsed.id) {
    await supabase.from("transactions").update(payload).eq("id", parsed.id).eq("user_id", user.id);
  } else {
    await supabase.from("transactions").insert(payload);
  }

  revalidatePath("/", "layout");
  redirect("/history");
}

export async function deleteTransaction(formData: FormData) {
  const id = z.string().uuid().parse(formData.get("id"));
  const { supabase, user } = await requireUser();
  await supabase.from("transactions").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/", "layout");
}
