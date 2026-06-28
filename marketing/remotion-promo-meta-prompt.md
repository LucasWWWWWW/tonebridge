# Tonebridge · Remotion 推广视频「元提示词」

> 这份文档是给 **Gemini** 用的「元提示词」(meta-prompt)。用法：把一个**参考模板视频**连同**本文档最后一节的成稿**一起丢给 Gemini，让它产出一段 **Remotion**（React 代码生成动画）的竖屏推广视频代码。
>
> 元提示词的目的是：**让 Gemini 借用参考视频的节奏 / 转场 / 质感，但严格套用 Tonebridge 自己的品牌、内容和分镜，绝不照抄参考视频的文案、配色或画面。**
>
> 文档分两部分：
> - **第 1–7 节**：给你（人）读的规格与说明，方便你按需微调。
> - **第 8 节**：凝练成可**直接复制粘贴**发给 Gemini 的最终成稿。

---

## 0. 怎么用这份文档（给你看的）

1. 选一个你想模仿的**参考模板视频**（节奏好、转场利落、质感高级的那种）。
2. 打开 Gemini（要有视频理解能力的版本），**上传参考视频**。
3. 把**第 8 节的成稿**整段复制进对话框，连同视频一起发出去。
4. Gemini 会先「拆解参考视频的结构与运镜」，再「映射到 Tonebridge 的分镜」，最后输出一份 Remotion 工程代码（`Composition` + 各 `Sequence`）。
5. 你拿到代码后在本地 `npx remotion studio` 预览、微调文案/时长，再 `npx remotion render` 导出 MP4。

> 微调建议：分镜表里的**文案**和**时长**是最常需要你改的两处。色值、字体、尺寸、护栏**不要动**——那是品牌一致性的底线。

---

## 1. 角色与任务

**你（Gemini）的角色**：资深动效设计师 + Remotion 工程师。

**任务**：基于我提供的**参考模板视频**，为开源项目 **Tonebridge** 生成一段竖屏社媒推广视频的 **Remotion 代码**。

**关键边界（务必理解）**：
- ✅ **参考视频里可以借用的**：镜头节奏、转场方式、信息密度、文字入场/出场的动效手法、整体的高级质感与剪辑韵律。
- ❌ **参考视频里绝不能照搬的**：它的文案、它的配色、它的 logo/品牌、它的具体画面内容、它的产品。
- 你要做的是**「把参考视频的骨架，换上 Tonebridge 的血肉」**：用下面第 3 节的分镜、第 4 节的品牌、第 5 节的技术约束，重新长出一个全新的、属于 Tonebridge 的视频。

---

## 2. 成片规格

| 项目 | 规格 |
| --- | --- |
| 画幅 | **竖屏 1080 × 1920**（9:16），抖音/小红书原生比例 |
| 帧率 | **30 fps** |
| 时长 | **15–25 秒**（建议 18s 左右 = `durationInFrames` ≈ 540） |
| 首屏钩子 | **前 2 秒（前 60 帧）必须出钩子**——痛点文案或反差画面，0.5 秒内抓住人 |
| 安全区 | 文字主体留在画面**上下各 ~12%（约 230px）内边距**之外的中间区域；底部 ~15%（约 280px）是平台 UI（点赞/关注/字幕）遮挡区，**不要放关键信息** |
| 字号 | 主标题够大（竖屏上至少占宽度 70%，约 90–120px 字号），手机一眼可读 |
| 音频 | **不依赖任何音频/BGM**（用户后期自己配乐配音）；不要在代码里引用音频文件 |

---

## 3. 分镜动画结构（Beat Sheet）

整条片子四拍，**高潮必须落在「回译」**。每拍给了画面 / 文字 / 动效 / 时长 / 视觉重点。时长按 30fps、总时长 ~18s 估算，可微调。

### Beat 1 — 钩子 / 痛点（0–3.5s，约 0–105 帧）
- **画面**：深色沉浸底（Ocean 深海青 `#1f5963` 系深底），中央一句扎心痛点文案。
- **文字**：主文案二选一——
  - 「你发出去的"我想你"，对方读到的是**系统通知**。」
  - 「机翻能翻对字，翻不对**感觉**。」
  - 小字副标（可选）：「跨国恋爱 / 跨国商务 最怕这一下」
