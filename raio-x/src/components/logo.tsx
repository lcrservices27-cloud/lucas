import { cn } from "@/lib/utils";

export function Logo({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 font-semibold tracking-tight", className)}>
      <span className="relative inline-flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-navy-600 to-navy-500 shadow-[0_6px_18px_-6px_rgba(37,99,235,0.7)]">
        <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden>
          <circle cx="11" cy="11" r="6.5" stroke="white" strokeWidth="2" />
          <path d="m16 16 4 4" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <path d="M8.5 11h5M11 8.5v5" stroke="#34d399" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </span>
      <span className={cn("text-[17px] leading-none", light ? "text-white" : "text-ink")}>
        Raio-X <span className="text-gradient-green">do Crédito</span>
      </span>
    </span>
  );
}
