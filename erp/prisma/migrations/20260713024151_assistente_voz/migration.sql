-- CreateEnum
CREATE TYPE "TipoAcaoAssistente" AS ENUM ('CRIAR_CLIENTE', 'REGISTRAR_PAGAMENTO', 'MOVER_KANBAN', 'BUSCAR_CLIENTES', 'ABRIR_CLIENTE', 'RESPONDER_PERGUNTA', 'CRIAR_TAREFA', 'RELATORIO', 'CANCELADO', 'ERRO');

-- CreateTable
CREATE TABLE "assistente_interacoes" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT,
    "transcricao" TEXT NOT NULL,
    "resposta" TEXT,
    "tipoAcao" "TipoAcaoAssistente",
    "payload" JSONB,
    "executada" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assistente_interacoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "assistente_interacoes_usuarioId_idx" ON "assistente_interacoes"("usuarioId");

-- CreateIndex
CREATE INDEX "assistente_interacoes_criadoEm_idx" ON "assistente_interacoes"("criadoEm");

-- AddForeignKey
ALTER TABLE "assistente_interacoes" ADD CONSTRAINT "assistente_interacoes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
