// 场景预设：选一个场景即可一键填好「关系 + 正式度 + 默认情绪」。
// 共享契约 —— UI 路用 label/emoji/relationship/formality/emotion 渲染选择器；
// 逻辑路用 getScene(presetId) 取 hint 补充进 system/user 提示。
import type { Formality } from "@/lib/schema";

export interface Scene {
  id: string;
  label: string; // 中文展示名
  emoji: string;
  relationship: string; // 关系，如 "恋人"
  formality: Formality;
  emotion: string; // 选中场景时的默认情绪（取自 EMOTIONS）
  /** 给 LLM 的场景补充说明（仅逻辑路使用，UI 不渲染） */
  hint: string;
}

export const SCENES: Scene[] = [
  {
    id: "romance",
    label: "跨国恋爱",
    emoji: "💕",
    relationship: "恋人",
    formality: "casual",
    emotion: "温柔",
    hint: "亲密关系中的恋人对话，语气自然、温暖、有亲昵感，避免生硬或过度正式。",
  },
  {
    id: "business",
    label: "商务",
    emoji: "💼",
    relationship: "客户或同事",
    formality: "formal",
    emotion: "正式",
    hint: "职场/商务沟通，措辞专业、礼貌、得体，使用对方文化中恰当的敬语与商务惯用表达。",
  },
  {
    id: "friend",
    label: "朋友",
    emoji: "🙌",
    relationship: "朋友",
    formality: "casual",
    emotion: "俏皮",
    hint: "朋友之间的轻松对话，口语化、自然，可带适度的网络用语或语气词。",
  },
  {
    id: "family",
    label: "家人",
    emoji: "🏠",
    relationship: "家人",
    formality: "neutral",
    emotion: "温柔",
    hint: "家人之间的日常交流，温暖、亲切、关心，语气平和不疏离。",
  },
];

export function getScene(id?: string): Scene | undefined {
  if (!id) return undefined;
  return SCENES.find((s) => s.id === id);
}
