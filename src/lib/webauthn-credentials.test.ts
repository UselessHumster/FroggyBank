import { describe, expect, it } from "vitest";
import { getWebAuthnCredentialDeleteTarget } from "@/lib/webauthn-credentials";

describe("getWebAuthnCredentialDeleteTarget", () => {
  it("targets a single credential row by id", () => {
    expect(getWebAuthnCredentialDeleteTarget("https://app.example.com/api/webauthn/credentials?id=row-123")).toEqual({
      ok: true,
      deleteAll: false,
      credentialRowId: "row-123"
    });
  });

  it("targets all credentials when all=true is set", () => {
    expect(getWebAuthnCredentialDeleteTarget("https://app.example.com/api/webauthn/credentials?all=true")).toEqual({
      ok: true,
      deleteAll: true,
      credentialRowId: null
    });
  });

  it("requires an explicit delete target", () => {
    expect(getWebAuthnCredentialDeleteTarget("https://app.example.com/api/webauthn/credentials")).toEqual({
      ok: false,
      error: "Укажите ключ FaceID для удаления."
    });
  });
});
