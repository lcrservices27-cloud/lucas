-- CreateEnum
CREATE TYPE "Objetivo" AS ENUM ('EMPRESTIMO', 'FINANCIAMENTO', 'CARTAO', 'LIMPAR_NOME', 'OUTRO');

-- CreateEnum
CREATE TYPE "RespostaRecusado" AS ENUM ('SIM', 'NAO', 'NUNCA');

-- CreateEnum
CREATE TYPE "RespostaTriplo" AS ENUM ('SIM', 'NAO', 'NAO_SEI');

-- CreateEnum
CREATE TYPE "FaixaScore" AS ENUM ('ATE_300', 'DE_301_500', 'DE_501_700', 'ACIMA_700', 'NAO_SEI');

-- CreateEnum
CREATE TYPE "StatusIndice" AS ENUM ('ATENCAO', 'MODERADO', 'SAUDAVEL');

-- CreateTable
CREATE TABLE "diagnosticos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "objetivo" "Objetivo" NOT NULL,
    "recusado" "RespostaRecusado" NOT NULL,
    "dividas" "RespostaTriplo" NOT NULL,
    "negativado" "RespostaTriplo" NOT NULL,
    "faixaScore" "FaixaScore" NOT NULL,
    "indice" INTEGER NOT NULL,
    "status" "StatusIndice" NOT NULL,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "referrer" TEXT,
    "converteu" BOOLEAN NOT NULL DEFAULT false,
    "convertidoEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "diagnosticos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "diagnosticos_cpf_idx" ON "diagnosticos"("cpf");

-- CreateIndex
CREATE INDEX "diagnosticos_criadoEm_idx" ON "diagnosticos"("criadoEm");

-- CreateIndex
CREATE INDEX "diagnosticos_status_idx" ON "diagnosticos"("status");

-- CreateIndex
CREATE INDEX "diagnosticos_converteu_idx" ON "diagnosticos"("converteu");

-- CreateIndex
CREATE INDEX "diagnosticos_utmSource_idx" ON "diagnosticos"("utmSource");
