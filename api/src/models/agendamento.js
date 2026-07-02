const pool = require('../config/database');

async function criarAgendamento({ nomePaciente, telefone, procedimento, horario, convenio }) {
  const { rows } = await pool.query(
    `INSERT INTO agendamentos (nome_paciente, telefone, procedimento, horario, convenio)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [nomePaciente || null, telefone, procedimento, horario, convenio || null]
  );
  return rows[0].id;
}

async function buscarAgendamentosPorTelefone(telefone) {
  const { rows } = await pool.query(
    `SELECT * FROM agendamentos WHERE telefone = $1 ORDER BY criado_em DESC`,
    [telefone]
  );
  return rows;
}

module.exports = { criarAgendamento, buscarAgendamentosPorTelefone };
