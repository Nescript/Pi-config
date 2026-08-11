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

## Skill 同步策略

原则：**Git 是唯一来源，本机目录只是加载位置或安装缓存。**

| Skill 类型 | 唯一来源 | 本机加载位置 | 同步方式 |
|---|---|---|---|
| 个人自定义 skill | `Nescript/Pi-config` 仓库 | `~/.pi/agent/skills/` | 提交并推送该仓库 |
| Matt Pocock 方法论 skill | `github.com/mattpocock/skills` | `~/.pi/agent/git/` | `settings.json` 里的 `git:github.com/mattpocock/skills@main` |
| npm 包附带的 skill | 对应 npm 包 | `~/.pi/agent/npm/` | `settings.json` 里的 `packages` |

规则：

1. 个人 skill 只放在 `~/.pi/agent/skills/`，不要复制到 `~/.agents/skills/`。
2. 外部 Git 包里的 skill 只通过 `settings.json` 声明，不复制到个人 skill 目录。
3. `~/.agents/skills/` 保持为空；它是其他 agent harness 的兼容入口，不是本配置的同步来源。
4. `~/.pi/agent/git/`、`~/.pi/agent/npm/`、`sessions/`、`auth.json`、`trust.json` 都是本机状态，已通过 `.gitignore` 排除。
5. 多平台迁移后运行审计：

```bash
node ~/.pi/agent/scripts/audit-skills.mjs
```

如果存在同名 skill，该脚本会列出所有来源并以非零状态退出。

## 跨平台配置边界

- `settings.json` 只提交跨平台一致的配置；不要把 OS 专属路径放进共享配置。
- Windows 的 Git Bash 默认路径 `C:\Program Files\Git\bin\bash.exe` 会被 Pi 自动检测，因此通常不需要提交 `shellPath`。
- 如果某台机器确实需要自定义 `shellPath`，把它保留为本机未提交差异，不要推送。
- `auth.json`、`trust.json`、`sessions/`、`models-store.json`、`npm/`、`git/` 永远不同步。

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