- **动效**：文字**逐行/逐句**从下淡入上移（`spring` + `interpolate` 做 opacity 与 translateY），克制、有呼吸感。关键词（"系统通知"/"感觉"）用 Coral 珊瑚橙 `#bd5526` 高亮。
- **视觉重点**：痛点要够痛、够短。第一帧就有字，**不要黑屏开场**。

### Beat 2 — 产品怎么用（3.5–9s，约 105–270 帧）
- **画面**：切到沙色 `#f4ecdf` 暖底（或保持深底但浮出卡片），模拟 Tonebridge 的操作流。
- **文字 / 元素**（按顺序入场，体现"一句话 → 选标签 → 出结果"）：
  1. 输入框出现招牌例句（中文）：**「我想和你一起去看花火大会，然后去祭拜神社」**
  2. 弹出可点选标签：情绪 `期待` + 场景预设 `跨国恋爱`（标签是胶囊形 pill，Coral 描边/填充）
  3. 译文卡浮出（日语，衬线体）：**「一緒に花火大会に行って、それから神社にお参りしたいな。」**
- **动效**：标签**逐个 pop**入场（`spring`，轻微 overshoot）；译文卡用缓动从下浮出。体现"一键、轻量、即时"。
- **视觉重点**：让人看懂**输入一句话 + 点两个标签 = 地道译文**，三步成片，干脆。

### Beat 3 — 回译高潮（9–14.5s，约 270–435 帧）★核心
- **画面**：**全片的视觉重心**。青色（Ocean）**回译卡**作为第一锚点，从译文卡下方/桥的另一端浮现，明显比其他卡更醒目（更亮的青描边 + 轻微放大强调）。
- **文字**：回译卡内容（中文，确认语义没跑偏）：
  **「我想和你一起去看花火大会，然后去神社参拜」**
  - 卡上方小标签：`回译 · 确认对方读到的意思`
  - 可叠一句一句话语气说明（gold/墨色小字）：`语气：恋人间的期待与亲昵`
- **动效**：
  - 一座**「桥」**（品牌母题）从译文卡画到回译卡，桥的描边沿路径**逐段画出**（`strokeDashoffset` 配合 `interpolate`），象征"连接两种语气"。
  - 回译卡入场用 `spring`，到位后有一个**确认感的轻微回弹/勾选**动作。
  - 此处可放一个"✓"或"意思对了"的微动效收束焦虑。
- **视觉重点**：**这一拍是全片卖点**。要让观众"啊——原来能确认对方到底读到什么意思"。桥 + 青色回译卡 = 记忆点。**节奏在这里放慢半拍**，给观众读完两句话的时间。

### Beat 4 — 开源 / 免费 / CTA（14.5–18s,约 435–540 帧）
- **画面**：回到深海青沉浸底，Tonebridge 字标 + 桥 logo 居中收尾。
- **文字**：
  - 字标：**Tonebridge**（Newsreader Italic 斜体衬线，editorial 气质）
  - 一句 slogan：「搭一座语气的桥」/「say it the way a native would」
  - 三个轻标签：`开源` · `免费` · `打开即用`
  - CTA：`github.com/LucasWWWWWW/tonebridge` 与 `tonebridge-ecru.vercel.app`（在线体验）
- **动效**：字标 `spring` 入场，桥 logo 描边收束；标签逐个淡入；CTA 文字稳定停留 ≥1.5s 让人看清/截图。
- **视觉重点**：干净、可信、不喊。CTA 必须**清晰可读、停够久**。

---

## 4. 视觉重点与品牌呈现（硬规范）

### 4.1 配色（精确色值，**不许换**）
| 角色 | 名称 | 浅色值 | 深色值（深海青沉浸） |
| --- | --- | --- | --- |
| 主底 / 沉浸 | Ocean 深海青 | `#1f5963` | 底 `#133a42` |
| 主强调 | Coral 珊瑚橙 | `#bd5526` | `#f08350` |
| 暖底 / 纸感 | Sand 沙色 | `#f4ecdf` | — |
| 文字主色 | Ink 墨 | `#21383c` | 浅 `#f0ece1` |
| 回译卡 / 确认 | Ocean teal | `#1f5963` | 亮青 `#6cc4b8` |
| 语气提示 | Gold | `#94692a` | `#d8a85e` |

