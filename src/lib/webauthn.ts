import type { AuthenticatorTransportFuture, Base64URLString, Uint8Array_, WebAuthnCredential } from "@simplewebauthn/server";

export const rpName = "Жабжет";

export type WebAuthnCredentialRow = {
  id: string;
  user_id: string;
  user_email: string;
  credential_id: string;
  public_key: string;
  counter: number;
  transports: AuthenticatorTransportFuture[] | null;
  device_type: string;
  backed_up: boolean;
  created_at: string;
  last_used_at: string | null;
};

export function getWebAuthnConfig(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;
  return {
    origin,
    rpID: url.hostname
  };
}

export function bufferToBase64URL(buffer: Uint8Array): Base64URLString {
  return Buffer.from(buffer).toString("base64url");
}

export function base64URLToBuffer(value: string): Uint8Array_ {
  return Uint8Array.from(Buffer.from(value, "base64url")).slice();
}

export function toWebAuthnCredential(row: WebAuthnCredentialRow): WebAuthnCredential {
  return {
    id: row.credential_id,
    publicKey: base64URLToBuffer(row.public_key),
    counter: Number(row.counter),
    transports: row.transports ?? undefined
  };
}
