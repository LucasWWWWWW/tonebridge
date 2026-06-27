// POST /api/translate —— 校验 → (BYOK 或限流) → 调用 LLM → 解析校验 → 返回结构化结果。
// 安全：默认 env key 绝不出现在任何返回字段/错误里；BYOK key 仅本次请求透传上游。
import { NextResponse } from "next/server";
import {
  TranslateRequestSchema,
  TranslateResultSchema,
  BYOK_HEADERS,
} from "@/lib/schema";
import { buildMessages } from "@/lib/prompt";
import { callLLM, LLMConfigError, LLMRequestError } from "@/lib/llm";
import { checkRateLimit } from "@/lib/ratelimit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  // 1. 解析 + 校验请求体
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json(
      { error: "请求体不是合法 JSON" },
      { status: 400 },
    );
  }

  const parsed = TranslateRequestSchema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("; ");
    return NextResponse.json(
      { error: "请求参数有误", details: issues },
      { status: 400 },
    );
  }

  // 2. 读取 BYOK header —— 仅当 apiKey header 非空才视为 BYOK
  const byokApiKey = req.headers.get(BYOK_HEADERS.apiKey)?.trim();
  const byokBaseUrl = req.headers.get(BYOK_HEADERS.baseUrl)?.trim();
  const byokModel = req.headers.get(BYOK_HEADERS.model)?.trim();
  const isByok = !!byokApiKey;

  const override = isByok
    ? {
        apiKey: byokApiKey,
        baseUrl: byokBaseUrl || undefined,
        model: byokModel || undefined,
      }
    : undefined;

  // 3. 非 BYOK：按 IP 限流；BYOK 跳过限流
  if (!isByok) {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rl = await checkRateLimit(ip);
    if (!rl.ok) {
      return NextResponse.json(
        { error: rl.reason ?? "请求过于频繁，请稍后再试。" },
        { status: 429 },
      );
    }
  }

  // 4. 组装提示并调用 LLM
  let content: string;
  try {
    const { system, user } = buildMessages(parsed.data);
    content = await callLLM({ system, user, override });
  } catch (err) {
    if (err instanceof LLMConfigError) {
      // 未配置 key：BYOK 路径理论上不会到这（已有 key），主要是默认 env 缺失。
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    if (err instanceof LLMRequestError) {
      return NextResponse.json(
        { error: "翻译服务暂时不可用，请稍后重试。" },
        { status: 502 },
      );
    }
    // 兜底：不泄露内部细节
    return NextResponse.json(
      { error: "翻译服务出错，请稍后重试。" },
      { status: 502 },
    );
  }

  // 5. 解析模型返回为 JSON（容错：剥离 ```json fence 再试），并按 schema 校验
  const obj = parseModelJson(content);
  if (obj === undefined) {
    return NextResponse.json(
      { error: "模型返回格式异常，请重试" },
      { status: 502 },
    );
  }

  const result = TranslateResultSchema.safeParse(obj);
  if (!result.success) {
    return NextResponse.json(
      { error: "模型返回格式异常，请重试" },
      { status: 502 },
    );
  }

  // 6. 成功
  return NextResponse.json(result.data, { status: 200 });
}

/** 先直接 JSON.parse；失败则剥离 markdown code fence 后再试。无法解析返回 undefined。 */
function parseModelJson(content: string): unknown {
  const tryParse = (s: string): unknown => {
    try {
      return JSON.parse(s);
    } catch {
      return undefined;
    }
  };

  const direct = tryParse(content.trim());
  if (direct !== undefined) return direct;

  // 剥离 ```json ... ``` 或 ``` ... ``` 包裹
  const fenceMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenceMatch?.[1]) {
    const fromFence = tryParse(fenceMatch[1].trim());
    if (fromFence !== undefined) return fromFence;
  }

  // 兜底：截取第一个 { 到最后一个 } 之间的内容
  const start = content.indexOf("{");
  const end = content.lastIndexOf("}");
  if (start !== -1 && end > start) {
    const slice = tryParse(content.slice(start, end + 1));
    if (slice !== undefined) return slice;
  }

  return undefined;
}
