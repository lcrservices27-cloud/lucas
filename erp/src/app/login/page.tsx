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
          <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            L
          </div>
          <h1 className="text-lg font-semibold">Lucas Limpa Nome ERP</h1>
          <p className="text-sm text-muted-foreground">Entre com suas credenciais para continuar</p>
        </div>
        <LoginForm next={next} />
      </div>
    </div>
  );
}
