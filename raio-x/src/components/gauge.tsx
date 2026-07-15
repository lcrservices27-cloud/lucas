"use client";

import { motion } from "framer-motion";

// Velocímetro semicircular 0–100. Arco de vermelho → âmbar → verde.
export function Gauge({
  valor,
  tamanho = 280,
  animar = true,
  legenda,
}: {
  valor: number;
  tamanho?: number;
  animar?: boolean;
  legenda?: string;
}) {
  const v = Math.max(0, Math.min(100, valor));
  const w = tamanho;
  const h = tamanho * 0.62;
  const cx = w / 2;
  const cy = w / 2;
  const raio = w / 2 - 22;

  // Semicírculo de 180° (esquerda→direita), ângulo em graus.
  const anguloDe = (p: number) => 180 - (p / 100) * 180;
  const ponto = (p: number, r: number) => {
    const a = (anguloDe(p) * Math.PI) / 180;
    return { x: cx + r * Math.cos(a), y: cy - r * Math.sin(a) };
  };

  const arco = (de: number, ate: number, r: number) => {
    const p1 = ponto(de, r);
    const p2 = ponto(ate, r);
    const largeArc = ate - de > 50 ? 1 : 0;
    return `M ${p1.x} ${p1.y} A ${r} ${r} 0 ${largeArc} 1 ${p2.x} ${p2.y}`;
  };

  const agulha = ponto(v, raio - 10);

  return (
    <div className="flex flex-col items-center" style={{ width: w }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
        {/* Trilha de fundo */}
        <path d={arco(0, 100, raio)} stroke="#e6ecf5" strokeWidth={16} fill="none" strokeLinecap="round" />
        {/* Segmentos coloridos */}
        <path d={arco(0, 49, raio)} stroke="#f43f5e" strokeWidth={16} fill="none" strokeLinecap="round" />
        <path d={arco(50, 74, raio)} stroke="#f59e0b" strokeWidth={16} fill="none" strokeLinecap="round" />
        <path d={arco(75, 100, raio)} stroke="#10b981" strokeWidth={16} fill="none" strokeLinecap="round" />

        {/* Agulha */}
        <motion.line
          x1={cx}
          y1={cy}
          x2={agulha.x}
          y2={agulha.y}
          stroke="#0a1f3c"
          strokeWidth={4}
          strokeLinecap="round"
          initial={animar ? { x2: ponto(0, raio - 10).x, y2: ponto(0, raio - 10).y } : false}
          animate={{ x2: agulha.x, y2: agulha.y }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        />
        <circle cx={cx} cy={cy} r={9} fill="#0a1f3c" />
        <circle cx={cx} cy={cy} r={4} fill="white" />
      </svg>

      <div className="-mt-6 flex flex-col items-center">
        <div className="flex items-baseline gap-1">
          <motion.span
            initial={animar ? { opacity: 0, y: 8 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="text-5xl font-bold tabular-nums text-ink"
          >
            {v}
          </motion.span>
          <span className="text-lg font-medium text-ink-soft">/100</span>
        </div>
        {legenda ? <p className="mt-0.5 text-sm text-ink-soft">{legenda}</p> : null}
      </div>
    </div>
  );
}
