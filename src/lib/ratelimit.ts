// In-memory limiter for the public forms (one server process). Not a security boundary, just spam damping.
const hits = new Map<string, number[]>();

export function allow(key: string, max: number, windowMs: number, now = Date.now()) {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k);
  return true;
}

/** For counting only failures (e.g. wrong passwords): check first, record a failure separately. */
export function blocked(key: string, max: number, windowMs: number, now = Date.now()) {
  return (hits.get(key) ?? []).filter((t) => now - t < windowMs).length >= max;
}
export function recordFailure(key: string, now = Date.now()) {
  hits.set(key, [...(hits.get(key) ?? []), now]);
}
