"use client";

import { useEffect, useState, useTransition } from "react";
import { startRegistration, platformAuthenticatorIsAvailable, browserSupportsWebAuthn } from "@simplewebauthn/browser";
import { Fingerprint, KeyRound, Loader2, ShieldCheck, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { WebAuthnCredentialRow } from "@/lib/webauthn";

type WebAuthnCredentialSummary = Pick<
  WebAuthnCredentialRow,
  "id" | "credential_id" | "device_type" | "backed_up" | "created_at" | "last_used_at"
>;

type BiometricEnrollmentProps = {
  credentials: WebAuthnCredentialSummary[];
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

function formatDate(value: string | null) {
  if (!value) return "еще не использовался";
  return new Intl.DateTimeFormat("ru", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function BiometricEnrollment({ credentials, compact = false }: BiometricEnrollmentProps) {
  const router = useRouter();
  const [available, setAvailable] = useState(false);
  const [localCredentialId, setLocalCredentialId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const hasCredentials = credentials.length > 0;
  const hasLocalCredential = Boolean(localCredentialId && credentials.some((credential) => credential.credential_id === localCredentialId));

  useEffect(() => {
    setLocalCredentialId(window.localStorage.getItem("fb_webauthn_credential_id"));

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

        const result = await verifyResponse.json() as { credentialId?: string };
        if (result.credentialId) {
          window.localStorage.setItem("fb_webauthn_credential_id", result.credentialId);
          setLocalCredentialId(result.credentialId);
        }
        setMessage("FaceID включен для этого устройства.");
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Не удалось включить FaceID.");
      }
    });
  }

  async function deleteCredential(id: string, currentDevice: boolean) {
    setMessage(null);
    startTransition(async () => {
      const response = await fetch(`/api/webauthn/credentials?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) {
        setMessage(result.error ?? "Не удалось удалить FaceID-ключ.");
        return;
      }
      if (currentDevice) {
        window.localStorage.removeItem("fb_webauthn_credential_id");
        setLocalCredentialId(null);
      }
      setMessage("FaceID-ключ удален.");
      router.refresh();
    });
  }

  async function deleteAllCredentials() {
    setMessage(null);
    startTransition(async () => {
      const response = await fetch("/api/webauthn/credentials?all=true", { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) {
        setMessage(result.error ?? "Не удалось отключить FaceID.");
        return;
      }
      window.localStorage.removeItem("fb_webauthn_credential_id");
      setLocalCredentialId(null);
      setMessage("FaceID отключен на всех устройствах.");
      router.refresh();
    });
  }

  if (!available) return null;

  if (compact && hasLocalCredential) return null;

  const intro = (
    <>
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary/12 text-primary">
          {hasLocalCredential ? <ShieldCheck className="h-5 w-5" /> : <Fingerprint className="h-5 w-5" />}
        </div>
        <div className="min-w-0">
          <p className="font-semibold">{hasLocalCredential ? "FaceID включен на этом устройстве" : "Добавить FaceID на это устройство"}</p>
          <p className="text-sm text-muted-foreground">
            {hasCredentials
              ? "У аккаунта может быть отдельный FaceID-ключ на каждом телефоне."
              : "Включите быстрый вход без повторного ввода пароля."}
          </p>
        </div>
      </div>
      {!hasLocalCredential ? (
        <div className="flex shrink-0 items-center gap-2">
          <Button type="button" onClick={enableBiometrics} disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Fingerprint className="mr-2 h-4 w-4" />}
            Добавить
          </Button>
        </div>
      ) : null}
    </>
  );

  if (compact) {
    return (
      <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-border/70 bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        {intro}
        {message ? <p className="text-sm text-muted-foreground sm:basis-full">{message}</p> : null}
      </div>
    );
  }

  return (
    <Card className="space-y-3 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">{intro}</div>
      {hasCredentials ? (
        <div className="space-y-2 border-t border-border/70 pt-3">
          {credentials.map((credential) => {
            const currentDevice = credential.credential_id === localCredentialId;
            return (
              <div key={credential.id} className="flex flex-col gap-3 rounded-xl border border-border/70 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold">
                      {currentDevice ? "Это устройство" : "Другое устройство"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Создан: {formatDate(credential.created_at)} · Последний вход: {formatDate(credential.last_used_at)}
                    </p>
                  </div>
                </div>
                <Button type="button" variant="outline" onClick={() => deleteCredential(credential.id, currentDevice)} disabled={isPending}>
                  {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                  Удалить
                </Button>
              </div>
            );
          })}
          <div className="flex justify-end pt-1">
            <Button type="button" variant="destructive" onClick={deleteAllCredentials} disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Отключить на всех устройствах
            </Button>
          </div>
        </div>
      ) : null}
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
    </Card>
  );
}
