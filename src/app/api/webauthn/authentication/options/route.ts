import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getWebAuthnConfig } from "@/lib/webauthn";
import type { WebAuthnCredentialRow } from "@/lib/webauthn";

export async function POST(request: Request) {
  const { email } = (await request.json()) as { email?: string };
  const normalizedEmail = email?.trim().toLowerCase();
  if (!normalizedEmail) {
    return NextResponse.json({ error: "Введите email." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: credentials, error } = await admin
    .from("webauthn_credentials")
    .select("*")
    .eq("user_email", normalizedEmail);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!credentials?.length) {
    return NextResponse.json({ error: "Для этого email FaceID еще не настроен." }, { status: 404 });
  }

  const { rpID } = getWebAuthnConfig(request);
  const options = await generateAuthenticationOptions({
    rpID,
    userVerification: "required",
    allowCredentials: (credentials as WebAuthnCredentialRow[]).map((credential) => ({
      id: credential.credential_id,
      transports: credential.transports ?? undefined
    }))
  });

  const response = NextResponse.json(options);
  response.cookies.set("fb_webauthn_authentication_challenge", options.challenge, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 300,
    path: "/"
  });
  return response;
}
