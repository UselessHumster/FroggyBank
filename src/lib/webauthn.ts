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

function firstHeaderValue(value: string | null) {
  return value?.split(",")[0]?.trim() || null;
}

function isInternalHost(hostname: string) {
  return hostname === "0.0.0.0" || hostname === "::" || hostname === "";
}

function urlFromHost(proto: string, host: string) {
  return new URL(`${proto}://${host}`);
}

export function getWebAuthnConfig(request: Request) {
  const requestUrl = new URL(request.url);
  const forwardedHost = firstHeaderValue(request.headers.get("x-forwarded-host"));
  const host = forwardedHost ?? firstHeaderValue(request.headers.get("host"));
  const forwardedProto = firstHeaderValue(request.headers.get("x-forwarded-proto"));
  const proto = forwardedProto ?? requestUrl.protocol.replace(":", "");
  const configuredSiteUrl = process.env.SITE_URL ? new URL(process.env.SITE_URL) : null;
  const headerUrl = host ? urlFromHost(proto, host) : null;
  const url = headerUrl && !isInternalHost(headerUrl.hostname)
    ? headerUrl
    : configuredSiteUrl ?? requestUrl;

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
