# Pi 新平台引导（BOOTSTRAP）

> **本文档的读者是新平台上的 agent。** 按照「执行清单」逐步操作，即可完整复现这套 Pi 环境。
> 所有配置文件内容已内嵌在本文档中。

## ⚠️ 维护规则（所有平台上的 agent 必须遵守）

**本文档是这套环境的唯一事实来源。** 每次发生以下变更时，必须在同一轮工作中同步更新本文档，并提交推送到 Git 仓库：

> **引导 agent 的额外义务**：完成新平台配置后，必须确认下方规则已写入 `~/.pi/agent/AGENTS.md`（全局指令，每次会话都会加载）。只有这样，日常会话中的 agent 才会记得持续维护本文档。本文档内嵌的 `AGENTS.md` 内容已包含该规则；若目标机器已有自定义 `AGENTS.md`，则**追加「Config Sync」一节，不要覆盖原有内容**。

| 变更 | 必须更新 |
|---|---|
| 安装/卸载插件 | 「插件安装」命令列表、用途表、内嵌 `settings.json` 的 `packages` 数组 |
| 新增/删除个人 skill | 「Skill 清单」中的个人 skill 表（skill 文件放入 `~/.pi/agent/skills/`） |
| 修改任何配置 | 「配置文件」一节对应的内嵌内容 |
| 任何上述变更后 | 运行 `node ~/.pi/agent/scripts/audit-skills.mjs` 验证，然后 `git add` 本文档及相关文件、commit、push |

**文档与实际环境不一致视为 bug，发现时必须立即修正文档。**

## 环境前提

- Node.js + npm
- 全局安装 Pi：`npm install -g @earendil-works/pi-coding-agent`
- Windows 需要 bash（推荐 Git Bash，Pi 会自动检测 `C:\Program Files\Git\bin\bash.exe`）

## 执行清单（agent 按顺序执行）

- [ ] 1. 将本仓库克隆/放置到 `~/.pi/agent`
- [ ] 2. 写入下方「配置文件」一节中的各文件
- [ ] 3. 逐条执行「插件安装」中的 `pi install` 命令
- [ ] 4. 确认 `bin/hypa` shim 已就位（本仓库自带，随克隆到位；详见「`bin/hypa` shim」一节），否则 pi-hypa 改写后的 bash 命令会报 `hypa: command not found`
- [ ] 5. 运行验证：`node ~/.pi/agent/scripts/audit-skills.mjs`，确认 `Name collisions: 0`
- [ ] 6. 确认「维护规则」已写入 `~/.pi/agent/AGENTS.md`（内嵌模板已包含；若该文件已有自定义内容则追加而非覆盖）
- [ ] 7. 阅读并遵守上方「维护规则」
- [ ] 8. 提醒用户手动完成「需要人工处理」一节

## 插件安装（19 个包）

```bash
pi install npm:pi-web-access
pi install npm:pi-mcp-adapter
pi install npm:@juicesharp/rpiv-ask-user-question
pi install git:github.com/mattpocock/skills@main
pi install npm:@hypabolic/pi-hypa
pi install npm:context-mode
pi install npm:statusline-pi
pi install npm:pi-markdown-preview
pi install npm:@cortexkit/pi-antigravity-auth
pi install npm:pi-render-btw
pi install npm:pi-subagents
pi install npm:@juicesharp/rpiv-todo
pi install npm:pi-background-tasks
pi install npm:@schovest/pi-sudo-helper
pi install npm:@d3ara1n/pi-session-namer
pi install npm:pi-cc-extensions
pi install npm:@narumitw/pi-usage
pi install npm:pi-cache-optimizer
pi install npm:@ff-labs/pi-fff
```

| 包 | 用途 |
|---|---|
| `pi-web-access` | 网络搜索/抓取（web_search、fetch_content 等） |
| `pi-mcp-adapter` | MCP 协议适配 |
| `@juicesharp/rpiv-ask-user-question` | 结构化提问交互 |
| `git:github.com/mattpocock/skills@main` | 35 个方法论 skill（TDD、debug、design 等） |
| `@hypabolic/pi-hypa` | 输出压缩（hypa_read/shell/grep 等） |
| `context-mode` | 上下文节省 + FTS5 知识库（ctx_* 工具） |
| `statusline-pi` | 状态栏 |
| `pi-markdown-preview` | Markdown 预览 |
| `@cortexkit/pi-antigravity-auth` | Antigravity 认证 |
| `pi-render-btw` | 渲染增强 |
| `pi-subagents` | 子代理编排 |
| `@juicesharp/rpiv-todo` | 任务清单 |
| `pi-background-tasks` | 后台任务 |
| `@schovest/pi-sudo-helper` | sudo 命令密码辅助 |
| `@d3ara1n/pi-session-namer` | 自动生成会话名称 |
| `pi-cc-extensions` | Claude Code 风格 TUI、上下文检查与会话引用 |
| `@narumitw/pi-usage` | 查看 Codex、Copilot、OpenRouter 用量 |
| `pi-cache-optimizer` | 提高 prompt 缓存命中率（稳定 prompt、cache key 兼容） |
| `@ff-labs/pi-fff` | FFF 驱动的模糊文件/内容搜索 |

## `bin/hypa` shim（pi-hypa 必需，本仓库自带）

pi-hypa 会把 `bash` 工具的命令改写为 `hypa -c '...'`（裸命令名），改写结果由 pi 原生 bash 工具执行。pi 每次 spawn shell 时会把 `~/.pi/agent/bin` 前置到 PATH，因此把 shim 放在该目录即可让裸 `hypa` 可解析，作用域仅限 pi，不污染系统 PATH。

