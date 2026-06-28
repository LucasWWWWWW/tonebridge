import { z } from "zod";

// 情绪标签（UI 选择器用；底层允许任意字符串）
export const EMOTIONS = [
  "好奇", "惊讶", "平淡", "期待", "温柔", "正式", "抱歉", "感激", "坚定", "俏皮",
] as const;
export type Emotion = (typeof EMOTIONS)[number];

// 正式度
export const FORMALITIES = ["casual", "neutral", "formal"] as const;
export type Formality = (typeof FORMALITIES)[number];

// 性别（用于第一人称/称呼的语气推断；选填）
export const GENDERS = ["female", "male"] as const;
export type Gender = (typeof GENDERS)[number];

// 首发目标语言（底层支持任意语言码）
export const TARGET_LANGS = ["ja", "en", "es"] as const;
export type TargetLang = (typeof TARGET_LANGS)[number];

// ---- 请求：前端 → /api/translate ----
export const TranslateRequestSchema = z.object({
  text: z.string().min(1).max(2000),
  targetLang: z.string().min(2).max(10),                 // 默认取自 TARGET_LANGS，允许任意语言码
  sourceLang: z.string().min(2).max(10).optional(),      // 用户母语，缺省按 "zh" 处理
  emotion: z.string().min(1).max(20),
  formality: z.enum(FORMALITIES).default("neutral"),
  relationship: z.string().max(40).optional(),           // 关系，如 "恋人" / "客户"
  speakerGender: z.enum(GENDERS).optional(),             // 我的性别
  counterpartGender: z.enum(GENDERS).optional(),         // 对方的性别
  presetId: z.string().max(60).optional(),               // 命中的场景预设 id
});
export type TranslateRequest = z.infer<typeof TranslateRequestSchema>;

// ---- 响应：LLM 必须返回的结构化 JSON ----
export const TranslateResultSchema = z.object({
  translation: z.string(),       // 地道译文（目标语言）
  backTranslation: z.string(),   // 译文回翻成用户母语 —— 核心差异点
  toneNote: z.string(),          // 一句话语气说明（用户母语）
  alternatives: z.array(z.string()).min(1).max(4), // 备选说法（系统提示要 2 条；放宽校验以容忍模型偏差，避免整体 502）
});
export type TranslateResult = z.infer<typeof TranslateResultSchema>;

// ---- BYOK：自带 key 时通过这些请求头覆盖默认 env ----
export const BYOK_HEADERS = {
  baseUrl: "x-llm-base-url",
  apiKey: "x-llm-api-key",
  model: "x-llm-model",
} as const;
