"use client";

import { useActionState } from "react";
import { loginAdmin, type LoginState } from "@/lib/admin-actions";

const inicial: LoginState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAdmin, inicial);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="senha" className="mb-1.5 block text-sm font-medium text-ink">
          Senha de administrador
        </label>
        <input
          id="senha"
          name="senha"
          type="password"
          required
          autoFocus
          className="w-full rounded-xl border border-navy-900/10 bg-white px-4 py-3 outline-none transition focus:border-navy-500 focus:ring-4 focus:ring-navy-500/10"
        />
      </div>
      {state.erro && <p className="text-sm font-medium text-rose-600">{state.erro}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-navy-900 px-6 py-3 font-semibold text-white transition hover:bg-navy-800 active:scale-[0.99] disabled:opacity-60"
      >
        {pending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
