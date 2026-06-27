// OpenAI 兼容客户端：组装请求、调用 /chat/completions、返回文本内容。
// 安全要点：apiKey 绝不出现在任何 log 或抛出的错误消息里。

/** 缺少可用 apiKey（默认 env 与 BYOK override 都没有）时抛出。 */
export class LLMConfigError extends Error {
  constructor(
    message = "未配置 LLM_API_KEY，请在 .env.local 配置或在设置里填写自带 key",
  ) {
    super(message);
    this.name = "LLMConfigError";
  }
}

/** 上游返回非 2xx 时抛出，携带状态码（不含 apiKey）。 */
export class LLMRequestError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "LLMRequestError";
    this.status = status;
  }
}

export interface CallLLMOptions {
  system: string;
  user: string;
  override?: {
    baseUrl?: string;
    apiKey?: string;
    model?: string;
  };
}

/** 非空字符串才用作覆盖值，否则回退到默认值。 */
function pick(overrideVal: string | undefined, fallback: string | undefined) {
  const v = overrideVal?.trim();
  return v && v.length > 0 ? v : fallback;
}

function buildBody(model: string, system: string, user: string, withFormat: boolean) {
  const body: Record<string, unknown> = {
    model,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    temperature: 0.4,
  };
  if (withFormat) {
    body.response_format = { type: "json_object" };
  }
  return body;
}

/** 错误体里是否暗示 response_format 不被支持（用于自动去掉该字段重试）。 */
function mentionsResponseFormat(errBody: string): boolean {
  return /response_format/i.test(errBody);
}

export async function callLLM(opts: CallLLMOptions): Promise<string> {
  const baseUrl = pick(opts.override?.baseUrl, process.env.LLM_BASE_URL);
  const apiKey = pick(opts.override?.apiKey, process.env.LLM_API_KEY);
  const model = pick(opts.override?.model, process.env.LLM_MODEL);

  if (!apiKey) {
    throw new LLMConfigError();
  }
  if (!baseUrl) {
    throw new LLMConfigError(
      "未配置 LLM_BASE_URL，请在 .env.local 配置或在设置里填写自带 baseUrl",
    );
  }
  if (!model) {
    throw new LLMConfigError(
      "未配置 LLM_MODEL，请在 .env.local 配置或在设置里填写自带 model",
    );
  }

  const url = `${baseUrl.replace(/\/$/, "")}/chat/completions`;
  const timeoutMs = Number(process.env.LLM_TIMEOUT_MS) || 30000;

  async function post(withFormat: boolean): Promise<Response> {
    try {
      return await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(buildBody(model!, opts.system, opts.user, withFormat)),
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (e) {
      // 超时或网络层失败：AbortSignal.timeout 抛 TimeoutError；归一为 LLMRequestError，
      // 保证 callLLM 只抛 LLMConfigError / LLMRequestError，且不泄露底层细节。
      if (e instanceof DOMException && e.name === "TimeoutError") {
        throw new LLMRequestError(504, "上游响应超时");
      }
      throw new LLMRequestError(502, "无法连接上游服务");
    }
  }

  let res = await post(true);

  // 某些 provider 不支持 response_format：报 400 且错误信息暗示该字段 → 去掉后重试一次。
  if (!res.ok && res.status === 400) {
    const firstErr = await safeReadBody(res);
    if (mentionsResponseFormat(firstErr)) {
      res = await post(false);
    } else {
      throw new LLMRequestError(400, `上游返回 400：${truncate(firstErr)}`);
    }
  }

  if (!res.ok) {
    const errBody = await safeReadBody(res);
    throw new LLMRequestError(
      res.status,
      `上游返回 ${res.status}：${truncate(errBody)}`,
    );
  }

  let data: { choices?: Array<{ message?: { content?: string } }> };
  try {
    data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
  } catch {
    throw new LLMRequestError(502, "上游返回非 JSON 响应");
  }
  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new LLMRequestError(502, "上游返回缺少 choices[0].message.content");
  }
  return content;
}

async function safeReadBody(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return "";
  }
}

/** 截断上游错误体，避免把超长内容塞进错误消息（不含敏感 key 信息）。 */
function truncate(s: string, max = 500): string {
  return s.length > max ? `${s.slice(0, max)}…` : s;
}
