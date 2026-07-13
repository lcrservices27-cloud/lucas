"use client";

import { FileText, Trash2, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { UploadDocumentoDialog } from "@/components/crm/upload-documento-dialog";
import { excluirDocumento } from "@/lib/actions/documentos";
import { TIPO_DOCUMENTO_LABEL } from "@/lib/labels";
import { formatDateTime } from "@/lib/utils";
import type { ClienteDetail } from "@/lib/queries/cliente-detail";

function formatBytes(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function TabDocumentos({ cliente }: { cliente: ClienteDetail }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium">Documentos</CardTitle>
        <UploadDocumentoDialog clienteId={cliente.id} />
      </CardHeader>
      <CardContent>
        {cliente.documentos.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum documento enviado ainda.</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {cliente.documentos.map((doc) => (
              <div key={doc.id} className="flex items-center gap-3 rounded-lg border p-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <FileText className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{doc.nomeArquivo}</p>
                  <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-[10px]">
                      {TIPO_DOCUMENTO_LABEL[doc.tipo]}
                    </Badge>
                    <span>{formatBytes(doc.tamanho)}</span>
                    <span>· {formatDateTime(doc.criadoEm)}</span>
                  </div>
                </div>
                <a href={`/api/documentos/${doc.id}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="icon" className="size-8">
                    <Download className="size-4" />
                  </Button>
                </a>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8 text-destructive hover:text-destructive">
                      <Trash2 className="size-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir documento?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação removerá permanentemente &quot;{doc.nomeArquivo}&quot;. Não é possível desfazer.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => excluirDocumento(doc.id, cliente.id)}>
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