- **回译卡 = 青色 = 第一视觉锚点**。其他卡可用沙色/纸白，唯独回译卡是 Ocean 青，最醒目。
- 整体倾向**深色 = 深海青沉浸**（社媒上更高级、更聚焦）。痛点拍和 CTA 拍用深底；操作拍可切暖底制造对比。

### 4.2 字体（用 `@remotion/google-fonts` 加载）
| 用途 | 字体 | 说明 |
| --- | --- | --- |
| 英文标题 / 字标 | **Newsreader**（**Italic** 斜体衬线） | editorial 文学气质，仅用于拉丁文字标/标题 |
| 英文 UI / 标签 | **DM Sans** | 干净的无衬线 UI 字 |
| 中文 / 日文 正文 | **Noto Sans SC** | 含中日文字形；UI 与正文 |
| 中文 / 日文 衬线（译文/回译） | **Noto Serif SC** | 译文、回译卡用衬线，承"手写校对"的文学感 |

- **译文卡 / 回译卡的中日文用 Noto Serif SC（衬线）**，更有"被认真校对"的质感。
- 字标 "Tonebridge" 用 Newsreader Italic。

### 4.3 桥母题（品牌核心视觉）
- 一座**简笔拱桥**：一道拱形主梁 + 几根竖向桥柱 + 一道桥面横线。参考路径（可直接用）：
  `M3 21 Q16 3 29 21`（拱）、三根竖柱、底部横线 `M3 22 L29 22`。
- 桥在 Beat 3 用来**连接译文与回译**；在 Beat 4 作为 logo。
- 桥的描边用 Coral 或当前主强调色，**可沿路径逐段画出**（`strokeDasharray` + `strokeDashoffset`）。

### 4.4 文字层级与动效原则
- **层级**：主文案最大、副标中、标签/说明小。一屏聚焦一个信息，不堆砌。
- **动效**：
  - 统一用 `spring`（轻微 overshoot，physical 手感）做入场；用 `interpolate` 做 opacity / translateY / scale 的精确控时。
  - 文字**逐行 / 逐句**入场，不要一次糊一屏。
  - **克制**：缓动柔和（参考缓动 `cubic-bezier(0.22, 1, 0.36, 1)`），不要花哨的旋转/翻滚/霓虹。气质是**真诚、克制、editorial**，不是 MG 炫技。
- **节奏**：痛点快、操作中速、回译放慢半拍（让人读完）、CTA 稳定停留。

---

## 5. Remotion 技术约束（让代码正确、不过时）

> 以下经核实为 Remotion 当前 API 约定（见文末「核实记录」）。

- **结构**：一个根 `<Composition>`，内部用多个 `<Sequence from={...} durationInFrames={...}>` 分别承载 Beat 1–4。
  ```tsx
  <Composition
    id="TonebridgePromo"
    component={Promo}
    durationInFrames={540}   // 18s @ 30fps，按需调整
    fps={30}
    width={1080}
    height={1920}
  />
  ```
- **时序**：组件内用 `useCurrentFrame()` 取当前帧；用 `interpolate(frame, [start, end], [from, to], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })` 控数值；用 `spring({ frame, fps, config: { damping, mass } })` 做物理入场。注意 `<Sequence>` 内 `useCurrentFrame()` 返回的是**相对该 Sequence 起点**的帧。
- **fps 来源**：用 `useVideoConfig()` 取 `fps`/`width`/`height`，不要写死。
- **字体**：用 `@remotion/google-fonts`，在**模块顶层**（组件外）调用 `loadFont`，把返回的 `fontFamily` 字符串用到 `style.fontFamily`，**不要硬编码字体名**：
  ```tsx
  import { loadFont as loadNews } from "@remotion/google-fonts/Newsreader";
  import { loadFont as loadDM } from "@remotion/google-fonts/DMSans";
  import { loadFont as loadNotoSans } from "@remotion/google-fonts/NotoSansSC";
  import { loadFont as loadNotoSerif } from "@remotion/google-fonts/NotoSerifSC";
  const { fontFamily: news } = loadNews("italic", { weights: ["500","600"] });
  const { fontFamily: dm } = loadDM("normal", { weights: ["400","500"] });
  const { fontFamily: notoSans } = loadNotoSans("normal", { weights: ["400","500","700"], subsets: ["chinese-simplified"] });
  const { fontFamily: notoSerif } = loadNotoSerif("normal", { weights: ["500","700"], subsets: ["chinese-simplified"] });
  ```
  （务必加中文 subset，否则中日文不显示。）
