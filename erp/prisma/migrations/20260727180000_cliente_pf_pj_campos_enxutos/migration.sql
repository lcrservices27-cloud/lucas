/*
  Warnings:

  - As colunas `rg`, `email`, `cidade`, `estado` e `origemLead` da tabela `clientes`
    serão removidas junto com os dados que estiverem nelas.
  - Novo campo `tipoPessoa` (FISICA/JURIDICA) e `cnpj` para clientes empresa.
*/

-- CreateEnum
CREATE TYPE "TipoPessoa" AS ENUM ('FISICA', 'JURIDICA');

-- AlterTable
ALTER TABLE "clientes" DROP COLUMN "rg",
DROP COLUMN "email",
DROP COLUMN "cidade",
DROP COLUMN "estado",
DROP COLUMN "origemLead",
ADD COLUMN "tipoPessoa" "TipoPessoa" NOT NULL DEFAULT 'FISICA',
ADD COLUMN "cnpj" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "clientes_cnpj_key" ON "clientes"("cnpj");
