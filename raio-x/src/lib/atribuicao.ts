// Atribuição de tráfego (client-side). Os anúncios levam o usuário à landing
// com ?utm_source=...&utm_medium=...&utm_campaign=... — capturamos na primeira
// visita e guardamos em sessionStorage, para não perder a origem quando o
// usuário navega da home para o quiz (o clique não propaga a query string).

const CHAVE = "raiox_atribuicao";

export type Atribuicao = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referrer?: string;
};

export function capturarAtribuicaoDaUrl(): void {
  if (typeof window === "undefined") return;
  const q = new URLSearchParams(window.location.search);
  const nova: Atribuicao = {
    utmSource: q.get("utm_source") ?? undefined,
    utmMedium: q.get("utm_medium") ?? undefined,
    utmCampaign: q.get("utm_campaign") ?? undefined,
  };
  const temUtm = nova.utmSource || nova.utmMedium || nova.utmCampaign;
  // Só grava na primeira atribuição (first-touch) — não sobrescreve.
  if (temUtm && !sessionStorage.getItem(CHAVE)) {
    if (document.referrer) nova.referrer = document.referrer;
    sessionStorage.setItem(CHAVE, JSON.stringify(nova));
  }
}

export function lerAtribuicao(): Atribuicao {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(CHAVE);
    return raw ? (JSON.parse(raw) as Atribuicao) : {};
  } catch {
    return {};
  }
}