- **无外部依赖**：不引用网络图片、不引用音频、不依赖 `staticFile()` 资源（除非把字体本地化）。所有图形用**内联 SVG / `<AbsoluteFill>` + CSS** 绘制（桥、卡片、标签都用代码画）。这样可一键 render，不缺资产。
- **可读性**：文字短、字号大、对比度达标（白字配深海青、墨字配沙色，均 ≥ AA 4.5:1）。
- **布局**：用 `<AbsoluteFill>` 做满屏层叠；元素居中，避开第 2 节的安全区。
- **代码组织**：每个 Beat 拆成独立子组件，`Root.tsx` 注册 `Composition`，主文件清晰可改。输出**完整可运行的 Remotion 工程文件**（至少 `Root.tsx` + 主 `Promo.tsx` + 各 Beat 组件），并简短说明如何 `studio` / `render`。

---

## 6. 防跑偏护栏（DO / DON'T）

### ✅ DO
- 严格用第 4 节的**精确色值与字体**。
- **高潮必须是「回译」**（Beat 3），青色回译卡是第一视觉锚点，配桥母题。
- 必须**竖屏 1080×1920 / 30fps**；前 2 秒出钩子。
- 文字**短、大、可读**；一屏一个重点。
- CTA 给出 **GitHub** 与**在线体验**两条地址，停留够久。
- 只描述 Tonebridge **真实有的功能**：地道译文、回译、一句话语气说明、两个备选说法、情绪标签、场景预设（恋爱/商务/朋友/家人）、开源/免费/免登录/可自部署。

### ❌ DON'T
- **不要照搬参考视频**的文案/配色/画面/品牌——只借结构与运镜。
- **不要编造功能**：没有语音、没有实时对话、没有 App、没有账号系统（v1 没有），不要写"AI 语音播报""一键发送到微信"之类不存在的东西。
- **不要**通用 stock / AI-slop 审美（霓虹渐变、赛博朋克、3D 小球、千篇一律的 SaaS 蓝）。气质是 editorial、真诚、克制。
- **不要**横屏、不要黑屏开场、不要把关键字放进底部平台 UI 遮挡区。
- **不要**依赖外部图片/音频/网络资源；不要硬编码字体名。
- **不要**让动效喧宾夺主（过度旋转/弹跳/闪烁）。

---

## 7. 如何把参考模板喂给 Gemini（拆解 → 映射）

让 Gemini 先做这件事，再写代码：

1. **拆解参考视频**：逐镜记录它的——镜头数量、每镜时长、转场类型、文字入场方式、节奏曲线（哪里快哪里慢）、信息密度。**只记结构与手法，不记它的具体内容。**
2. **映射到 Tonebridge 分镜**：把参考的结构套到第 3 节的四拍上。填下面这张表：

| 参考视频镜头 | 时长/节奏 | 它用的转场/动效手法 | → 映射到 Tonebridge 哪一拍 | Tonebridge 的文案/画面（用第 3 节） |
| --- | --- | --- | --- | --- |
| 镜 1（开场钩子） | | | Beat 1 痛点 | 「你发出去的"我想你"，对方读到的是系统通知。」 |
| 镜 2 | | | Beat 2 怎么用 | 招牌例句 + 期待/跨国恋爱标签 + 日语译文 |
| 镜 3（高潮） | | | **Beat 3 回译★** | 青色回译卡 +「…去神社参拜」+ 桥 |
| 镜 4（收尾） | | | Beat 4 CTA | Tonebridge 字标 + 开源/免费 + 两条地址 |

3. 若参考视频镜头数与四拍对不上：**以 Tonebridge 四拍为准**，把参考的多余镜头合并、或借它的转场手法补足；**绝不为了贴合参考而牺牲"回译高潮"或加进不存在的功能**。

---

## 8. 可直接复制发给 Gemini 的最终成稿

> 把下面整段连同参考视频一起发给 Gemini。

