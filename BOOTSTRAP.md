# Pi 新平台引导（BOOTSTRAP）

> **本文档的读者是新平台上的 agent。** 按照「执行清单」逐步操作，即可完整复现这套 Pi 环境。
> 所有配置文件内容已内嵌在本文档中；个人 skill 的文件内容在本仓库 `skills/` 目录下。

## 环境前提

- Node.js + npm
- 全局安装 Pi：`npm install -g @earendil-works/pi-coding-agent`
- Windows 需要 bash（推荐 Git Bash，Pi 会自动检测 `C:\Program Files\Git\bin\bash.exe`）

## 执行清单（agent 按顺序执行）

- [ ] 1. 将本仓库克隆/放置到 `~/.pi/agent`（个人 skill 随之就位）
- [ ] 2. 写入下方「配置文件」一节中的各文件
- [ ] 3. 逐条执行「插件安装」中的 `pi install` 命令
- [ ] 4. 运行验证：`node ~/.pi/agent/scripts/audit-skills.mjs`，确认 `Name collisions: 0`
- [ ] 5. 提醒用户手动完成「需要人工处理」一节

## 插件安装（12 个包）

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
pi install npm:pi-patty-bg-tasks
pi install npm:pi-render-btw
pi install npm:pi-rich-renderer
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
| `pi-patty-bg-tasks` | 后台任务 |
| `pi-render-btw` | 渲染增强 |
| `pi-rich-renderer` | 富渲染 |

## 配置文件

### `~/.pi/agent/settings.json`

> 注意：这里**故意不包含 `shellPath`**——它是 Windows 专属路径。
> Windows 上 Pi 会自动检测 Git Bash；只有自动检测失败时才在本机手动补上。

```json
{
  "lastChangelogVersion": "0.84.1",
  "theme": "dark",
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
    "npm:pi-patty-bg-tasks",
    "npm:pi-render-btw",
    "npm:pi-rich-renderer"
  ]
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
```

### `~/.pi/web-search.json`（注意在 `~/.pi/`，不是 `~/.pi/agent/`）

```json
{"workflow":"auto-summary"}
```

## Skill 清单（共 43 个，两个来源）

### 来源一：本仓库 `skills/`（8 个个人 skill）

克隆本仓库到 `~/.pi/agent` 后自动就位，无需额外操作。

| Skill | 用途 |
|---|---|
| `batch-grill-me` | 一次性抛出所有关键问题的多轮访谈 |
| `design-an-interface` | 为模块生成多种截然不同的接口设计 |
| `edit-article` | 文章编辑：重构结构、改善表达 |
| `obsidian-vault` | Obsidian 笔记库的搜索、创建与管理 |
| `qa` | 对话式 QA，边聊边建 GitHub issue |
| `request-refactor-plan` | 通过访谈生成小步重构计划并建 issue |
| `ubiquitous-language` | 从对话提取 DDD 统一语言术语表 |
| `writing-great-skills` | 编写高质量 skill 的参考规范 |

### 来源二：`git:github.com/mattpocock/skills@main` 包（35 个）

由第 3 步的 `pi install` 自动安装到 `~/.pi/agent/git/`，**不要手动复制到任何 skills 目录**。

**规则：`~/.agents/skills` 必须保持为空**，同名 skill 多来源会导致 collision。

## 需要人工处理（agent 不可代劳）

- **API key / 认证**：Kimi Code 的 key 等凭据需在 `auth.json` 或环境变量中手动配置
- **项目信任**：每个含 `.pi` 资源的项目需运行 `/trust` 后重启 Pi
- **编辑器接入**（可选）：Zed ACP 配置见 `README.md`

## 验证

```bash
# 应输出 Name collisions: 0，共 43 个 skill
node ~/.pi/agent/scripts/audit-skills.mjs
```
