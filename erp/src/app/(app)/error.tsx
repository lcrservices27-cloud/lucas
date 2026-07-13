"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erro na aplicação:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-6" />
      </div>
      <div>
        <h2 className="text-lg font-semibold">Algo deu errado</h2>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          Ocorreu um erro inesperado ao carregar esta página. Tente novamente — se o problema
          persistir, entre em contato com o administrador.
        </p>
        {error.digest && (
          <p className="mt-2 font-mono text-xs text-muted-foreground">Código: {error.digest}</p>
        )}
      </div>
      <Button onClick={reset}>
        <RotateCcw /> Tentar novamente
      </Button>
    </div>
  );
}
