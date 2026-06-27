# Tonebridge

> 用对方母语里地道、带情绪的说法，把你的话说出去——还附**回译**让你确认没说错。

*Tonebridge — say it the way a native would, with the right emotion, and read it translated back so you know it landed.*

---

跨语言沟通最难的不是"翻得对不对"，而是"我这句话，对方读起来是什么感觉"。
你想撒个娇，机翻出来像系统通知；你想道个歉，结果显得敷衍。
Tonebridge 把这件事收成一个简单动作：输入一句话、选好「关系 / 正式度 / 情绪」，一键拿到——

- **地道译文**：像母语者那样说，而不是逐字硬翻
- **回译**：把译文再翻回你的母语，让你亲眼确认意思没跑偏（核心差异点）
- **一句话语气说明**：告诉你它为什么这样选词
- **两个备选说法**：换个口吻随手可选

## 为什么做这个

- **Google Translate 太生硬**：它翻"字面"，不翻"感觉"。亲密、客气、调侃这些分寸它给不了。
- **裸问 AI 又太麻烦**：你得自己写 prompt、自己补上下文（"这是发给恋人的""要委婉一点"），AI 还经常揣摩不准情绪，更没人帮你确认到底翻对了没有。
- **Tonebridge 把这件事产品化**：情绪和场景变成可点选的标签，回译把"我这句到底说对没有"的焦虑直接消掉。这是裸用翻译器或聊天 AI 都给不了的闭环。

面向跨国恋爱、跨国商务、远程协作这类"一句话说错就尴尬"的场景。

## 特性

- 🏷️ **情绪标签**：好奇 / 期待 / 温柔 / 抱歉 / 感激 / 坚定 / 俏皮…… 让译文带上对的情绪
- 🎬 **场景预设**：恋爱 · 商务 · 朋友 · 家人，选一个就自动填好「关系 + 正式度 + 默认情绪」
- 🔁 **回译校验**：每条译文都回翻成你的母语，确认语义没漂移
- ✌️ **两个备选**：同一句话的另外两种说法，随手替换
- 📱 **移动端优先**：手机上随时打开就能用
- 🔓 **免登录**：打开即用，不收集账号
- 🔑 **自带 key 或自部署**：用部署者提供的体验额度，或填自己的 key，或整套搬到自己服务器

## 在线体验

👉 **[tonebridge-ecru.vercel.app](https://tonebridge-ecru.vercel.app)** —— 打开即用，无需登录

## 截图

> 截图待补 —— 部署后放一张主界面图。
>
> `![Tonebridge 界面](./public/screenshot.png)`

## 快速开始

```bash
# 1. 克隆
git clone https://github.com/LucasWWWWWW/tonebridge.git
cd tonebridge

# 2. 安装依赖
npm install

# 3. 配置环境变量（填好 LLM 的三个变量）
cp .env.example .env.local
# 然后编辑 .env.local

# 4. 启动开发服务器
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 即可。

## 环境变量

LLM 走 **OpenAI 兼容接口**，只需三个必填变量即可切换任意提供商：

| 变量 | 必填 | 说明 |
| --- | --- | --- |
| `LLM_BASE_URL` | ✅ | OpenAI 兼容接口的基础地址 |
| `LLM_API_KEY` | ✅ | 对应提供商的 API key |
| `LLM_MODEL` | ✅ | 使用的模型名 |

三家示例（**实际模型名 / 价格以各家最新文档为准**）：

| 提供商 | `LLM_BASE_URL` | `LLM_MODEL` | 备注 |
| --- | --- | --- | --- |
| **DeepSeek**（默认推荐） | `https://api.deepseek.com/v1` | `deepseek-chat` | 便宜、国内直连、新号送额度 |
| **Gemini**（OpenAI 兼容端点） | `https://generativelanguage.googleapis.com/v1beta/openai/` | `gemini-2.0-flash` | 用 Google 的 OpenAI 兼容网关 |
| **OpenAI** | `https://api.openai.com/v1` | `gpt-4o-mini` | 通用、稳定 |

可选——**限流**（只有配了 Upstash Redis 才启用；不配则不限流）：

| 变量 | 说明 |
| --- | --- |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis 的 REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis 的 REST token |
| `DEMO_DAILY_LIMIT_PER_IP` | 单 IP 每日上限（如 `30`） |
| `DEMO_GLOBAL_DAILY_LIMIT` | 全站每日上限（如 `2000`） |

## 三种用法

1. **体验版**：部署者配好默认 key 并开启限流，访客打开即用、不必填 key——适合做公开 demo。
2. **BYOK（自带 key）**：访客在界面「设置」里填自己的 key，**不受限流**。key 只存在访客自己的浏览器（localStorage），请求时通过 header 透传给后端，**服务端不落库、不入日志**。
3. **自部署**：把仓库部署到自己的 Vercel / 服务器，配好那三个 LLM 变量即可，**无需 Redis**。

## 部署到 Vercel

1. 在 Vercel 导入这个 GitHub 仓库
2. 在项目 Settings → Environment Variables 里填好 `LLM_BASE_URL` / `LLM_API_KEY` / `LLM_MODEL`（如需限流再加 Upstash 那几个）
3. 点 **Deploy**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/LucasWWWWWW/tonebridge)

## 工作原理

Tonebridge 的"翻译"其实是一次精心编排的 LLM 调用：

- **系统提示**：固定的本地化译者人设，要求"不逐字翻、按母语者方式重写、必给回译"，并约定只返回结构化 JSON。
- **场景预设**：选中的场景（恋爱 / 商务 / 朋友 / 家人）会带上一段 `hint`，把关系语气补进提示里。
- **语言润色要点**：针对目标语言的注意事项（如日语敬语层级、西语 tú/usted），帮模型把分寸拿稳。

完整的提示词、JSON 契约和预设结构见 [`PROMPTS.md`](./PROMPTS.md)；想加场景或参与开发见 [`CONTRIBUTING.md`](./CONTRIBUTING.md)。

## 路线图

**v1（当前范围）**

- 单条转译（一句话 → 译文 + 回译 + 语气说明 + 两个备选）
- 场景预设：恋爱 · 商务 · 朋友 · 家人
- 重点优化日语 / 英语 / 西语
- BYOK + 可选限流 + 一键自部署

**v1 之后（设想）**

- 账号与历史记录
- 语音输入 / 朗读
- 双向对话（连续往返的语气翻译）
- 更多目标语言的深度优化

## 贡献

欢迎参与！**不会写代码也能贡献**——新增一个场景预设只需要照模板填几行结构化字段。
详见 [`CONTRIBUTING.md`](./CONTRIBUTING.md) 和 [`PROMPTS.md`](./PROMPTS.md) 里的预设模板。

## 隐私

- **不持久化用户输入**：你输入的句子与译文不会被服务端存档。
- **BYOK key 只在你浏览器里**：自带 key 存于本地 localStorage，仅在请求期间通过 header 透传给后端使用，**服务端不落库、不写日志**。

## License

[MIT](./LICENSE) © 2026 LucasWWWWWW and Tonebridge contributors
