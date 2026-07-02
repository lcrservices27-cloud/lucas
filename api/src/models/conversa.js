const pool = require('../config/database');

async function salvarMensagem(telefone, remetente, mensagem) {
  await pool.query(
    'INSERT INTO conversas (telefone, remetente, mensagem) VALUES ($1, $2, $3)',
    [telefone, remetente, mensagem]
  );
}

async function buscarHistorico(telefone, limite = 20) {
  const { rows } = await pool.query(
    `SELECT remetente, mensagem
     FROM conversas
     WHERE telefone = $1
     ORDER BY criado_em DESC
     LIMIT $2`,
    [telefone, limite]
  );
  // Retorna do mais antigo para o mais recente (para montar o contexto do Claude)
  return rows.reverse();
}

module.exports = { salvarMensagem, buscarHistorico };
