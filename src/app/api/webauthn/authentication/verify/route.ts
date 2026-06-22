import { verifyAuthenticationResponse, type AuthenticationResponseJSON } from "@simplewebauthn/server";
import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getWebAuthnConfig, toWebAuthnCredential } from "@/lib/webauthn";
import type { WebAuthnCredentialRow } from "@/lib/webauthn";

export async function POST(request: NextRequest) {
  const expectedChallenge = request.cookies.get("fb_webauthn_authentication_challenge")?.value;
  if (!expectedChallenge) {
    return NextResponse.json({ error: "Сессия FaceID истекла." }, { status: 400 });
  }

  const body = (await request.json()) as AuthenticationResponseJSON;
  const admin = createAdminClient();
  const { data: credential, error } = await admin
    .from("webauthn_credentials")
    .select("*")
    .eq("credential_id", body.id)
    .single();

  if (error || !credential) {
    return NextResponse.json({ error: "FaceID-ключ не найден." }, { status: 404 });
  }

  const credentialRow = credential as WebAuthnCredentialRow;
  const { origin, rpID } = getWebAuthnConfig(request);
  const verification = await verifyAuthenticationResponse({
    response: body,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    credential: toWebAuthnCredential(credentialRow),
    requireUserVerification: true
  });

  if (!verification.verified) {
    return NextResponse.json({ error: "Не удалось подтвердить FaceID." }, { status: 400 });
  }

  await admin
    .from("webauthn_credentials")
    .update({
      counter: verification.authenticationInfo.newCounter,
      last_used_at: new Date().toISOString()
    })
    .eq("id", credentialRow.id);

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: credentialRow.user_email
  });
  const tokenHash = linkData.properties?.hashed_token;
  if (linkError || !tokenHash) {
    return NextResponse.json({ error: linkError?.message ?? "Не удалось создать сессию." }, { status: 500 });
  }

  const supabase = await createClient();
  const { error: otpError } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: "magiclink"
  });

  if (otpError) {
    return NextResponse.json({ error: otpError.message }, { status: 500 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.delete("fb_webauthn_authentication_challenge");
  return response;
}
