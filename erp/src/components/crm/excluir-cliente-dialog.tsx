"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { excluirCliente } from "@/lib/actions/clientes";

export function ExcluirClienteDialog({
  clienteId,
  clienteNome,
  iconOnly = false,
  redirectToList = false,
}: {
  clienteId: string;
  clienteNome: string;
  /** Na tabela do CRM o gatilho é só o ícone de lixeira. */
  iconOnly?: boolean;
  /** Na ficha do cliente, depois de excluir não há para onde voltar: vai à lista. */
  redirectToList?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  async function handleExcluir(event: React.MouseEvent) {
    // Segura o fechamento do dialog até a Server Action terminar.
    event.preventDefault();
    setPending(true);
    try {
      await excluirCliente(clienteId);
      setOpen(false);
      toast.success(`Cliente ${clienteNome} excluído.`);
      if (redirectToList) {
        router.push("/crm");
      }
      // Redesenha a rota atual com os dados já revalidados no servidor.
      router.refresh();
    } catch {
      toast.error("Não foi possível excluir o cliente. Só administradores podem excluir.");
    } finally {
      setPending(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {iconOnly ? (
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-destructive hover:text-destructive"
            aria-label={`Excluir ${clienteNome}`}
          >
            <Trash2 className="size-4" />
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
            <Trash2 /> Excluir
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir {clienteNome}?</AlertDialogTitle>
          <AlertDialogDescription>
            Isso remove permanentemente o cliente e todo o histórico dele — parcelas, pagamentos,
            documentos, observações e timeline. Os eventos da agenda são mantidos, mas ficam sem
            cliente vinculado. Não é possível desfazer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleExcluir}
            disabled={pending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {pending ? "Excluindo..." : "Excluir cliente"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
