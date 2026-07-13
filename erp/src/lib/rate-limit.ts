import "server-only";

// Rate limiter em memória, por processo. Suficiente para deploy de instância
// única (self-hosted/VM). Em ambiente serverless multi-instância cada
// instância tem seu próprio contador — trocar por Redis/Upstash se o volume
// de tentativas de brute force se tornar uma preocupação real.

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  bucket.count += 1;
  if (bucket.count > limit) return false;
  return true;
}

// Limpeza periódica para não crescer indefinidamente.
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000;
let lastCleanup = Date.now();

export function cleanupIfDue() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}
