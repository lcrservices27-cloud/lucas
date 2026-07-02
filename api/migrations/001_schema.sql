CREATE TABLE IF NOT EXISTS conversas (
  id SERIAL PRIMARY KEY,
  telefone VARCHAR(30) NOT NULL,
  remetente VARCHAR(20) NOT NULL CHECK (remetente IN ('paciente', 'sofia')),
  mensagem TEXT NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversas_telefone ON conversas (telefone, criado_em);

CREATE TABLE IF NOT EXISTS agendamentos (
  id SERIAL PRIMARY KEY,
  nome_paciente VARCHAR(120),
  telefone VARCHAR(30) NOT NULL,
  procedimento VARCHAR(100) NOT NULL,
  horario VARCHAR(50) NOT NULL,
  convenio VARCHAR(80),
  status VARCHAR(20) NOT NULL DEFAULT 'confirmado' CHECK (status IN ('confirmado', 'cancelado', 'realizado')),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agendamentos_telefone ON agendamentos (telefone);
