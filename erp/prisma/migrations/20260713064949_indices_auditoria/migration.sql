-- CreateIndex
CREATE INDEX "clientes_atualizadoEm_idx" ON "clientes"("atualizadoEm");

-- CreateIndex
CREATE INDEX "parcelas_status_vencimento_idx" ON "parcelas"("status", "vencimento");
