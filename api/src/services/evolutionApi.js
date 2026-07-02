const axios = require('axios');

const client = axios.create({
  baseURL: process.env.EVOLUTION_API_URL,
  headers: {
    'apikey': process.env.EVOLUTION_API_KEY,
    'Content-Type': 'application/json',
  },
});

const INSTANCE = process.env.EVOLUTION_INSTANCE_NAME;

async function enviarMensagem(telefone, texto) {
  await client.post(`/message/sendText/${INSTANCE}`, {
    number: telefone,
    text: texto,
  });
}

// Extrai os dados relevantes do payload que a Evolution API envia no webhook
function extrairMensagemDoWebhook(body) {
  const data = body?.data;
  if (!data) return null;

  const msg = data.message;
  const texto =
    msg?.conversation ||
    msg?.extendedTextMessage?.text ||
    msg?.imageMessage?.caption ||
    null;

  if (!texto) return null;

  const telefone = data.key?.remoteJid?.replace('@s.whatsapp.net', '');
  const fromMe = data.key?.fromMe;

  if (fromMe) return null; // ignora mensagens enviadas pelo próprio número

  return { telefone, texto };
}

module.exports = { enviarMensagem, extrairMensagemDoWebhook };
