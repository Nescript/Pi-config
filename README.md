# Pi Coding Agent 配置笔记

记录本机（nesc）的 Pi + Zed 开发环境配置，方便迁移和复现。

## 环境概览

| 组件 | 版本/说明 |
|---|---|
| Pi | `@earendil-works/pi-coding-agent` 0.82.1（npm 全局，prefix `~/.local`） |
| 编辑器 | Zed，通过 ACP 接入 pi（`pi-acp`，registry 类型） |
| 默认模型 | `kimi-coding` / `k3`，thinking level: low |
| 配置目录 | `~/.pi/agent/` |

## Zed 模型提供商（Kimi）

配置文件：`~/.config/zed/settings.json`

- **接入点**：`https://api.kimi.com/coding/v1`（Kimi Code 订阅，OpenAI 兼容协议）
- **模型**：`k3`（1M 上下文）、`k2.7`、`k2.7-highspeed`（256K 上下文）
- **温度限制**：Kimi 模型只允许 `temperature: 0.6`。Zed 需要在
  `agent.model_parameters` 里为 `Kimi` provider 显式设置 0.6，
  否则请求会报 `invalid temperature`（模型定义里的 temperature 字段不生效）
- **API Key**：Kimi Code 控制台的 key（与 platform.moonshot.cn 开放平台不通用），
  在 Zed `agent: open settings` → LLM Providers 里填，或用环境变量 `KIMI_API_KEY`

## 已装 Pi 插件（`~/.pi/agent/settings.json` → packages）

| 包 | 用途 |
|---|---|
| `pi-web-access` | 网络搜索/抓取（web_search、fetch_content 等） |
| `pi-mcp-adapter` | MCP 协议适配 |
| `@juicesharp/rpiv-ask-user-question` | 结构化提问交互 |
| `@hypabolic/pi-hypa` | 输出压缩（hypa_read/shell/grep 等） |
| `context-mode` | 上下文节省 + FTS5 知识库（ctx_* 工具） |
| `git:github.com/mattpocock/skills` | 方法论技能包（TDD、debugging、design 等） |
| `statusline-pi` | 状态栏：git、花费、CPU/内存、上下文占用 |
| `pi-markdown-preview` | Markdown 预览 |

安装方式：`pi install npm:<包名>`

## 网络搜索 curator 设置

文件：`~/.pi/web-search.json`

```json
{ "workflow": "auto-summary" }
```

- `summary-review`（默认）：每次搜索打开浏览器等人工批准 ← 很烦，已关
- `auto-summary`：不打开浏览器，模型自动生成摘要（当前设置）
- `none`：直接返回原始结果

会话内可随时用 `/curator on|off|auto-summary` 切换。

## 已知限制

- **Zed ACP 对话标题**：外部 ACP agent（pi）的线程标题固定显示"新建助手对话线程"，
  因为 pi 未实现 ACP 的标题上报（`session_info_update`）。Zed 端无法强制生成，
  只能手动重命名（Zed PR #56446）或等 pi 支持。
- **Devcontainer**：在容器里 ACP agent 运行于容器内，需在容器镜像中另装 pi。
  项目的 `.devcontainer/devcontainer.json` 使用 `maxxing/compiler-dev` 镜像。

## 相关项目

- `~/pku-compiler`：PKU 编译器课程项目，容器内构建（CMake + Koopa IR/RISC-V）
