import { verifyRegistrationResponse, type RegistrationResponseJSON } from "@simplewebauthn/server";
import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { bufferToBase64URL, getWebAuthnConfig } from "@/lib/webauthn";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Нужно войти по паролю." }, { status: 401 });
    }

    const expectedChallenge = request.cookies.get("fb_webauthn_registration_challenge")?.value;
    if (!expectedChallenge) {
      return NextResponse.json({ error: "Сессия настройки FaceID истекла." }, { status: 400 });
    }

    const body = (await request.json()) as RegistrationResponseJSON;
    const { origin, rpID } = getWebAuthnConfig(request);
    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: true
    });

    if (!verification.verified) {
      console.error("WebAuthn registration was not verified", { origin, rpID });
      return NextResponse.json({ error: "Не удалось подтвердить биометрию." }, { status: 400 });
    }

    const { credential } = verification.registrationInfo;
    const admin = createAdminClient();
    const { error } = await admin.from("webauthn_credentials").upsert({
      user_id: user.id,
      user_email: user.email?.toLowerCase() ?? "",
      credential_id: credential.id,
      public_key: bufferToBase64URL(credential.publicKey),
      counter: credential.counter,
      transports: credential.transports ?? [],
      device_type: verification.registrationInfo.credentialDeviceType,
      backed_up: verification.registrationInfo.credentialBackedUp
    }, {
      onConflict: "credential_id"
    });

    if (error) {
      console.error("Failed to store WebAuthn credential", JSON.stringify(error));
      return NextResponse.json({ error: error.message ?? JSON.stringify(error) }, { status: 500 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.delete("fb_webauthn_registration_challenge");
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Неизвестная ошибка WebAuthn.";
    console.error("WebAuthn registration failed", { message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
