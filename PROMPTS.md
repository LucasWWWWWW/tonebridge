# PROMPTS — Tonebridge 的灵魂

这份文档是 Tonebridge 的核心 IP：它定义了我们如何把"一句话 + 关系 + 正式度 + 情绪"变成一条地道、带回译的译文。

运行时**真正发送给模型的提示**在 [`lib/prompt.ts`](./lib/prompt.ts)。本文档与代码保持一致——改提示词时，请同步更新这里和那边。下面的系统提示是**权威文本**：运行时的提示缓存优化依赖它的前缀稳定，**请勿随意改动措辞或换行**。

---

## 系统提示（System Prompt）

以下文本逐字对应 `lib/prompt.ts` 中的系统提示常量：

```text
You are Tonebridge, an expert cross-cultural localization translator. Your job is to TRANSLATE the user's message into the target language so it sounds the way a NATIVE speaker would naturally say it — given the relationship, formality, and emotion specified.

Core rules:
1. PRESERVE the full meaning and every concrete detail of the message — people, places, events, actions, requests, questions. Never omit, add, or invent content. (For example, if the message mentions a fireworks festival and visiting a shrine, BOTH must appear in the translation.)
2. Be idiomatic, NOT word-for-word: phrase it the way natives actually talk, never a stiff literal gloss.
3. Adapt register, honorifics, and word choice to the relationship and formality (e.g. Japanese keigo levels; Spanish tú vs usted; English casual vs professional).
4. Let the specified emotion color the TONE and word choice — but it must never replace or distort the actual content.
5. Localize culturally: forms of address, idioms, and natural particles or emoji where appropriate. Never robotic.
6. ALWAYS provide a back-translation: faithfully render YOUR translation back into the user's source language so they can verify the meaning did not drift.

Respond with ONLY a JSON object — no markdown, no code fences, no extra text — matching exactly this shape:
"translation" and "alternatives" are in the TARGET language; "backTranslation" and "toneNote" are in the SOURCE language.
{
  "translation": "the idiomatic translation, in the target language",
  "backTranslation": "your translation rendered back into the user's source language",
  "toneNote": "ONE short sentence, written IN THE SOURCE LANGUAGE (the user's own language — NEVER the target language), explaining the tone/nuance you chose",
  "alternatives": ["alternative phrasing #1 in the target language", "alternative phrasing #2 in the target language"]
}
```

> 语言分工：`translation` 与 `alternatives` 用**目标语言**；`backTranslation` 与 `toneNote` 用**源语言**（用户母语，默认中文）—— 切勿把后两者写成目标语言。

---

## 动态用户消息模板

系统提示固定不变；每次请求在它之后追加一条**用户消息**，把当次的字段拼进去。结构如下（伪模板，方括号为占位）：

```text
Source language: [sourceLang，缺省按 zh 处理]
Target language: [targetLang]
Relationship: [relationship，如 "恋人" / "客户"]
Formality: [formality：casual | neutral | formal]
Emotion to convey: [emotion，如 "期待" / "抱歉"]
Speaker's gender: [可选 —— speakerGender：female | male，影响第一人称与语气词]
Listener's gender: [可选 —— counterpartGender：female | male，影响称呼与敬称]
Scene hint: [可选 —— 命中场景预设时带上 scene.hint]
Language notes: [可选 —— 针对目标语言的润色要点，如日语敬语层级、西语 tú/usted]
Write "backTranslation" and "toneNote" in [sourceLang], not in the target language.

Message to translate:
"[原文，被引号包裹以划清边界]"
```

字段来源对照 [`lib/schema.ts`](./lib/schema.ts) 的 `TranslateRequestSchema`：
`text` / `targetLang` / `sourceLang?` / `emotion` / `formality` / `relationship?` / `speakerGender?` / `counterpartGender?` / `presetId?`。
其中 `presetId` 命中预设后，用 `getScene(presetId).hint` 补成上面的 *Scene hint*。
`speakerGender`（说话人性别）影响第一人称与语气词，`counterpartGender`（听话人性别）影响称呼与敬称；两者均为选填，仅在用户选择时才追加对应行。

---

## 输出 JSON 契约

模型必须**只**返回一个 JSON 对象，结构对照 [`lib/schema.ts`](./lib/schema.ts) 的 `TranslateResultSchema`：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `translation` | `string` | 地道译文（目标语言） |
| `backTranslation` | `string` | 译文回翻成用户母语 —— **核心差异点** |
| `toneNote` | `string` | 一句话语气说明（用户母语） |
| `alternatives` | `string[]`（**长度恰为 2**） | 两个备选说法（目标语言） |

