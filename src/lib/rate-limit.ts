const buckets = new Map<string, number[]>();

export function rateLimit(key: string, limit = 6, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((time) => now - time < windowMs);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    return { ok: false, retryAfter: Math.ceil((windowMs - (now - hits[0])) / 1000) };
  }
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > 5000) {
    for (const [bucketKey, times] of buckets) {
      if (times.every((time) => now - time > windowMs)) buckets.delete(bucketKey);
    }
  }
  return { ok: true, retryAfter: 0 };
}
