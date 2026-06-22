import { generateRegistrationOptions } from "@simplewebauthn/server";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getWebAuthnConfig, rpName } from "@/lib/webauthn";
import type { WebAuthnCredentialRow } from "@/lib/webauthn";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Нужно войти по паролю." }, { status: 401 });
  }

  const { data: credentials } = await supabase
    .from("webauthn_credentials")
    .select("credential_id, transports")
    .eq("user_id", user.id);
  const { rpID } = getWebAuthnConfig(request);

  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userID: new TextEncoder().encode(user.id),
    userName: user.email,
    userDisplayName: user.email,
    attestationType: "none",
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "required"
    },
    excludeCredentials: ((credentials ?? []) as Pick<WebAuthnCredentialRow, "credential_id" | "transports">[]).map((credential) => ({
      id: credential.credential_id,
      transports: credential.transports ?? undefined
    }))
  });

  const response = NextResponse.json(options);
  response.cookies.set("fb_webauthn_registration_challenge", options.challenge, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 300,
    path: "/"
  });
  return response;
}
