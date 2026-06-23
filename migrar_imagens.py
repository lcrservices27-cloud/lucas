import os, re, sys, html, hashlib, glob, urllib.request, urllib.parse

ROOT = "."
IMG_DIR = os.path.join(ROOT, "imagens")
os.makedirs(IMG_DIR, exist_ok=True)

# DRY=1 -> não baixa nada; só coleta, simula a reescrita numa cópia em memória
# e valida que sobrariam 0 referências externas. Use pra conferir o alcance.
DRY = os.environ.get("DRY") == "1"

# Só migramos terceiros. floraquiteria.com.br (ex.: og.jpg) fica absoluto de propósito.
MIGRAR = ("cdn.awsli.com.br", "images.unsplash.com")
HOSTS_RE = r"(?:cdn\.awsli\.com\.br|images\.unsplash\.com)"
TEXT_EXT = (".html", ".txt", ".js", ".css", ".xml")

# Captura a URL nos dois hosts COM OU SEM extensão de arquivo.
# Aceita as formas de query escapadas que aparecem no build: &amp; (HTML) e & (JS/flight).
# Para o terminador, exclui aspas, espaço, ), <, >, crase e barra invertida solta —
# mas permite explicitamente & e &amp; como parte da URL.
URL_RE = re.compile(
    r'https?://' + HOSTS_RE + r'(?:\\u0026|&amp;|[^\s"\'`)\\<>])+',
    re.I,
)

files = [p for ext in TEXT_EXT for p in glob.glob(os.path.join(ROOT, "**", "*"+ext), recursive=True)]

def desescapar(u):
    # resolve as 3 formas para obter a URL "limpa" de download
    return html.unescape(u).replace("\\u0026", "&").replace("\\u002F", "/")

# 1) coletar todas as ocorrências (exatas, como aparecem no arquivo)
ocorrencias = set()
for f in files:
    try: txt = open(f, encoding="utf-8", errors="ignore").read()
    except: continue
    for m in URL_RE.findall(txt):
        if any(h in m for h in MIGRAR):
            ocorrencias.add(m)

# agrupa por URL limpa para saber quantas imagens distintas existem
limpas = {desescapar(o) for o in ocorrencias}
print(f"Ocorrências (formas distintas): {len(ocorrencias)} | imagens distintas (URL limpa): {len(limpas)}")

def nome_local(fetch_url):
    p = urllib.parse.urlparse(fetch_url)
    base = os.path.basename(p.path)
    nome, ext = os.path.splitext(base)
    if not ext or ext.lower() not in (".jpg",".jpeg",".png",".webp",".avif"):
        ext = ".jpg"  # unsplash não traz extensão no path
    slug = re.sub(r'[^a-zA-Z0-9_-]+', '-', nome)[:40] or "img"
    h = hashlib.md5(fetch_url.encode()).hexdigest()[:8]
    return f"{slug}-{h}{ext.lower()}"

# 2) baixar (deduplicando pela URL "limpa"); mapear cada ocorrência -> caminho local
mapa, baixados, falhas = {}, {}, []
for oc in sorted(ocorrencias):
    fetch = desescapar(oc)
    if fetch not in baixados:
        fn = nome_local(fetch)
        dest = os.path.join(IMG_DIR, fn)
        if DRY:
            baixados[fetch] = "/imagens/" + fn
        else:
            if not os.path.exists(dest):
                try:
                    req = urllib.request.Request(fetch, headers={"User-Agent": "Mozilla/5.0"})
                    data = urllib.request.urlopen(req, timeout=40).read()
                    open(dest, "wb").write(data)
                    print("baixado:", fn)
                except Exception as e:
                    falhas.append((fetch, str(e)))
                    print("FALHA:", fetch, "->", e)
                    continue
            baixados[fetch] = "/imagens/" + fn
    mapa[oc] = baixados[fetch]

if falhas:
    print("\n⚠ DOWNLOADS FALHARAM — corrija antes de prosseguir. NÃO reescrevi nada.")
    for u, e in falhas: print("  ", u, "->", e)
    sys.exit(1)

# 3) reescrever referências (ocorrência mais longa primeiro)
reescritos = 0
for f in files:
    try: txt = open(f, encoding="utf-8", errors="ignore").read()
    except: continue
    orig = txt
    for oc in sorted(mapa, key=len, reverse=True):
        if oc in txt:
            txt = txt.replace(oc, mapa[oc])
    if txt != orig:
        reescritos += 1
        if not DRY:
            open(f, "w", encoding="utf-8").write(txt)

# 4) validar: não pode sobrar NENHUMA referência aos hosts de terceiros (literal)
restantes = 0
exemplos = []
for f in files:
    try: txt = open(f, encoding="utf-8", errors="ignore").read()
    except: continue
    if DRY:  # valida sobre a versão já reescrita em memória
        for oc in sorted(mapa, key=len, reverse=True):
            txt = txt.replace(oc, mapa[oc])
    for h in MIGRAR:
        c = txt.count(h)
        if c:
            restantes += c
            if len(exemplos) < 20:
                exemplos.append((f, h, c))

print(f"\nImagens baixadas: {len(baixados)} | arquivos reescritos: {reescritos} | menções externas restantes: {restantes}")
for f,h,c in exemplos: print(f"  RESTA: {h} x{c} em {f}")
if restantes:
    print("⚠ Sobraram referências externas — me avise.")
    sys.exit(1)
print("✅ Migração de imagens concluída." + (" (DRY-RUN)" if DRY else ""))
