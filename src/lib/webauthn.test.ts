import { afterEach, describe, expect, it } from "vitest";
import { getWebAuthnConfig } from "@/lib/webauthn";

describe("getWebAuthnConfig", () => {
  const originalSiteUrl = process.env.SITE_URL;

  afterEach(() => {
    process.env.SITE_URL = originalSiteUrl;
  });

  it("uses forwarded host instead of the internal Next.js bind address", () => {
    const request = new Request("http://0.0.0.0:3000/api/webauthn/registration/options", {
      headers: {
        "x-forwarded-host": "froggybank.example.com",
        "x-forwarded-proto": "https"
      }
    });

    expect(getWebAuthnConfig(request)).toEqual({
      origin: "https://froggybank.example.com",
      rpID: "froggybank.example.com"
    });
  });

  it("falls back to SITE_URL when the request host is internal", () => {
    process.env.SITE_URL = "https://budget.example.com";
    const request = new Request("http://0.0.0.0:3000/api/webauthn/registration/options", {
      headers: {
        host: "0.0.0.0:3000"
      }
    });

    expect(getWebAuthnConfig(request)).toEqual({
      origin: "https://budget.example.com",
      rpID: "budget.example.com"
    });
  });

  it("uses the SITE_URL protocol when a proxy forwards only the public host", () => {
    process.env.SITE_URL = "https://finance.zhabik.ru";
    const request = new Request("http://0.0.0.0:3000/api/webauthn/registration/verify", {
      headers: {
        host: "finance.zhabik.ru"
      }
    });

    expect(getWebAuthnConfig(request)).toEqual({
      origin: "https://finance.zhabik.ru",
      rpID: "finance.zhabik.ru"
    });
  });
});
