// 提示组装。SYSTEM_PROMPT 为稳定前缀（逐字、勿插值），利于上游 prompt 缓存命中。
import type { TranslateRequest } from "@/lib/schema";
import { langLabel } from "@/lib/labels";
import { getScene } from "@/lib/presets/scenes";
import { languageGuidance } from "@/lib/presets/index";

export const SYSTEM_PROMPT = `You are Tonebridge, an expert cross-cultural localization translator. Your job is to TRANSLATE the user's message into the target language so it sounds the way a NATIVE speaker would naturally say it — given the relationship, formality, and emotion specified.

Core rules:
1. PRESERVE the full meaning and every concrete detail of the message — people, places, events, actions, requests, questions. Never omit, add, or invent content. (For example, if the message mentions a fireworks festival and visiting a shrine, BOTH must appear in the translation.)
2. Be idiomatic, NOT word-for-word: phrase it the way natives actually talk, never a stiff literal gloss.
3. Adapt register, honorifics, and word choice to the relationship and formality (e.g. Japanese keigo levels; Spanish tú vs usted; English casual vs professional).
4. Let the specified emotion color the TONE and word choice — but it must never replace or distort the actual content.
5. Localize culturally: forms of address, idioms, and natural particles or emoji where appropriate. Never robotic.
6. ALWAYS provide a back-translation: faithfully render YOUR translation back into the user's source language so they can verify the meaning did not drift.

Respond with ONLY a JSON object — no markdown, no code fences, no extra text — matching exactly this shape:
{
  "translation": "the idiomatic translation, in the target language",
  "backTranslation": "your translation rendered back into the user's source language",
  "toneNote": "ONE short sentence, in the user's source language, explaining the tone/nuance you chose",
  "alternatives": ["alternative phrasing #1 in the target language", "alternative phrasing #2 in the target language"]
}`;

export function buildMessages(req: TranslateRequest): { system: string; user: string } {
  const sourceLang = req.sourceLang?.trim() || "zh";

  const lines: string[] = [
    `Source language: ${sourceLang}`,
    `Target language: ${req.targetLang} (${langLabel(req.targetLang)})`,
    `Relationship: ${req.relationship || "unspecified"}`,
    `Formality: ${req.formality}`,
    `Emotion to convey: ${req.emotion}`,
  ];

  const scene = getScene(req.presetId);
  if (scene) {
    lines.push(`Scene context: ${scene.hint}`);
  }

  const guidance = languageGuidance(req.targetLang);
  if (guidance) {
    lines.push(`Language note: ${guidance}`);
  }

  lines.push(`Message to translate:\n"""\n${req.text}\n"""`);

  return { system: SYSTEM_PROMPT, user: lines.join("\n") };
}
