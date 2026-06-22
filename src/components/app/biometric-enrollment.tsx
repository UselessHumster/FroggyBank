"use client";

import { useEffect, useState, useTransition } from "react";
import { startRegistration, platformAuthenticatorIsAvailable, browserSupportsWebAuthn } from "@simplewebauthn/browser";
import { Fingerprint, Loader2, ShieldCheck, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type BiometricEnrollmentProps = {
  enabled: boolean;
  compact?: boolean;
};

async function readResponseError(response: Response) {
  const text = await response.text();
  if (!text) return null;

  try {
    const data = JSON.parse(text) as { error?: string };
    return data.error ?? text;
  } catch {
    return text;
  }
}

export function BiometricEnrollment({ enabled, compact = false }: BiometricEnrollmentProps) {
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

  async function enableBiometrics() {
    setMessage(null);
    startTransition(async () => {
      try {
        const optionsResponse = await fetch("/api/webauthn/registration/options", { method: "POST" });
        const options = await optionsResponse.json();
        if (!optionsResponse.ok) throw new Error(options.error ?? "Не удалось начать настройку.");

        const registration = await startRegistration({ optionsJSON: options });
        const verifyResponse = await fetch("/api/webauthn/registration/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(registration)
        });
        if (!verifyResponse.ok) {
          throw new Error(await readResponseError(verifyResponse) ?? "Не удалось включить FaceID.");
        }

        setMessage("FaceID включен для этого устройства.");
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Не удалось включить FaceID.");
      }
    });
  }

  async function disableBiometrics() {
    setMessage(null);
    startTransition(async () => {
      const response = await fetch("/api/webauthn/credentials", { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) {
        setMessage(result.error ?? "Не удалось отключить FaceID.");
        return;
      }
      setMessage("FaceID отключен.");
      router.refresh();
    });
  }

  if (!available) return null;

  const content = (
    <>
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary/12 text-primary">
          {enabled ? <ShieldCheck className="h-5 w-5" /> : <Fingerprint className="h-5 w-5" />}
        </div>
        <div className="min-w-0">
          <p className="font-semibold">{enabled ? "FaceID включен" : "Вход по FaceID"}</p>
          <p className="text-sm text-muted-foreground">
            {enabled ? "Можно входить без пароля на этом устройстве." : "Включите быстрый вход без повторного ввода пароля."}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {enabled ? (
          <Button type="button" variant="outline" onClick={disableBiometrics} disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
            Отключить
          </Button>
        ) : (
          <Button type="button" onClick={enableBiometrics} disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Fingerprint className="mr-2 h-4 w-4" />}
            Включить
          </Button>
        )}
      </div>
    </>
  );

  if (compact) {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        {content}
        {message ? <p className="text-sm text-muted-foreground sm:basis-full">{message}</p> : null}
      </div>
    );
  }

  return (
    <Card className="space-y-3 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">{content}</div>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
    </Card>
  );
}
