# 贡献指南 · Contributing to Tonebridge

感谢你愿意参与 Tonebridge！这个项目欢迎各种贡献——**包括完全不写代码的**：新增一个场景预设、改进一段提示词、补充某种语言的润色要点，都是实打实的帮助。

## 开发环境搭建

```bash
# 1. Fork 并克隆
git clone https://github.com/<你的用户名>/tonebridge.git
cd tonebridge

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local，填好 LLM_BASE_URL / LLM_API_KEY / LLM_MODEL
# 推荐用 DeepSeek（便宜、国内直连、新号送额度）

# 4. 启动开发服务器
npm run dev
```

打开 http://localhost:3000 即可。技术栈：Next.js 16（App Router）+ React 19 + TypeScript + Tailwind v4 + zod v4。

## 目录结构速览

```
.
├── app/                  # Next.js App Router：页面与（计划中的）API 路由
│   ├── layout.tsx
│   ├── page.tsx          # 主界面
│   └── globals.css
├── lib/
│   ├── schema.ts         # zod 契约：请求/响应结构、情绪/正式度/目标语言常量、BYOK header
│   ├── labels.ts         # 展示标签：语言名、正式度名（UI 与结果卡片共享）
│   ├── prompt.ts         # 运行时发给模型的提示（权威文本同步在 PROMPTS.md）
│   └── presets/
│       └── scenes.ts     # 场景预设：恋爱 / 商务 / 朋友 / 家人
├── PROMPTS.md            # 提示词、JSON 契约、预设 schema（项目核心 IP）
├── CONTRIBUTING.md       # 你正在看的这份
└── README.md
```

> 说明：`lib/prompt.ts` 与 `app/api/translate` 是当前正在落地的部分；`lib/schema.ts`、`lib/labels.ts`、`lib/presets/scenes.ts` 是已稳定的共享契约。

## 贡献一个场景预设（不会写代码也能做）

这是最容易上手、也最有价值的贡献之一。打开 [`lib/presets/scenes.ts`](./lib/presets/scenes.ts)，往 `SCENES` 数组里加一段对象，照模板填：

```ts
{
  id: "your-id",            // 英文小写、唯一，如 "interview"
  label: "中文展示名",       // 选择器上显示的名字，如 "面试"
  emoji: "🎯",              // 一个 emoji
  relationship: "面试官",    // 关系
  formality: "formal",      // casual | neutral | formal（三选一）
  emotion: "坚定",           // 默认情绪（见下）
  hint: "求职面试场景，语气自信、得体、积极，避免油滑或过度谦卑。", // 给模型的一句话场景说明
},
```

填写约定：

- `id` 必须唯一、用英文小写。
- `formality` **只能**是 `casual` / `neutral` / `formal`。
- `emotion` 建议取自：好奇 / 惊讶 / 平淡 / 期待 / 温柔 / 正式 / 抱歉 / 感激 / 坚定 / 俏皮（见 `lib/schema.ts` 的 `EMOTIONS`）。
- `hint` 是写给模型的"导演说明"，越具体语气越准——这是预设质量的关键。

更详细的字段说明和示例见 [`PROMPTS.md`](./PROMPTS.md) 的「场景预设 schema」与「如何贡献预设」两节。

## 提交 Pull Request 的流程

1. 从 `main` 切一个分支：`git checkout -b add-interview-scene`
2. 做你的改动（加预设 / 改提示词 / 修文档等）。
3. 本地确认能跑：`npm run dev` 打开看一眼；如改了代码再跑 `npm run lint`。
4. 提交并推送，到 GitHub 开 PR，简单说明你改了什么、为什么。
5. 如果改的是提示词，请同时更新 `lib/prompt.ts` 和 `PROMPTS.md`，保持两边一致。

## commit 规范（轻量即可）

不强制，但推荐用简短的前缀让历史清爽：

```
feat: 新增"面试"场景预设
fix: 修正西语 tú/usted 润色要点
docs: 补充 README 部署说明
```

一句话讲清"做了什么"就够了。

## 行为准则

请保持友善、就事论事、尊重每一位贡献者——我们都在帮人把话说得更得体，自己先做到。
