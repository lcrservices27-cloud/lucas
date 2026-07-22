-- CreateEnum
CREATE TYPE "Produto" AS ENUM ('RATING_COMERCIAL', 'LIMPA_NOME');

-- Remapeia status antigos (removidos) para a coluna inicial antes de estreitar o enum
UPDATE "clientes"
SET "statusComercial" = 'ENTRADA_RECEBIDA'
WHERE "statusComercial" IN ('NOVO_LEAD', 'PRIMEIRO_CONTATO', 'NEGOCIACAO');

-- AlterEnum
BEGIN;
CREATE TYPE "StatusComercial_new" AS ENUM ('ENTRADA_RECEBIDA', 'AGUARDANDO_PIX', 'VENDA_FECHADA', 'CANCELADO');
ALTER TABLE "public"."clientes" ALTER COLUMN "statusComercial" DROP DEFAULT;
ALTER TABLE "clientes" ALTER COLUMN "statusComercial" TYPE "StatusComercial_new" USING ("statusComercial"::text::"StatusComercial_new");
ALTER TYPE "StatusComercial" RENAME TO "StatusComercial_old";
ALTER TYPE "StatusComercial_new" RENAME TO "StatusComercial";
DROP TYPE "public"."StatusComercial_old";
ALTER TABLE "clientes" ALTER COLUMN "statusComercial" SET DEFAULT 'ENTRADA_RECEBIDA';
COMMIT;

-- DropForeignKey
ALTER TABLE "tarefas" DROP CONSTRAINT "tarefas_clienteId_fkey";

-- DropForeignKey
ALTER TABLE "tarefas" DROP CONSTRAINT "tarefas_criadorId_fkey";

-- DropForeignKey
ALTER TABLE "tarefas" DROP CONSTRAINT "tarefas_responsavelId_fkey";

-- AlterTable
ALTER TABLE "clientes" ADD COLUMN     "produto" "Produto";

-- DropTable
DROP TABLE "tarefas";

-- DropEnum
DROP TYPE "PrioridadeTarefa";

-- CreateIndex
CREATE INDEX "clientes_produto_idx" ON "clientes"("produto");