```
你是资深动效设计师 + Remotion 工程师。我给你一个【参考模板视频】，请你产出一段为开源项目 Tonebridge 制作的竖屏社媒推广视频的【Remotion 代码】。

【最重要的边界】
只借用参考视频的「节奏 / 转场 / 文字动效手法 / 高级质感」，绝不照搬它的文案、配色、画面、品牌、产品。你要做的是「把参考视频的骨架，换上 Tonebridge 的血肉」。

【先做拆解，再写代码】
第一步，拆解参考视频：逐镜记录镜头数、每镜时长、转场类型、文字入场方式、节奏快慢（只记手法，不记它的内容）。
第二步，把这套结构映射到下面 Tonebridge 的四拍分镜上。镜头数对不上时以「四拍」为准，并且无论如何不能牺牲「回译高潮」，也不能加入 Tonebridge 不存在的功能。
第三步，输出完整可运行的 Remotion 工程代码。

【Tonebridge 是什么】（只能描述这些真实功能）
一个把心里话翻成对方母语里「地道、带指定情绪」说法的工具，并附【回译】（把译文再翻回母语）让你确认对方读到的语气。
用法：输入一句话 → 选情绪标签（期待/温柔/正式/好奇…）+ 场景预设（跨国恋爱/商务/朋友/家人）→ 一键得到：地道译文 + 回译 + 一句话语气说明 + 两个备选说法。
它是开源、免费、免登录、可自部署的。GitHub：github.com/LucasWWWWWW/tonebridge ；在线体验：tonebridge-ecru.vercel.app
痛点：Google Translate 太生硬，只翻字面不翻感觉；裸用 AI 又要自己写 prompt 补上下文，还揣摩不准情绪、没人帮你确认翻对没。
【核心卖点 = 回译】：消除「我这句到底说对没」的焦虑，这是裸翻译给不了的。视频高潮必须落在回译。

【成片规格】
竖屏 1080×1920、30fps、时长 15–25s（建议 ~18s，durationInFrames≈540）。前 2 秒必须出钩子，不要黑屏开场。文字主体避开上下各 ~12% 内边距和底部 ~15% 的平台 UI 遮挡区。不依赖任何音频/BGM，不引用音频文件。

【四拍分镜（高潮必须是回译）】
Beat1 钩子/痛点（0–3.5s）：深海青深底，扎心痛点文案，如「你发出去的"我想你"，对方读到的是系统通知。」关键词用珊瑚橙高亮，文字逐句淡入上移。
Beat2 怎么用（3.5–9s）：展示「输入一句话 → 选两个标签 → 出地道译文」。招牌例句（中文）：「我想和你一起去看花火大会，然后去祭拜神社」；标签：情绪「期待」+ 场景「跨国恋爱」（胶囊 pill，逐个 pop 入场）；日语译文卡（衬线）：「一緒に花火大会に行って、それから神社にお参りしたいな。」
Beat3 回译高潮（9–14.5s）★：青色（Ocean）回译卡是第一视觉锚点，明显比其他卡醒目。回译内容（中文）：「我想和你一起去看花火大会，然后去神社参拜」，上方小标签「回译 · 确认对方读到的意思」，可加语气说明「语气：恋人间的期待与亲昵」。一座简笔拱桥从译文卡画到回译卡（沿路径逐段描出），象征连接两种语气。回译卡到位后有一个确认感的轻微回弹/勾选。这里节奏放慢半拍，让人读完。
Beat4 CTA（14.5–18s）：回到深海青底，Tonebridge 字标（Newsreader 斜体衬线）+ slogan「搭一座语气的桥」+ 轻标签「开源·免费·打开即用」+ 两条地址（github.com/LucasWWWWWW/tonebridge 和 tonebridge-ecru.vercel.app），CTA 稳定停留≥1.5s。

【品牌硬规范（精确色值，不许换）】
Ocean 深海青 #1f5963（主底/沉浸，深色底用 #133a42）；Coral 珊瑚橙 #bd5526（主强调，深色用 #f08350）；Sand 沙色 #f4ecdf（暖底）；Ink 墨 #21383c（文字，深色底用 #f0ece1）；回译卡=Ocean 青（深底用亮青 #6cc4b8）；Gold #94692a（语气提示）。
回译卡=青色=第一视觉锚点，其他卡用沙色/纸白。整体偏深色=深海青沉浸（痛点拍与 CTA 拍用深底，操作拍可切暖底制造对比）。
字体（用 @remotion/google-fonts 加载）：英文标题/字标用 Newsreader Italic（斜体衬线，editorial 气质）；英文 UI/标签用 DM Sans；中日文正文用 Noto Sans SC；译文/回译卡的中日文用 Noto Serif SC（衬线，更有被认真校对的质感）。
桥母题：简笔拱桥（拱形主梁 M3 21 Q16 3 29 21 + 三根竖柱 + 桥面横线），用内联 SVG，描边可沿路径逐段画出（strokeDasharray + strokeDashoffset）。
动效原则：统一用 spring（轻微 overshoot）做入场，interpolate 控 opacity/translateY/scale；文字逐行逐句入场；缓动柔和（cubic-bezier(0.22,1,0.36,1)）；气质真诚、克制、editorial，不要 MG 炫技。

【Remotion 技术约束】
根 <Composition id="TonebridgePromo" durationInFrames={540} fps={30} width={1080} height={1920} />，内部用多个 <Sequence from durationInFrames> 承载四拍。
用 useCurrentFrame() 取帧（注意 Sequence 内是相对该 Sequence 起点的帧）；用 interpolate(frame,[a,b],[x,y],{extrapolateLeft:'clamp',extrapolateRight:'clamp'}) 控数值；用 spring({frame,fps,config}) 做物理入场；用 useVideoConfig() 取 fps/宽高，不要写死。
字体在模块顶层（组件外）调用 loadFont，把返回的 fontFamily 字符串用于 style，不要硬编码字体名；Noto Sans/Serif SC 必须加 chinese-simplified subset，否则中日文不显示。
不引用任何网络图片/音频/外部资源；所有图形（桥、卡片、标签、勾选）都用内联 SVG / AbsoluteFill + CSS 代码画出，保证一键 render 不缺资产。
文字短、字号大、对比度达 AA（白字配深海青、墨字配沙色）。用 AbsoluteFill 满屏层叠并居中，避开安全区。
每个 Beat 拆成独立子组件，提供 Root.tsx 注册 Composition + 主 Promo.tsx + 各 Beat 组件，并简短说明如何 npx remotion studio 预览、npx remotion render 导出。

【护栏 DON'T】
不要照搬参考视频的文案/配色/画面/品牌（只借结构与运镜）；不要编造功能（没有语音、没有实时对话、没有 App、没有账号系统）；不要通用 stock/AI-slop 审美（霓虹/赛博朋克/SaaS 蓝/3D 小球）；不要横屏、不要黑屏开场、不要把关键信息放进底部平台 UI 遮挡区；不要依赖外部资源、不要硬编码字体名；不要让动效喧宾夺主。高潮必须是回译，CTA 必须含 GitHub 与在线体验两条地址。

现在：先输出你对参考视频的「结构/运镜拆解」和「映射到四拍」的简表，再输出完整 Remotion 代码。
```

