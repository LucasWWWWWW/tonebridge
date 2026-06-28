// 展示标签：UI 选择器与结果卡片共享。逻辑路一般不需要，但放这里作为单一来源。
import type { Formality, Gender } from "@/lib/schema";

// 目标语言码 → 中文展示名（首发三种；底层支持任意语言码）
export const LANG_LABELS: Record<string, string> = {
  ja: "日语",
  en: "英语",
  es: "西语",
};

// 目标语言码 → 该语言的本地名（用于结果卡片副标题等）
export const LANG_NATIVE: Record<string, string> = {
  ja: "日本語",
  en: "English",
  es: "Español",
};

// 正式度 → 中文展示名
export const FORMALITY_LABELS: Record<Formality, string> = {
  casual: "随意",
  neutral: "平和",
  formal: "正式",
};

// 性别 → 中文展示名
export const GENDER_LABELS: Record<Gender, string> = { female: "女", male: "男" };

// 取语言展示名：未知语言码回退为其大写形式
export function langLabel(code: string): string {
  return LANG_LABELS[code] ?? code.toUpperCase();
}
