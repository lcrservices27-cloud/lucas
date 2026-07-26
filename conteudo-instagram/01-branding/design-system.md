# Design System — Lucas Limpa Nome (Instagram)

Componentes e regras para montar qualquer arte de forma consistente. Pense em
"peças de Lego": você não inventa do zero, você combina blocos já definidos.

## Tokens (copie para o Canva / Figma como estilos)

```
/* Cor */
--navy-950:#06122b; --navy-900:#0a1f3c; --navy-800:#0b2545;
--white:#ffffff;    --mist:#f4f7fb;
--green-500:#10b981; --green-400:#34d399;
--ink:#0f172a; --ink-soft:#475569; --line:#e2e8f0;
--warn:#f59e0b; --risk:#ef4444;

/* Raio de borda */
--r-sm:12px; --r-md:20px; --r-lg:28px; --r-pill:999px;

/* Espaçamento */
--s1:8px; --s2:16px; --s3:24px; --s4:40px; --s5:64px; --s6:96px;
```

## Gradientes oficiais

- **Navy hero:** `linear-gradient(180deg,#06122b,#0a1f3c 55%,#0b2545)`
- **Verde CTA:** `linear-gradient(90deg,#10b981,#059669)`
- **Glow acento:** `radial-gradient(60% 50% at 50% 0%, rgba(16,185,129,.18), transparent 70%)`
- Nunca gradiente com 3+ matizes. Degradê é sutileza, não arco-íris.

## Componentes

### Botão / CTA (pill)
Fundo verde CTA · texto branco peso 700 · padding 20×36 · raio pill · sombra
verde · seta `→` à direita. Ex.: **"FAZER MEU RAIO-X GRATUITO →"**. Um CTA por
arte.

### Badge / etiqueta
Pill pequena · fundo cor/8% · texto da cor peso 700 · caixa alta · tracking +8%.
Ex.: `● SEM AFETAR SEU SCORE` (verde), `ATENÇÃO` (âmbar).

### Card de dado (glass sobre navy)
Fundo branco 7% · borda branca 12% · blur 14 · raio 28 · padding 40. Dentro:
rótulo pequeno em cima, número gigante no meio, legenda embaixo.

### Card claro
Fundo branco · borda `--line` · sombra suave · raio 24 · padding 40. Para
educação e listas.

### Velocímetro (assinatura)
Semicírculo 0–100, arco vermelho→âmbar→verde, ponteiro navy, número grande
embaixo. É o elemento mais reconhecível — use em diagnóstico/score.

### Numerador de slide (carrossel)
Canto superior: `01 / 08` em rótulo pequeno, tracking +8%. Só quando há sequência
real.

## Uso da logo

- Versões: **clara** (sobre navy) e **escura** (sobre claro). Nunca verde.
- Área de proteção: espaço livre = altura do símbolo em volta.
- Tamanho mínimo no feed: 64px de altura.
- Posição padrão: canto superior esquerdo OU rodapé centralizado no último slide.
- ❌ Não distorcer, não rotacionar, não aplicar sombra dura, não colocar sobre
  fundo poluído, não trocar as cores.

## Anatomia de um post (hierarquia de leitura)

```
1º  HOOK / número        (o que para o dedo)
2º  subtexto de apoio     (contextualiza em 1 linha)
3º  corpo / dado          (a substância)
4º  CTA + logo            (para onde vai)
```
Se o leitor entende o post em 3 segundos vendo só o 1º nível, a hierarquia está
certa.

## Checklist antes de exportar (cole no Canva)

- [ ] Uma ideia só na arte?
- [ ] Hook legível a 3 s / em tela pequena?
- [ ] Verde só no que importa (regra 60/30/10)?
- [ ] Alinhado à esquerda, com 80px de margem?
- [ ] 40%+ de respiro?
- [ ] Logo presente, na versão certa?
- [ ] CTA claro (um só)?
- [ ] Passa no compliance (sem promessa/sensacionalismo)?
- [ ] Legenda com CTA + 3–5 hashtags relevantes?
