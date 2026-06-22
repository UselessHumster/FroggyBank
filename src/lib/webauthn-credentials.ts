export type WebAuthnCredentialDeleteTarget =
  | { ok: true; deleteAll: true; credentialRowId: null }
  | { ok: true; deleteAll: false; credentialRowId: string }
  | { ok: false; error: string };

export function getWebAuthnCredentialDeleteTarget(requestUrl: string): WebAuthnCredentialDeleteTarget {
  const url = new URL(requestUrl);
  const credentialRowId = url.searchParams.get("id");
  const deleteAll = url.searchParams.get("all") === "true";

  if (deleteAll) {
    return { ok: true, deleteAll: true, credentialRowId: null };
  }

  if (credentialRowId) {
    return { ok: true, deleteAll: false, credentialRowId };
  }

  return { ok: false, error: "Укажите ключ FaceID для удаления." };
}
