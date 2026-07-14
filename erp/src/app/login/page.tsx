import Image from "next/image";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-sm space-y-6 rounded-xl border bg-card p-8 shadow-sm">
        <div className="space-y-1 text-center">
          <Image
            src="/marca/logo-completa.png"
            alt="Lucas Limpa Nome"
            width={549}
            height={756}
            priority
            className="mx-auto mb-4 h-36 w-auto dark:invert"
          />
          <h1 className="sr-only">Lucas Limpa Nome ERP</h1>
          <p className="text-sm text-muted-foreground">Entre com suas credenciais para continuar</p>
        </div>
        <LoginForm next={next} />
      </div>
    </div>
  );
}
