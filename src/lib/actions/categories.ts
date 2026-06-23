"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const categorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(40),
  emoji: z.string().trim().min(1).max(8),
  type: z.enum(["income", "expense", "both"])
});

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

export async function upsertCategory(formData: FormData) {
  const parsed = categorySchema.parse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    emoji: formData.get("emoji"),
    type: formData.get("type")
  });
  const { supabase, user } = await requireUser();

  if (parsed.id) {
    const { data: existing } = await supabase
      .from("categories")
      .select("system_key")
      .eq("id", parsed.id)
      .eq("user_id", user.id)
      .single();

    const payload = existing?.system_key === "tips"
      ? { emoji: parsed.emoji }
      : { name: parsed.name, emoji: parsed.emoji, type: parsed.type };

    await supabase.from("categories").update(payload).eq("id", parsed.id).eq("user_id", user.id);
  } else {
    await supabase.from("categories").insert({ ...parsed, user_id: user.id });
  }

  revalidatePath("/", "layout");
}

export async function deleteCategory(formData: FormData) {
  const id = z.string().uuid().parse(formData.get("id"));
  const { supabase, user } = await requireUser();
  await supabase.from("categories").delete().eq("id", id).eq("user_id", user.id).is("system_key", null);
  revalidatePath("/", "layout");
}
