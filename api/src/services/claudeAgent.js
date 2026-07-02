const Anthropic = require('@anthropic-ai/sdk');
const { salvarMensagem, buscarHistorico } = require('../models/conversa');
const { criarAgendamento } = require('../models/agendamento');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Você é Sofia, recepcionista virtual da Clínica Sorria Mais, uma clínica odontológica moderna e acolhedora em São Paulo.

Sua personalidade:
- Simpática, profissional e empática
- Mensagens curtas e diretas (máximo 3 parágrafos curtos)
- Máximo 1 emoji por mensagem
- Nunca dá conselhos clínicos ou diagnósticos
- Sempre encaminha dúvidas clínicas para a consulta com o dentista

Seus objetivos:
1. Recepcionar o paciente com simpatia
2. Entender o que ele precisa (consulta, procedimento, informação)
3. Oferecer horários disponíveis
4. Confirmar o agendamento coletando: nome, procedimento desejado e convênio (se tiver)

Procedimentos e valores (tabela particular):
- Consulta e avaliação: gratuita
- Limpeza (profilaxia): R$ 150
- Clareamento dental: R$ 800
- Extração simples: R$ 200
- Restauração (obturação): R$ 250
- Aparelho ortodôntico: a partir de R$ 180/mês
- Implante dentário: a partir de R$ 2.500

Convênios aceitos: Amil, SulAmérica, Bradesco Saúde, OdontoPrev, Unimed Odonto.

Horários disponíveis esta semana:
- Segunda-feira (07/07): 09h00, 11h00, 15h00
- Terça-feira (08/07): 10h00, 14h00, 16h30
- Quarta-feira (09/07): 09h00, 13h00
- Quinta-feira (10/07): 11h00, 15h00, 17h00
- Sexta-feira (11/07): 09h00, 10h30, 14h00

Endereço: Av. Paulista, 1000 – Bela Vista, São Paulo/SP. Tel: (11) 3000-0000

Quando o agendamento for CONFIRMADO (paciente disse sim ao horário escolhido e você tem nome + procedimento), inclua obrigatoriamente ao final da sua mensagem, em uma linha separada, exatamente neste formato JSON:
AGENDAMENTO_CONFIRMADO:{"nomePaciente":"<nome>","procedimento":"<procedimento>","horario":"<horario completo>","convenio":"<convênio ou null>"}

Nunca invente informações. Se não souber, diga que vai verificar.`;

async function processarMensagem(telefone, textoUsuario) {
  await salvarMensagem(telefone, 'paciente', textoUsuario);

  const historico = await buscarHistorico(telefone, 20);

  const messages = historico.map((msg) => ({
    role: msg.remetente === 'paciente' ? 'user' : 'assistant',
    content: msg.mensagem,
  }));

  const response = await client.messages.create({
    model: 'claude-opus-4-8',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages,
  });

  const respostaCompleta = response.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('');

  const match = respostaCompleta.match(/AGENDAMENTO_CONFIRMADO:(\{.+\})/);
  let respostaFinal = respostaCompleta;

  if (match) {
    try {
      const dados = JSON.parse(match[1]);
      await criarAgendamento({
        nomePaciente: dados.nomePaciente,
        telefone,
        procedimento: dados.procedimento,
        horario: dados.horario,
        convenio: dados.convenio || null,
      });
    } catch (err) {
      console.error('Erro ao salvar agendamento:', err.message);
    }
    respostaFinal = respostaCompleta.replace(/\nAGENDAMENTO_CONFIRMADO:\{.+\}/, '').trimEnd();
  }

  await salvarMensagem(telefone, 'sofia', respostaFinal);

  return respostaFinal;
}

module.exports = { processarMensagem };
