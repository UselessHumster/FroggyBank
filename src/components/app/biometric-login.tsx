"use client";

import { useEffect, useState, useTransition } from "react";
import { startAuthentication, platformAuthenticatorIsAvailable, browserSupportsWebAuthn } from "@simplewebauthn/browser";
import { Fingerprint, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function BiometricLogin() {
  const router = useRouter();
  const [available, setAvailable] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let mounted = true;
    async function checkAvailability() {
      const supportsWebAuthn = browserSupportsWebAuthn();
      const hasPlatformAuthenticator = supportsWebAuthn && await platformAuthenticatorIsAvailable();
      if (mounted) setAvailable(hasPlatformAuthenticator);
    }
    checkAvailability();
    return () => {
      mounted = false;
    };
  }, []);


  async function signInWithBiometrics() {
    setMessage(null);

    startTransition(async () => {
      try {
        const optionsResponse = await fetch("/api/webauthn/authentication/options", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({})
        });
        const options = await optionsResponse.json();
        if (!optionsResponse.ok) throw new Error(options.error ?? "FaceID не настроен.");

        const authentication = await startAuthentication({ optionsJSON: options });
        const verifyResponse = await fetch("/api/webauthn/authentication/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(authentication)
        });
        const result = await verifyResponse.json();
        if (!verifyResponse.ok) throw new Error(result.error ?? "Не удалось войти по FaceID.");

        router.replace("/dashboard");
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Не удалось войти по FaceID.");
      }
    });
  }

  if (!available) return null;

  return (
    <div className="space-y-2">
      <Button type="button" variant="outline" className="w-full" size="lg" onClick={signInWithBiometrics} disabled={isPending}>
        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Fingerprint className="mr-2 h-4 w-4" />}
        Войти по FaceID
      </Button>
      {message ? <p className="text-center text-sm text-muted-foreground">{message}</p> : null}
    </div>
  );
}
