import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getWebAuthnCredentialDeleteTarget } from "@/lib/webauthn-credentials";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Нужно войти." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("webauthn_credentials")
    .select("id, credential_id, device_type, backed_up, created_at, last_used_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ credentials: data ?? [] });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Нужно войти." }, { status: 401 });
  }

  const target = getWebAuthnCredentialDeleteTarget(request.url);

  if (!target.ok) {
    return NextResponse.json({ error: target.error }, { status: 400 });
  }

  const query = supabase.from("webauthn_credentials").delete().eq("user_id", user.id);
  const { error } = target.deleteAll ? await query : await query.eq("id", target.credentialRowId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
