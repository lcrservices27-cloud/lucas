#!/usr/bin/env bash
#
# Deploy do "Lucas Rufino Financeiro" na Vercel — automatizado.
#
# Uso (a partir da pasta financeiro/):
#     ./deploy.sh
#
# Você pode pré-definir valores para rodar sem perguntas:
#     DATABASE_URL="postgresql://..." ./deploy.sh
#
# O que ele faz:
#   1. Garante a Vercel CLI instalada e você autenticado (abre o navegador).
#   2. Vincula esta pasta a um projeto Vercel (Root Directory = financeiro).
#   3. Pede/usa a DATABASE_URL do Postgres e gera o NEXTAUTH_SECRET.
#   4. Configura as variáveis de ambiente (production/preview/development).
#   5. Faz o deploy de produção, descobre a URL e ajusta o NEXTAUTH_URL.
#   6. Reimplanta para o NEXTAUTH_URL valer e mostra a URL final.

set -euo pipefail

# Sempre opera a partir da pasta deste script (a raiz do app Next.js).
cd "$(dirname "$0")"

info()  { printf '\033[1;32m▶ %s\033[0m\n' "$*"; }
warn()  { printf '\033[1;33m! %s\033[0m\n' "$*"; }

ask() {
  # ask VAR "mensagem" — lê do teclado mesmo se stdin estiver ocupado.
  local __var="$1" __msg="$2" __val=""
  read -r -p "$__msg" __val </dev/tty
  printf -v "$__var" '%s' "$__val"
}

# 1) Vercel CLI ---------------------------------------------------------------
if ! command -v vercel >/dev/null 2>&1; then
  info "Instalando a Vercel CLI (npm i -g vercel)…"
  npm i -g vercel
fi

# 2) Login --------------------------------------------------------------------
if ! vercel whoami >/dev/null 2>&1; then
  info "Faça login na Vercel (vai abrir o navegador)…"
  vercel login
fi
info "Autenticado como: $(vercel whoami)"

# 3) Vincular o projeto -------------------------------------------------------
# Rodando de dentro de financeiro/, esta pasta vira o Root Directory do projeto.
if [ ! -f ".vercel/project.json" ]; then
  info "Vinculando esta pasta a um projeto Vercel…"
  vercel link
else
  info "Projeto já vinculado (.vercel/project.json encontrado)."
fi

# 4) Variáveis de ambiente ----------------------------------------------------
if [ -z "${DATABASE_URL:-}" ]; then
  echo
  warn "Preciso da connection string do Postgres."
  warn "Vercel Postgres: painel → Storage → Create Database → copie POSTGRES_PRISMA_URL."
  warn "Neon/Supabase: copie a URL de conexão (inclua ?sslmode=require)."
  ask DATABASE_URL "DATABASE_URL: "
fi
if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL vazia — abortando." >&2
  exit 1
fi

NEXTAUTH_SECRET="${NEXTAUTH_SECRET:-$(openssl rand -base64 32)}"

set_env() {
  # set_env NOME VALOR ambiente
  local name="$1" val="$2" target="$3"
  vercel env rm "$name" "$target" -y >/dev/null 2>&1 || true
  printf '%s' "$val" | vercel env add "$name" "$target" >/dev/null 2>&1
  echo "    · $name ($target)"
}

info "Configurando variáveis de ambiente…"
for target in production preview development; do
  set_env DATABASE_URL    "$DATABASE_URL"    "$target"
  set_env NEXTAUTH_SECRET "$NEXTAUTH_SECRET" "$target"
done

# 5) Primeiro deploy (para descobrir a URL) -----------------------------------
info "Fazendo o deploy de produção (o build roda prisma db push)…"
DEPLOY_URL="$(vercel deploy --prod --yes | tail -n 1)"
info "Deploy criado: $DEPLOY_URL"

# 6) NEXTAUTH_URL + reimplantar -----------------------------------------------
info "Ajustando NEXTAUTH_URL e reimplantando…"
for target in production preview development; do
  set_env NEXTAUTH_URL "$DEPLOY_URL" "$target"
done
FINAL_URL="$(vercel deploy --prod --yes | tail -n 1)"

echo
info "Pronto! ✅"
echo "  URL pública:   $FINAL_URL"
echo "  Login:         lucasrufino@financeiro.app"
echo "  Senha:         12345678"
echo
echo "  Os dados iniciais (despesas fixas e meta) são criados no primeiro login."
echo "  Dica: se você configurar um domínio de produção fixo na Vercel, atualize"
echo "  a variável NEXTAUTH_URL para esse domínio e reimplante."