---

## 核实记录（Remotion API，2026-06 核对）

通过 WebSearch 核对了 Remotion 官方文档（remotion.dev），确认以下用法为当前约定：
- `<Composition>` 接受 `id` / `component` / `width` / `height` / `fps` / `durationInFrames`；首帧为 0、末帧为 `durationInFrames - 1`。
- `useCurrentFrame()` 返回当前帧；在 `<Sequence>` 内返回的是**相对该 Sequence 起点（`from`）偏移后的帧**。
- `interpolate()` 把一个区间映射到另一个区间（配 `extrapolateLeft/Right: 'clamp'` 防越界）。
- `spring()` 为物理动画原语，可能 overshoot，通过 `mass`/`damping` 调；通常传 `frame` 与 `fps`。
- `<Sequence from durationInFrames>` 控制子元素的挂载时段。
- `useVideoConfig()` 取 `fps`/`width`/`height`/时长。
- `@remotion/google-fonts/<FontName>` 的 `loadFont(style, { weights, subsets })`：**在模块顶层调用**（不要放组件内，否则 render 时回退系统字体），用返回的 `fontFamily` 字符串、**不要硬编码字体名**；默认只加载 `400` 权重与 `latin` subset，需要中日文必须显式加对应 subset。
- `staticFile()` 用于引用 `public/` 下资源——本片刻意**不使用**外部资源以保证一键 render。
