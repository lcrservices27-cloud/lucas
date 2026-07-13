-- CreateEnum
CREATE TYPE "PapelUsuario" AS ENUM ('ADMINISTRADOR', 'FINANCEIRO', 'ATENDIMENTO', 'CONSULTOR', 'JURIDICO');

-- CreateEnum
CREATE TYPE "StatusComercial" AS ENUM ('NOVO_LEAD', 'PRIMEIRO_CONTATO', 'NEGOCIACAO', 'AGUARDANDO_PIX', 'ENTRADA_RECEBIDA', 'VENDA_FECHADA', 'CANCELADO');

-- CreateEnum
CREATE TYPE "StatusJuridico" AS ENUM ('AGUARDANDO_DOCUMENTOS', 'DOCUMENTOS_RECEBIDOS', 'AGUARDANDO_ENVIO', 'ENVIADO_AO_PARCEIRO', 'EM_ANALISE', 'PROCESSO_PROTOCOLADO', 'AGUARDANDO_DECISAO', 'CONCLUIDO', 'AGUARDANDO_PAGAMENTO_FINAL', 'FINALIZADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "StatusFinanceiro" AS ENUM ('NAO_INICIADO', 'ENTRADA_PAGA', 'PAGAMENTO_PARCIAL', 'PAGO', 'ATRASADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "FormaPagamento" AS ENUM ('A_VISTA', 'ENTRADA_MAIS_PARCELAS', 'PARCELADO');

-- CreateEnum
CREATE TYPE "StatusParcela" AS ENUM ('PENDENTE', 'PAGA', 'ATRASADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "TipoPagamento" AS ENUM ('ENTRADA', 'PARCELA', 'PAGAMENTO_UNICO', 'PAGAMENTO_FINAL');

-- CreateEnum
CREATE TYPE "MetodoPagamento" AS ENUM ('PIX', 'DINHEIRO', 'CARTAO', 'BOLETO', 'TRANSFERENCIA');

-- CreateEnum
CREATE TYPE "TipoLancamento" AS ENUM ('RECEITA', 'DESPESA');

-- CreateEnum
CREATE TYPE "TipoDocumento" AS ENUM ('CPF', 'RG', 'CNH', 'CONTRATO', 'COMPROVANTE_PIX', 'PDF', 'IMAGEM', 'OUTRO');

-- CreateEnum
CREATE TYPE "TipoEventoTimeline" AS ENUM ('CLIENTE_CRIADO', 'STATUS_ALTERADO', 'PAGAMENTO_RECEBIDO', 'DOCUMENTO_ENVIADO', 'OBSERVACAO_CRIADA', 'TAREFA_CRIADA', 'TAREFA_CONCLUIDA', 'LOGIN_REALIZADO', 'OUTRO');

-- CreateEnum
CREATE TYPE "PrioridadeTarefa" AS ENUM ('BAIXA', 'MEDIA', 'ALTA');

-- CreateEnum
CREATE TYPE "TipoEvento" AS ENUM ('LIGACAO', 'COBRANCA', 'RETORNO', 'DOCUMENTACAO', 'COMPROMISSO');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "papel" "PapelUsuario" NOT NULL DEFAULT 'ATENDIMENTO',
    "avatarUrl" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT,
    "rg" TEXT,
    "telefone" TEXT,
    "whatsapp" TEXT,
    "email" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "endereco" TEXT,
    "origemLead" TEXT,
    "responsavelId" TEXT,
    "dataEntrada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statusComercial" "StatusComercial" NOT NULL DEFAULT 'NOVO_LEAD',
    "statusJuridico" "StatusJuridico" NOT NULL DEFAULT 'AGUARDANDO_DOCUMENTOS',
    "statusFinanceiro" "StatusFinanceiro" NOT NULL DEFAULT 'NAO_INICIADO',
    "valorContratado" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "formaPagamento" "FormaPagamento",
    "numeroParcelas" INTEGER,
    "fotoUrl" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parcelas" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "valor" DECIMAL(12,2) NOT NULL,
    "vencimento" TIMESTAMP(3) NOT NULL,
    "status" "StatusParcela" NOT NULL DEFAULT 'PENDENTE',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parcelas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagamentos" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "parcelaId" TEXT,
    "tipo" "TipoPagamento" NOT NULL,
    "metodo" "MetodoPagamento" NOT NULL DEFAULT 'PIX',
    "valor" DECIMAL(12,2) NOT NULL,
    "dataPagamento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "registradoPorId" TEXT,
    "comprovanteUrl" TEXT,
    "observacao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pagamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lancamentos" (
    "id" TEXT NOT NULL,
    "tipo" "TipoLancamento" NOT NULL,
    "categoria" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" DECIMAL(12,2) NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lancamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentos" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "tipo" "TipoDocumento" NOT NULL DEFAULT 'OUTRO',
    "nomeArquivo" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "tamanho" INTEGER,
    "enviadoPorId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "observacoes" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "autorId" TEXT,
    "conteudo" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "observacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timeline_entradas" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "tipo" "TipoEventoTimeline" NOT NULL,
    "descricao" TEXT NOT NULL,
    "usuarioId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "timeline_entradas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tarefas" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "clienteId" TEXT,
    "responsavelId" TEXT,
    "criadorId" TEXT,
    "prioridade" "PrioridadeTarefa" NOT NULL DEFAULT 'MEDIA',
    "prazo" TIMESTAMP(3),
    "concluida" BOOLEAN NOT NULL DEFAULT false,
    "concluidaEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tarefas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventos" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "tipo" "TipoEvento" NOT NULL DEFAULT 'COMPROMISSO',
    "clienteId" TEXT,
    "responsavelId" TEXT,
    "inicio" TIMESTAMP(3) NOT NULL,
    "fim" TIMESTAMP(3),
    "concluido" BOOLEAN NOT NULL DEFAULT false,
    "observacao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eventos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_cpf_key" ON "clientes"("cpf");

-- CreateIndex
CREATE INDEX "clientes_nome_idx" ON "clientes"("nome");

-- CreateIndex
CREATE INDEX "clientes_statusComercial_idx" ON "clientes"("statusComercial");

-- CreateIndex
CREATE INDEX "clientes_statusJuridico_idx" ON "clientes"("statusJuridico");

-- CreateIndex
CREATE INDEX "clientes_statusFinanceiro_idx" ON "clientes"("statusFinanceiro");

-- CreateIndex
CREATE INDEX "parcelas_clienteId_idx" ON "parcelas"("clienteId");

-- CreateIndex
CREATE INDEX "parcelas_vencimento_idx" ON "parcelas"("vencimento");

-- CreateIndex
CREATE UNIQUE INDEX "pagamentos_parcelaId_key" ON "pagamentos"("parcelaId");

-- CreateIndex
CREATE INDEX "pagamentos_clienteId_idx" ON "pagamentos"("clienteId");

-- CreateIndex
CREATE INDEX "pagamentos_dataPagamento_idx" ON "pagamentos"("dataPagamento");

-- CreateIndex
CREATE INDEX "lancamentos_data_idx" ON "lancamentos"("data");

-- CreateIndex
CREATE INDEX "lancamentos_tipo_idx" ON "lancamentos"("tipo");

-- CreateIndex
CREATE INDEX "documentos_clienteId_idx" ON "documentos"("clienteId");

-- CreateIndex
CREATE INDEX "observacoes_clienteId_idx" ON "observacoes"("clienteId");

-- CreateIndex
CREATE INDEX "timeline_entradas_clienteId_idx" ON "timeline_entradas"("clienteId");

-- CreateIndex
CREATE INDEX "timeline_entradas_criadoEm_idx" ON "timeline_entradas"("criadoEm");

-- CreateIndex
CREATE INDEX "tarefas_responsavelId_idx" ON "tarefas"("responsavelId");

-- CreateIndex
CREATE INDEX "tarefas_concluida_idx" ON "tarefas"("concluida");

-- CreateIndex
CREATE INDEX "eventos_inicio_idx" ON "eventos"("inicio");

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parcelas" ADD CONSTRAINT "parcelas_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagamentos" ADD CONSTRAINT "pagamentos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagamentos" ADD CONSTRAINT "pagamentos_parcelaId_fkey" FOREIGN KEY ("parcelaId") REFERENCES "parcelas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagamentos" ADD CONSTRAINT "pagamentos_registradoPorId_fkey" FOREIGN KEY ("registradoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_enviadoPorId_fkey" FOREIGN KEY ("enviadoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "observacoes" ADD CONSTRAINT "observacoes_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "observacoes" ADD CONSTRAINT "observacoes_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeline_entradas" ADD CONSTRAINT "timeline_entradas_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeline_entradas" ADD CONSTRAINT "timeline_entradas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarefas" ADD CONSTRAINT "tarefas_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarefas" ADD CONSTRAINT "tarefas_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarefas" ADD CONSTRAINT "tarefas_criadorId_fkey" FOREIGN KEY ("criadorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos" ADD CONSTRAINT "eventos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos" ADD CONSTRAINT "eventos_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
