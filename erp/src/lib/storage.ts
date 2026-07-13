import "server-only";
import path from "node:path";

// Fora de public/ de propósito: os arquivos contêm dados sensíveis (CPF, RG,
// contratos) e são servidos exclusivamente pela rota autenticada
// /api/documentos/[id].
export const STORAGE_ROOT = path.join(process.cwd(), "uploads");

// Resolve a chave de storage para um caminho absoluto, garantindo que o
// resultado permaneça dentro de STORAGE_ROOT (nega qualquer traversal).
export function resolveStoragePath(storageKey: string): string | null {
  const abs = path.resolve(STORAGE_ROOT, storageKey.replace(/^\/+/, ""));
  if (!abs.startsWith(STORAGE_ROOT + path.sep)) return null;
  return abs;
}
