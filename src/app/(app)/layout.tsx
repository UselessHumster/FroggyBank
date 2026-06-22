import { AppNav } from "@/components/app/nav";
import { BiometricEnrollment } from "@/components/app/biometric-enrollment";
import { hasWebAuthnCredentials } from "@/lib/data/queries";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const biometricEnabled = await hasWebAuthnCredentials();

  return (
    <div className="min-h-screen lg:pl-72">
      <AppNav />
      <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-5 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8">
        {!biometricEnabled ? <div className="mb-5"><BiometricEnrollment enabled={false} compact /></div> : null}
        {children}
      </main>
    </div>
  );
}
