const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "https://thealanwang.xyz",
  "https://www.thealanwang.xyz",
];
const DEFAULT_RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const DEFAULT_RATE_LIMIT_MAX_REQUESTS = 10;

type RateLimitResult = {
  allowed: boolean;
  retryAfterMs: number;
};

type ChatGuardFailure = {
  error: string;
  retryAfterSeconds?: number;
  status: 403 | 429;
};

const rateLimitBuckets = new Map<string, number[]>();

function parsePositiveInteger(
  rawValue: string | undefined,
  fallback: number,
): number {
  if (!rawValue) {
    return fallback;
  }

  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.floor(parsed);
}

function allowedOrigins(): Set<string> {
  const configured = process.env.CHAT_ALLOWED_ORIGINS
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  const origins = new Set(
    configured && configured.length > 0
      ? configured
      : DEFAULT_ALLOWED_ORIGINS,
  );

  // Auto-include Vercel deployment URLs so preview and production
  // deployments pass the origin check without manual configuration.
  for (const envVar of ["VERCEL_URL", "VERCEL_PROJECT_PRODUCTION_URL"]) {
    const host = process.env[envVar]?.trim();
    if (host) {
      origins.add(`https://${host}`);
    }
  }

  return origins;
}

function rateLimitWindowMs(): number {
  return parsePositiveInteger(
    process.env.CHAT_RATE_LIMIT_WINDOW_MS,
    DEFAULT_RATE_LIMIT_WINDOW_MS,
  );
}

function rateLimitMaxRequests(): number {
  return parsePositiveInteger(
    process.env.CHAT_RATE_LIMIT_MAX_REQUESTS,
    DEFAULT_RATE_LIMIT_MAX_REQUESTS,
  );
}

function extractOrigin(req: Request): string | null {
  const origin = req.headers.get("origin")?.trim();
  if (origin) {
    return origin;
  }

  const referer = req.headers.get("referer");
  if (!referer) {
    return null;
  }

  try {
    const url = new URL(referer);
    return url.origin;
  } catch {
    return null;
  }
}

function extractClientIp(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor
      .split(",")
      .map((part) => part.trim())
      .find(Boolean);

    if (firstIp) {
      return firstIp;
    }
  }

  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) {
    return realIp;
  }

  const cfConnectingIp = req.headers.get("cf-connecting-ip")?.trim();
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  return "unknown";
}

function cleanupExpiredBuckets(now: number, windowMs: number): void {
  const cutoff = now - windowMs;

  for (const [key, timestamps] of rateLimitBuckets) {
    const active = timestamps.filter((timestamp) => timestamp > cutoff);
    if (active.length === 0) {
      rateLimitBuckets.delete(key);
      continue;
    }
    rateLimitBuckets.set(key, active);
  }
}

function consumeRateLimit(ip: string, now: number): RateLimitResult {
  const windowMs = rateLimitWindowMs();
  const maxRequests = rateLimitMaxRequests();
  const cutoff = now - windowMs;
  const timestamps = (rateLimitBuckets.get(ip) ?? []).filter(
    (timestamp) => timestamp > cutoff,
  );

  if (rateLimitBuckets.size > 2000) {
    cleanupExpiredBuckets(now, windowMs);
  }

  if (timestamps.length >= maxRequests) {
    const retryAfterMs = Math.max(0, timestamps[0] + windowMs - now);
    rateLimitBuckets.set(ip, timestamps);
    return { allowed: false, retryAfterMs };
  }

  timestamps.push(now);
  rateLimitBuckets.set(ip, timestamps);
  return { allowed: true, retryAfterMs: 0 };
}

export function guardChatRequest(req: Request): ChatGuardFailure | null {
  const origin = extractOrigin(req);
  if (!origin || !allowedOrigins().has(origin)) {
    return {
      status: 403,
      error: "Chat requests are only allowed from approved Atlas origins.",
    };
  }

  const ip = extractClientIp(req);
  const rateLimit = consumeRateLimit(ip, Date.now());
  if (!rateLimit.allowed) {
    return {
      status: 429,
      error: "Chat rate limit exceeded. Please try again in a few minutes.",
      retryAfterSeconds: Math.max(1, Math.ceil(rateLimit.retryAfterMs / 1000)),
    };
  }

  return null;
}
