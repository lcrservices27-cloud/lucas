export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

export function extrairNumero(texto: string): number | null {
  const semAcento = normalizar(texto);

  const comMilhar = semAcento.match(/\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?/);
  if (comMilhar) {
    const limpo = comMilhar[0].replace(/\./g, "").replace(",", ".");
    const valor = Number(limpo);
    return Number.isFinite(valor) ? valor : null;
  }

  const simples = semAcento.match(/\d+(?:[.,]\d{1,2})?/);
  if (simples) {
    const valor = Number(simples[0].replace(",", "."));
    return Number.isFinite(valor) ? valor : null;
  }

  return null;
}

export function extrairDigitos(texto: string): string | null {
  const digitos = texto.replace(/\D/g, "");
  return digitos.length > 0 ? digitos : null;
}