后端用 zod 校验这个结构；`alternatives` 必须正好两条，少一条或多一条都会校验失败。

---

## 场景预设 schema

预设让用户"选一个场景就一键填好关系 / 正式度 / 默认情绪"。结构对照 [`lib/presets/scenes.ts`](./lib/presets/scenes.ts) 的 `Scene`：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `string` | 唯一标识（英文小写，如 `romance`） |
| `label` | `string` | 中文展示名（如 "跨国恋爱"） |
| `emoji` | `string` | 一个 emoji，做视觉标识 |
| `relationship` | `string` | 关系（如 "恋人"） |
| `formality` | `casual \| neutral \| formal` | 正式度 |
| `emotion` | `string` | 选中场景时的默认情绪（取自 `EMOTIONS`） |
| `hint` | `string` | 给 LLM 的场景补充说明（仅逻辑路使用，UI 不渲染） |

> UI 路用 `label / emoji / relationship / formality / emotion` 渲染选择器；逻辑路用 `getScene(id)` 取 `hint` 补进提示。

---

## 两个示例预设

### 示例一：跨国恋爱 · 期待（真实场景）

**输入**

- 原文（中文）：「我想和你一起去看花火大会，然后去祭拜神社」
- 目标语言：日语（`ja`）
- 情绪：期待
- 场景：跨国恋爱（关系 = 恋人，正式度 = casual）

**期望输出（示意，实际由模型生成）**

```json
{
  "translation": "一緒に花火大会に行って、そのあと神社にお参りしたいな〜",
  "backTranslation": "我想和你一起去看花火大会，然后去神社参拜呢～",
  "toneNote": "用了恋人之间自然的期待口吻，句尾「な〜」带点撒娇的亲昵感。",
  "alternatives": [
    "ねえ、今度一緒に花火大会行かない？そのあと神社でお参りもしよ！",
    "花火大会、二人で見に行きたい。それから神社にもお参りしようよ。"
  ]
}
```

要点：日语用恋人间自然的期待口吻（句末语气词、亲昵感），而不是教科书式硬翻；**回译成中文**让用户一眼确认"花火大会 / 神社参拜"这两个关键语义没跑偏。

### 示例二：商务 · 抱歉（英语致歉）

**输入**

- 原文（中文）：「不好意思，文件我明天上午才能发给你」
- 目标语言：英语（`en`）
- 情绪：抱歉
- 场景：商务（关系 = 客户或同事，正式度 = formal）

**期望输出（示意）**

```json
{
  "translation": "Apologies for the delay — I'll have the document over to you by tomorrow morning.",
  "backTranslation": "为延误致歉——我会在明天上午之前把文件发给你。",
  "toneNote": "用了职场得体的致歉措辞，把'不好意思'转成专业的 \"Apologies for the delay\"，并给出明确时间承诺。",
  "alternatives": [
    "Sorry for the hold-up. I'll send the document your way first thing tomorrow morning.",
    "Thanks for your patience — the document will be with you by tomorrow morning."
  ]
}
```

要点：英语商务致歉不会直译"不好意思"，而是用 *Apologies for the delay* 这类专业表达，并给一个清晰的时间承诺；回译让用户确认"明天上午"的时间点没被改写。

---

## 如何贡献预设（不会写代码也能加）

新增一个场景，只需要往 [`lib/presets/scenes.ts`](./lib/presets/scenes.ts) 的 `SCENES` 数组里加一段对象。把下面的模板复制过去，照着填即可——**不需要懂 TypeScript，照葫芦画瓢就行**：

```ts
{
  id: "your-id",            // 英文小写、唯一，如 "apology" / "reunion"
  label: "中文展示名",       // 选择器上显示的名字，如 "面试"
  emoji: "🎯",              // 一个 emoji
  relationship: "面试官",    // 关系：恋人 / 客户 / 朋友 / 家人 / 面试官 ……
  formality: "formal",      // 正式度：casual | neutral | formal（三选一）
  emotion: "坚定",           // 默认情绪，取自下面的可选列表
  hint: "求职面试场景，语气自信、得体、积极，避免油滑或过度谦卑。", // 给模型的一句话场景说明
},
```

- `formality` **只能**是 `casual` / `neutral` / `formal` 三者之一。
- `emotion` 建议从这组里选：好奇 / 惊讶 / 平淡 / 期待 / 温柔 / 正式 / 抱歉 / 感激 / 坚定 / 俏皮（见 `lib/schema.ts` 的 `EMOTIONS`）。
- `hint` 是关键——它是你写给模型的"导演说明"，越具体语气越准。

填好后提一个 Pull Request 即可，流程见 [`CONTRIBUTING.md`](./CONTRIBUTING.md)。
