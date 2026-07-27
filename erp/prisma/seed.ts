import "dotenv/config";
import { faker } from "@faker-js/faker/locale/pt_BR";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  StatusComercial,
  StatusFinanceiro,
  FormaPagamento,
  TipoPagamento,
  MetodoPagamento,
  TipoDocumento,
  TipoEventoTimeline,
  TipoEvento,
  TipoLancamento,
  PapelUsuario,
  Produto,
  TipoPessoa,
} from "../src/generated/prisma/enums";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDateWithinDays(daysBack: number) {
  const now = Date.now();
  const past = now - Math.floor(Math.random() * daysBack) * 24 * 60 * 60 * 1000;
  return new Date(past);
}

// Mesma regra da aplicação (src/lib/status-cliente.ts).
function calcularStatus(total: number, pago: number) {
  if (total > 0 && pago >= total) {
    return { comercial: StatusComercial.VENDA_FECHADA, financeiro: StatusFinanceiro.PAGO };
  }
  if (pago > 0) {
    return { comercial: StatusComercial.AGUARDANDO_PIX, financeiro: StatusFinanceiro.PAGAMENTO_PARCIAL };
  }
  return { comercial: StatusComercial.ENTRADA_RECEBIDA, financeiro: StatusFinanceiro.NAO_INICIADO };
}

async function main() {
  console.log("Limpando dados existentes...");
  await prisma.timelineEntrada.deleteMany();
  await prisma.observacao.deleteMany();
  await prisma.documento.deleteMany();
  await prisma.pagamento.deleteMany();
  await prisma.parcela.deleteMany();
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

  console.log("Criando clientes...");
  const totalClientes = 60;

  for (let i = 0; i < totalClientes; i++) {
    // 1 em cada 4 clientes é empresa (CNPJ) — o resto é pessoa física (CPF).
    const empresa = i % 4 === 0;
    const nome = empresa ? faker.company.name() : faker.person.fullName();
    const produto = pick([Produto.RATING_COMERCIAL, Produto.LIMPA_NOME]);
    const valorContratado =
      produto === Produto.RATING_COMERCIAL
        ? pick([600, 800, 1000])
        : pick([1200, 1500, 2000, 2500]);

    // Cenário de pagamento
    const cenario = pick(["quitado_avista", "quitado_parcelado", "parcial", "entrada_zero"] as const);
    let pagamentos: { valor: number; tipo: TipoPagamento; offset: number }[] = [];
    let formaPagamento: FormaPagamento;

    if (cenario === "quitado_avista") {
      formaPagamento = FormaPagamento.A_VISTA;
      pagamentos = [{ valor: valorContratado, tipo: TipoPagamento.PAGAMENTO_UNICO, offset: 0 }];
    } else if (cenario === "quitado_parcelado") {
      formaPagamento = FormaPagamento.ENTRADA_MAIS_PARCELAS;
      const entrada = Math.round(valorContratado / 2);
      pagamentos = [
        { valor: entrada, tipo: TipoPagamento.ENTRADA, offset: 0 },
        { valor: valorContratado - entrada, tipo: TipoPagamento.PARCELA, offset: 30 },
      ];
    } else if (cenario === "parcial") {
      formaPagamento = FormaPagamento.ENTRADA_MAIS_PARCELAS;
      pagamentos = [{ valor: Math.round(valorContratado / 2), tipo: TipoPagamento.ENTRADA, offset: 0 }];
    } else {
      formaPagamento = FormaPagamento.PARCELADO;
      pagamentos = [];
    }

    const totalPago = pagamentos.reduce((s, p) => s + p.valor, 0);
    const { comercial, financeiro } = calcularStatus(valorContratado, totalPago);
    const dataEntrada = randomDateWithinDays(180);

    const numeroParcelas =
      formaPagamento === FormaPagamento.A_VISTA ? null : faker.number.int({ min: 2, max: 12 });

    const cliente = await prisma.cliente.create({
      data: {
        nome,
        tipoPessoa: empresa ? TipoPessoa.JURIDICA : TipoPessoa.FISICA,
        cpf: empresa ? null : faker.helpers.replaceSymbols("###.###.###-##"),
        cnpj: empresa ? faker.helpers.replaceSymbols("##.###.###/####-##") : null,
        telefone: faker.phone.number({ style: "national" }),
        whatsapp: faker.phone.number({ style: "national" }),
        endereco: faker.location.streetAddress(),
        responsavelId: pick(usuarios).id,
        dataEntrada,
        produto,
        statusComercial: comercial,
        statusFinanceiro: financeiro,
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

    for (const pag of pagamentos) {
      const dataPagamento = new Date(dataEntrada);
      dataPagamento.setDate(dataPagamento.getDate() + pag.offset);
      await prisma.pagamento.create({
        data: {
          clienteId: cliente.id,
          tipo: pag.tipo,
          metodo: pick([MetodoPagamento.PIX, MetodoPagamento.CARTAO, MetodoPagamento.DINHEIRO]),
          valor: pag.valor,
          dataPagamento,
          registradoPorId: pick(usuarios).id,
        },
      });
      await prisma.timelineEntrada.create({
        data: {
          clienteId: cliente.id,
          tipo: TipoEventoTimeline.PAGAMENTO_RECEBIDO,
          descricao: `Pagamento recebido — R$ ${pag.valor.toFixed(2)}`,
          criadoEm: dataPagamento,
        },
      });
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
            url: `${cliente.id}/seed-${tipo.toLowerCase()}.pdf`,
            tamanho: faker.number.int({ min: 50_000, max: 2_000_000 }),
            enviadoPorId: pick(usuarios).id,
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

  console.log("Criando eventos de agenda...");
  const clientesAmostra = await prisma.cliente.findMany({ take: 30 });
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
        tipo: pick([TipoEvento.LIGACAO, TipoEvento.COBRANCA, TipoEvento.RETORNO, TipoEvento.DOCUMENTACAO, TipoEvento.COMPROMISSO]),
        clienteId: pick(clientesAmostra).id,
        responsavelId: pick(usuarios).id,
        inicio,
        fim,
        concluido: inicio < new Date() ? faker.datatype.boolean({ probability: 0.6 }) : false,
      },
    });
  }

  console.log("Criando despesas (fluxo de caixa)...");
  for (let i = 0; i < 40; i++) {
    const data = randomDateWithinDays(180);
    await prisma.lancamento.create({
      data: {
        tipo: TipoLancamento.DESPESA,
        categoria: pick(["Tráfego pago", "Ferramentas", "Comissão", "Operacional"]),
        descricao: "Despesa operacional",
        valor: faker.number.int({ min: 150, max: 2500 }),
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