- 本仓库 `bin/hypa`（git-bash 用，POSIX sh）与 `bin/hypa.cmd`（cmd 用）均为**相对路径** shim，解析 `../npm/node_modules/@hypabolic/hypa-win32-x64/bin/hypa.exe`，两台机器通用，无需按设备修改。
- 若 `pi update --extensions` 后 bash 工具报 `hypa: command not found`，先检查本目录 shim 是否存在、能否执行：`hypa --version`。
- 注意 npm allow-scripts 警告可能跳过 `@hypabolic/pi-hypa` 的 postinstall（它只负责安装 `%LOCALAPPDATA%\Hypa\bin` 的用户级 shim），不影响本仓库 shim 的工作。

## 配置文件

### `~/.pi/agent/settings.json`

> **此文件已移出 Git 同步**（两台机器的 `shellPath`、已装插件进度等会发散）。本节内嵌内容是唯一事实来源；插件增删时更新下方 `packages` 数组，各自机器上的真实文件由 `pi install` 自动维护。
> 注意：这里**故意不包含 `shellPath`**——它是 Windows 专属路径。
> Windows 上 Pi 会自动检测 Git Bash；只有自动检测失败时才在本机手动补上。

```json
{
  "lastChangelogVersion": "0.84.2",
  "theme": "cc-dark",
  "defaultProvider": "kimi-coding",
  "defaultModel": "k3",
  "defaultThinkingLevel": "high",
  "packages": [
    "npm:pi-web-access",
    "npm:pi-mcp-adapter",
    "npm:@juicesharp/rpiv-ask-user-question",
    "git:github.com/mattpocock/skills@main",
    "npm:@hypabolic/pi-hypa",
    "npm:context-mode",
    "npm:statusline-pi",
    "npm:pi-markdown-preview",
    "npm:@cortexkit/pi-antigravity-auth",
    "npm:pi-render-btw",
    "npm:pi-subagents",
    "npm:@juicesharp/rpiv-todo",
    "npm:pi-background-tasks",
    "npm:@schovest/pi-sudo-helper",
    "npm:@d3ara1n/pi-session-namer",
    "npm:pi-cc-extensions",
    "npm:@narumitw/pi-usage",
    "npm:@ff-labs/pi-fff",
    "npm:pi-cache-optimizer"
  ],
  "hideThinkingBlock": true,
  "tuiMode": "regular"
}
```

### `~/.pi/agent/keybindings.json`

```json
{
  "tui.editor.cursorLeft": ["left"]
}
```

### `~/.pi/agent/AGENTS.md`

```markdown
# Global Pi Instructions

## Communication
### Style
- GitHub 风格 Markdown 格式（标题、列表、代码块、表格等）
- 主动但不出人意料——主动提供有用信息，但不做用户没要求的重大变更
- 像友好同事一样解释工作——说明做了什么、为什么、有什么取舍
- 不确定时主动询问用户意图，而不是猜测
- 保持简洁实用

### Language
- 回复使用用户输入的语言（中文或英文）

## Safety
- Review `rm -rf`, `sudo`, and `chmod` before execution
- Do not modify `~/.ssh/`, `.env`, or credential files

## Workflow
- Prefer `edit` over `write` for incremental changes
- Respect project-level `AGENTS.md` / `CLAUDE.md` if present

## Config Sync
- 新增/删除 skill、安装/卸载插件、修改 Pi 配置后，必须同步更新 `~/.pi/agent/BOOTSTRAP.md` 对应章节，运行 `node ~/.pi/agent/scripts/audit-skills.mjs` 验证，并提交推送 Pi-config 仓库
- BOOTSTRAP.md 与本机环境不一致视为 bug，发现时立即修正
```

### `~/.pi/web-search.json`（注意在 `~/.pi/`，不是 `~/.pi/agent/`）

```json
{"workflow":"auto-summary"}
```

## Skill 清单（共 36 个）

### 个人 skill（本仓库 `skills/`）

| Skill | 用途 |
|---|---|
| `find-skills` | 发现并按需安装新的 agent skill |

> 本机实际做法：`find-skills` 真实文件放在 `~/.agents/skills/find-skills`，`~/.pi/agent/skills/find-skills` 是指向它的符号链接（多个 agent 工具共享同一份）。新平台上直接从本仓库 `skills/` 复制到 `~/.pi/agent/skills/` 即可。

新增个人 skill 时：将 skill 目录放入 `~/.pi/agent/skills/` 并同步到本仓库 `skills/`，按「维护规则」在此补充名称和用途。

### 外部包（35 个，由 `pi install` 自动安装）

- `git:github.com/mattpocock/skills@main`（35 个）

由执行清单第 3 步的 `pi install` 自动安装到 `~/.pi/agent/git/`，**不要手动复制到任何 skills 目录**。

**规则：`~/.agents/skills` 中除上述共享的 `find-skills` 外不要放其他 skill**，同名 skill 多来源会导致 collision。

## 需要人工处理（agent 不可代劳）

- **API key / 认证**：Kimi Code 的 key 等凭据需在 `auth.json` 或环境变量中手动配置
- **项目信任**：每个含 `.pi` 资源的项目需运行 `/trust` 后重启 Pi
- **编辑器接入**（可选）：Zed ACP 配置见 `README.md`

## 验证

```bash
# 应输出 Name collisions: 0，共 36 个 skill
node ~/.pi/agent/scripts/audit-skills.mjs
```
