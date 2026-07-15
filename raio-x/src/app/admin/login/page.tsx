import { Logo } from "@/components/logo";
import { LoginForm } from "./login-form";

export const metadata = { title: "Admin · Login", robots: { index: false } };

export default function AdminLoginPage() {
  return (
    <div className="bg-mist flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-3xl border border-navy-900/10 bg-white p-8 shadow-soft">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <Logo />
          <p className="text-sm text-ink-soft">Painel administrativo</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
