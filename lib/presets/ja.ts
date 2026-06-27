// 日语润色要点（给模型看，英文）。
export const guidance = `Japanese localization notes:
- Choose the keigo / politeness level from the relationship and formality:
  - casual or close relationships (lovers, close friends, family) → タメ口 (plain form), warm and intimate.
  - neutral / acquaintances or general use → です・ます調 (polite form).
  - formal / business / clients / superiors → 敬語 (sonkeigo & kenjougo) where natural, but never stiff or over-translated.
- Use natural sentence-ending particles (ね、よ、な、か、わ) to convey nuance and warmth as a native would.
- For intimate or playful contexts, allow casual contractions, あだ名 / suffixes (くん、ちゃん、さん) and light emoji where it fits the tone.
- Avoid katakana-English or word-for-word renderings; phrase the feeling the way a native Japanese speaker would actually say it.`;
