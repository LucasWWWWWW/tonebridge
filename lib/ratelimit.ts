// 可选限流：仅当 Upstash Redis env 齐全时启用，否则 no-op（自部署零配置）。
// 顶层惰性初始化，避免无 env 时模块加载即报错。
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

interface Limiters {
  perIp: Ratelimit;
  global: Ratelimit;
}

let cached: Limiters | null | undefined; // undefined=未初始化, null=无 Redis（no-op）

function getLimiters(): Limiters | null {
  if (cached !== undefined) return cached;

  // 兼容两种注入名：直连 Upstash 用 UPSTASH_REDIS_REST_*；
  // Vercel Marketplace / KV 集成有时注入 KV_REST_API_*。
  const url =
    process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    cached = null;
    return cached;
  }

  const redis = new Redis({ url, token });

  const perIpLimit = Number(process.env.DEMO_DAILY_LIMIT_PER_IP) || 30;
  const globalLimit = Number(process.env.DEMO_GLOBAL_DAILY_LIMIT) || 2000;

  cached = {
    perIp: new Ratelimit({
      redis,
      limiter: Ratelimit.fixedWindow(perIpLimit, "1 d"),
      prefix: "tb:rl:ip",
      analytics: false,
    }),
    global: new Ratelimit({
      redis,
      limiter: Ratelimit.fixedWindow(globalLimit, "1 d"),
      prefix: "tb:rl:global",
      analytics: false,
    }),
  };
  return cached;
}

export async function checkRateLimit(
  ip: string,
): Promise<{ ok: boolean; reason?: string }> {
  const limiters = getLimiters();
  if (!limiters) return { ok: true }; // 无 Redis → 不限流

  // 两个限流器都必须通过。先查个人额度，再查全站额度。
  const perIp = await limiters.perIp.limit(ip);
  if (!perIp.success) {
    return {
      ok: false,
      reason: "今日个人体验额度已用完，请明天再试，或在设置里填写自带 key 继续使用。",
    };
  }

  const global = await limiters.global.limit("global");
  if (!global.success) {
    return {
      ok: false,
      reason: "今日全站体验额度已用完，请稍后再试，或在设置里填写自带 key 继续使用。",
    };
  }

  return { ok: true };
}
