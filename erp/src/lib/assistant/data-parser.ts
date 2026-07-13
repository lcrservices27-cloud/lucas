import { addDays, nextDay, setHours, setMinutes, setSeconds, setMilliseconds, type Day } from "date-fns";
import { normalizar } from "@/lib/assistant/normalize";

const DIAS_SEMANA: Record<string, Day> = {
  domingo: 0,
  segunda: 1,
  "segunda-feira": 1,
  terca: 2,
  "terca-feira": 2,
  quarta: 3,
  "quarta-feira": 3,
  quinta: 4,
  "quinta-feira": 4,
  sexta: 5,
  "sexta-feira": 5,
  sabado: 6,
};

export function parseDataHoraPtBr(texto: string, agora: Date = new Date()): Date {
  const t = normalizar(texto);
  let base = agora;

  if (t.includes("depois de amanha")) {
    base = addDays(agora, 2);
  } else if (t.includes("amanha")) {
    base = addDays(agora, 1);
  } else if (t.includes("hoje")) {
    base = agora;
  } else {
    for (const [nome, dia] of Object.entries(DIAS_SEMANA)) {
      if (t.includes(nome)) {
        base = nextDay(agora, dia);
        break;
      }
    }
  }

  const horaMatch = t.match(/(\d{1,2})(?:[:h](\d{2}))?\s*(?:horas?)?/);
  let hora = 9;
  let minuto = 0;
  if (horaMatch) {
    const h = Number(horaMatch[1]);
    if (h >= 0 && h <= 23) {
      hora = h;
      minuto = horaMatch[2] ? Number(horaMatch[2]) : 0;
    }
  }

  let resultado = setHours(base, hora);
  resultado = setMinutes(resultado, minuto);
  resultado = setSeconds(resultado, 0);
  resultado = setMilliseconds(resultado, 0);
  return resultado;
}
