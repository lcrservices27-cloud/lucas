import "dotenv/config";
import { faker } from "@faker-js/faker/locale/pt_BR";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  StatusComercial,
  StatusJuridico,
  StatusFinanceiro,
  FormaPagamento,
  StatusParcela,
  TipoPagamento,
  MetodoPagamento,
  TipoDocumento,
  TipoEventoTimeline,
  PrioridadeTarefa,
  TipoEvento,
  TipoLancamento,
  PapelUsuario,
} from "../src/generated/prisma/enums";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const ESTADOS_CIDADES: Record<string, string[]> = {
  CE: ["Fortaleza", "Caucaia", "Juazeiro do Norte", "Sobral"],
  SP: ["São Paulo", "Campinas", "Guarulhos"],
  RJ: ["Rio de Janeiro", "Niterói"],
  PE: ["Recife", "Olinda"],
  BA: ["Salvador", "Feira de Santana"],
};

const ORIGENS_LEAD = [
  "Instagram Ads",
  "Google Ads",
  "Indicação",
  "WhatsApp",
  "Site",
  "Facebook Ads",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDateWithinDays(daysBack: number) {
  const now = Date.now();
  const past = now - Math.floor(Math.random() * daysBack) * 24 * 60 * 60 * 1000;
  return new Date(past);
}

async function main() {
  console.log("Limpando dados existentes...");
  await prisma.timelineEntrada.deleteMany();
  await prisma.observacao.deleteMany();
  await prisma.documento.deleteMany();
  await prisma.pagamento.deleteMany();
  await prisma.parcela.deleteMany();
  await prisma.tarefa.deleteMany();
  await prisma.evento.deleteMany();
  await prisma.lancamento.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.usuario.deleteMany();

  console.log("Criando usuários...");
  const senhaHash = await bcrypt.hash("lucas123", 10);

  const usuarios = await Promise.all(
    [
      { nome: "Lucas Andrade", email: "lucas@lucaslimpanome.com.br", papel: PapelUsuario.ADMINISTRADOR },
      { nome: "Marina Costa", email: "marina@lucaslimpanome.com.br", papel: PapelUsuario.FINANCEIRO },
      { nome: "Rafael Souza", email: "rafael@lucaslimpanome.com.br", papel: PapelUsuario.ATENDIMENTO },
      { nome: "Bianca Lima", email: "bianca@lucaslimpanome.com.br", papel: PapelUsuario.CONSULTOR },
      { nome: "Diego Martins", email: "diego@lucaslimpanome.com.br", papel: PapelUsuario.JURIDICO },
    ].map((u) => prisma.usuario.create({ data: { ...u, senhaHash } }))
  );

  const statusComercialList = Object.values(StatusComercial);
  const statusJuridicoList = Object.values(StatusJuridico);

  console.log("Criando clientes...");
  const totalClientes = 60;

  for (let i = 0; i < totalClientes; i++) {
    const nome = faker.person.fullName();
    const estado = pick(Object.keys(ESTADOS_CIDADES));
    const cidade = pick(ESTADOS_CIDADES[estado]);
    const statusComercial = pick(statusComercialList);
    const isVendaFechada =
      statusComercial === "VENDA_FECHADA" || statusComercial === "ENTRADA_RECEBIDA";
    const statusJuridico = isVendaFechada ? pick(statusJuridicoList) : "AGUARDANDO_DOCUMENTOS";

    const valorContratado = isVendaFechada
      ? faker.number.int({ min: 1500, max: 8000 })
      : 0;

    const formaPagamento = isVendaFechada
      ? pick([FormaPagamento.A_VISTA, FormaPagamento.ENTRADA_MAIS_PARCELAS, FormaPagamento.PARCELADO])
      : null;

    const numeroParcelas =
      formaPagamento === FormaPagamento.PARCELADO || formaPagamento === FormaPagamento.ENTRADA_MAIS_PARCELAS
        ? faker.number.int({ min: 2, max: 12 })
        : null;

    let statusFinanceiro: StatusFinanceiro = StatusFinanceiro.NAO_INICIADO;
    if (isVendaFechada) {
      statusFinanceiro = pick([
        StatusFinanceiro.ENTRADA_PAGA,
        StatusFinanceiro.PAGAMENTO_PARCIAL,
        StatusFinanceiro.PAGO,
        StatusFinanceiro.ATRASADO,
      ]);
    }

    const dataEntrada = randomDateWithinDays(180);

    const cliente = await prisma.cliente.create({
      data: {
        nome,
        cpf: faker.helpers.replaceSymbols("###.###.###-##"),
        rg: faker.helpers.replaceSymbols("##.###.###-#"),
        telefone: faker.phone.number({ style: "national" }),
        whatsapp: faker.phone.number({ style: "national" }),
        email: faker.internet.email({ firstName: nome.split(" ")[0] }).toLowerCase(),
        cidade,
        estado,
        endereco: faker.location.streetAddress(),
        origemLead: pick(ORIGENS_LEAD),
        responsavelId: pick(usuarios).id,
        dataEntrada,
        statusComercial,
        statusJuridico,
        statusFinanceiro,
        valorContratado,
        formaPagamento,
        numeroParcelas,
      },
    });

    await prisma.timelineEntrada.create({
      data: {
        clienteId: cliente.id,
        tipo: TipoEventoTimeline.CLIENTE_CRIADO,
        descricao: `Cliente ${nome} cadastrado no sistema`,
        criadoEm: dataEntrada,
      },
    });

    // Parcelas + pagamentos para quem já fechou venda
    if (isVendaFechada && valorContratado > 0) {
      const parcelasCount = numeroParcelas ?? 1;
      const valorParcela = Number((valorContratado / parcelasCount).toFixed(2));

      for (let p = 1; p <= parcelasCount; p++) {
        const vencimento = new Date(dataEntrada);
        vencimento.setDate(vencimento.getDate() + 30 * p);

        const pago =
          statusFinanceiro === StatusFinanceiro.PAGO ||
          (statusFinanceiro === StatusFinanceiro.PAGAMENTO_PARCIAL && p <= Math.ceil(parcelasCount / 2)) ||
          (statusFinanceiro === StatusFinanceiro.ENTRADA_PAGA && p === 1);

        const atrasada = !pago && vencimento < new Date() && statusFinanceiro === StatusFinanceiro.ATRASADO;

        const parcela = await prisma.parcela.create({
          data: {
            clienteId: cliente.id,
            numero: p,
            valor: valorParcela,
            vencimento,
            status: pago
              ? StatusParcela.PAGA
              : atrasada
                ? StatusParcela.ATRASADA
                : StatusParcela.PENDENTE,
          },
        });

        if (pago) {
          const dataPagamento = new Date(vencimento);
          dataPagamento.setDate(dataPagamento.getDate() - faker.number.int({ min: 0, max: 5 }));
          await prisma.pagamento.create({
            data: {
              clienteId: cliente.id,
              parcelaId: parcela.id,
              tipo: p === 1 ? TipoPagamento.ENTRADA : TipoPagamento.PARCELA,
              metodo: pick([MetodoPagamento.PIX, MetodoPagamento.CARTAO, MetodoPagamento.BOLETO]),
              valor: valorParcela,
              dataPagamento,
              registradoPorId: pick(usuarios).id,
            },
          });
          await prisma.timelineEntrada.create({
            data: {
              clienteId: cliente.id,
              tipo: TipoEventoTimeline.PAGAMENTO_RECEBIDO,
              descricao: `Pagamento da parcela ${p}/${parcelasCount} recebido — R$ ${valorParcela.toFixed(2)}`,
              criadoEm: dataPagamento,
            },
          });
        }
      }
    }

    // Documentos
    if (faker.datatype.boolean({ probability: 0.7 })) {
      const docs = faker.helpers.arrayElements(
        [TipoDocumento.CPF, TipoDocumento.RG, TipoDocumento.CONTRATO, TipoDocumento.COMPROVANTE_PIX],
        { min: 1, max: 3 }
      );
      for (const tipo of docs) {
        await prisma.documento.create({
          data: {
            clienteId: cliente.id,
            tipo,
            nomeArquivo: `${tipo.toLowerCase()}-${cliente.id.slice(0, 6)}.pdf`,
            url: `/uploads/placeholder-${tipo.toLowerCase()}.pdf`,
            tamanho: faker.number.int({ min: 50_000, max: 2_000_000 }),
            enviadoPorId: pick(usuarios).id,
          },
        });
        await prisma.timelineEntrada.create({
          data: {
            clienteId: cliente.id,
            tipo: TipoEventoTimeline.DOCUMENTO_ENVIADO,
            descricao: `Documento (${tipo}) enviado`,
          },
        });
      }
    }

    // Observações
    if (faker.datatype.boolean({ probability: 0.5 })) {
      await prisma.observacao.create({
        data: {
          clienteId: cliente.id,
          autorId: pick(usuarios).id,
          conteudo: faker.lorem.sentence({ min: 6, max: 16 }),
        },
      });
    }
  }

  console.log("Criando tarefas...");
  const clientesAmostra = await prisma.cliente.findMany({ take: 30 });
  for (const cliente of clientesAmostra) {
    if (faker.datatype.boolean({ probability: 0.4 })) {
      const prazo = new Date();
      prazo.setDate(prazo.getDate() + faker.number.int({ min: -3, max: 14 }));
      await prisma.tarefa.create({
        data: {
          titulo: pick([
            "Ligar para confirmar documentação",
            "Enviar proposta atualizada",
            "Cobrar parcela em atraso",
            "Solicitar comprovante de residência",
            "Follow-up pós diagnóstico",
          ]),
          clienteId: cliente.id,
          responsavelId: pick(usuarios).id,
          criadorId: pick(usuarios).id,
          prioridade: pick([PrioridadeTarefa.BAIXA, PrioridadeTarefa.MEDIA, PrioridadeTarefa.ALTA]),
          prazo,
          concluida: faker.datatype.boolean({ probability: 0.3 }),
        },
      });
    }
  }

  console.log("Criando eventos de agenda...");
  for (let i = 0; i < 25; i++) {
    const inicio = new Date();
    inicio.setDate(inicio.getDate() + faker.number.int({ min: -5, max: 20 }));
    inicio.setHours(faker.number.int({ min: 8, max: 18 }), pick([0, 15, 30, 45]));
    const fim = new Date(inicio);
    fim.setMinutes(fim.getMinutes() + 30);

    await prisma.evento.create({
      data: {
        titulo: pick([
          "Ligação de diagnóstico",
          "Cobrança de parcela",
          "Retorno ao cliente",
          "Envio de documentação",
          "Reunião comercial",
        ]),
        tipo: pick([
          TipoEvento.LIGACAO,
          TipoEvento.COBRANCA,
          TipoEvento.RETORNO,
          TipoEvento.DOCUMENTACAO,
          TipoEvento.COMPROMISSO,
        ]),
        clienteId: pick(clientesAmostra).id,
        responsavelId: pick(usuarios).id,
        inicio,
        fim,
        concluido: inicio < new Date() ? faker.datatype.boolean({ probability: 0.6 }) : false,
      },
    });
  }

  console.log("Criando lançamentos financeiros (fluxo de caixa)...");
  for (let i = 0; i < 90; i++) {
    const data = randomDateWithinDays(180);
    const tipo = faker.datatype.boolean({ probability: 0.65 }) ? TipoLancamento.RECEITA : TipoLancamento.DESPESA;
    await prisma.lancamento.create({
      data: {
        tipo,
        categoria:
          tipo === "RECEITA"
            ? pick(["Contrato fechado", "Parcela recebida", "Entrada"])
            : pick(["Tráfego pago", "Ferramentas", "Comissão", "Operacional"]),
        descricao: tipo === "RECEITA" ? "Recebimento de cliente" : "Despesa operacional",
        valor: faker.number.int({ min: 150, max: 4000 }),
        data,
      },
    });
  }

  console.log("Seed concluído.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
