
-- DropIndex
DROP INDEX "clientes_statusJuridico_idx";

-- AlterTable
ALTER TABLE "clientes" DROP COLUMN "statusJuridico";

-- DropEnum
DROP TYPE "StatusJuridico";

