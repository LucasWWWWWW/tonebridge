// 语言润色要点的集中入口，并 re-export 场景预设方便统一引用。
import { guidance as jaGuidance } from "./ja";
import { guidance as enGuidance } from "./en";
import { guidance as esGuidance } from "./es";

export { SCENES, getScene } from "./scenes";
export type { Scene } from "./scenes";

const GUIDANCE: Record<string, string> = {
  ja: jaGuidance,
  en: enGuidance,
  es: esGuidance,
};

/** 命中 ja/en/es 返回对应 guidance，否则返回空串。 */
export function languageGuidance(targetLang: string): string {
  return GUIDANCE[targetLang] ?? "";
}
