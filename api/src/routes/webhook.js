const express = require('express');
const { extrairMensagemDoWebhook } = require('../services/evolutionApi');
const { enviarMensagem } = require('../services/evolutionApi');
const { processarMensagem } = require('../services/claudeAgent');

const router = express.Router();

router.post('/', async (req, res) => {
  // Responde imediatamente para a Evolution API não reenviar o webhook
  res.sendStatus(200);

  const dados = extrairMensagemDoWebhook(req.body);
  if (!dados) return;

  const { telefone, texto } = dados;

  try {
    const resposta = await processarMensagem(telefone, texto);
    await enviarMensagem(telefone, resposta);
  } catch (err) {
    console.error(`Erro ao processar mensagem de ${telefone}:`, err.message);
  }
});

module.exports = router;
