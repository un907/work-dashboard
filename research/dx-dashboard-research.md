# Developer Work Dashboard & Productivity Tools Research
Date: 2026-03-19

---

## 1. Terminal-First Personal Dashboards

### WTF (wtfutil.com)
- **What**: Personal information dashboard for the terminal (14.2k GitHub stars)
- **Features**: 80+ modules including GitHub, GitLab, Jira, Google Calendar, Slack, Jenkins, PagerDuty, Todoist, Trello, weather, crypto, sports
- **Tech**: Go, YAML config
- **Unique**: Module-based architecture; grid layout customization; everything in the terminal
- **URL**: https://wtfutil.com/

### DevDash (github.com/Phantas0s/devdash)
- **What**: Highly configurable terminal dashboard for developers
- **Features**: GitHub metrics, Google Analytics, Google Search Console, Travis CI, Feedly, SSH remote scripts, local command output
- **Tech**: Go (99.6%), YAML/JSON/TOML config, Apache 2.0
- **Unique**: High flexibility with granular widget control; multi-dashboard support; auto-refresh
- **Status**: Archived (Dec 2023) -- read-only but still usable
- **URL**: https://github.com/Phantas0s/devdash

### Sampler
- **What**: Tool for shell command execution, visualization, and alerting
- **Tech**: YAML configuration
- **Unique**: Turns any CLI output into a visual dashboard widget

---

## 2. Self-Hosted Homepage Dashboards

### Homarr
- **What**: Modern, widget-based self-hosted dashboard
- **Features**: RSS feeds, server monitoring, application control, drag-and-drop layout
- **Unique**: No YAML editing required; mostly visual configuration

### Dashy (dashy.to)
- **What**: Feature-rich self-hosted homepage dashboard
- **Features**: Status checks, widgets, themes, icon packs, UI editor
- **Unique**: Extremely customizable; supports 80+ data sources

### Heimdall
- **What**: Application dashboard with auto-fetching metadata
- **Features**: App tiles with automatic service status, logos, API integrations
- **Unique**: Minimal resource usage; visually appealing launcher

### Homepage (gethomepage.dev)
- **What**: Modern self-hosted homepage
- **Unique**: Rising as the preferred choice over Heimdall; strong community

---

## 3. Developer Productivity Metrics Platforms (Team/Org Level)

### Swarmia (swarmia.com)
- **What**: Engineering intelligence platform
- **Metrics**: DORA, SPACE framework; CI insights
- **Features**: Slackbot integration, research-backed metrics, team autonomy focus
- **Unique**: Developer-first approach; Helsinki+NYC based; "shows only carefully selected metrics"
- **URL**: https://www.swarmia.com/

### LinearB (linearb.io)
- **What**: Developer productivity platform with workflow automation
- **Metrics**: DORA metrics, cycle time, PR review time
- **Features**: Bottleneck identification, automated workflow optimization
- **Unique**: Goes beyond passive metrics with automation; heavier to roll out

### DX (getdx.com)
- **What**: Developer experience platform
- **Metrics**: "Core 4" framework -- flow, cognitive load, collaboration, developer satisfaction
- **Features**: Blends surveys with system data (repos, PRs)
- **Unique**: Focuses on developer experience over raw delivery speed

### Jellyfish (jellyfish.co)
- **What**: Engineering management platform
- **Features**: Aligns engineering output with business objectives; GenAI impact analysis
- **Unique**: Business-outcome focused; connects code to revenue

### Key Framework Evolution (2026)
- **DORA alone is insufficient** -- ignores 47% of developer time in communication/coordination
- **SPACE** (GitHub/Microsoft): Satisfaction, Performance, Activity, Communication, Efficiency
- **DX Core 4**: Unifies DORA + SPACE + DevEx into Speed, Effectiveness, Quality, Business Impact
- **Flow Metrics**: Flow Time, Cycle Time, Flow Efficiency (industry avg: 15-25% active)
- **AI paradox**: AI writes 41% of code but code churn expected to double in 2026; only ~30% of AI suggestions accepted

---

## 4. AI-Powered Standup & Daily Briefing Tools

### Pieces for Developers (pieces.app)
- **What**: AI-powered workflow context capture and standup automation
- **Data Sources**: GitHub/GitLab commits, Jira/Linear tasks, Slack messages, Notion/Confluence
- **Workflow**: Passive capture -> tool integration -> AI summarization -> 30-second human review
- **Output**: Yesterday/Today/Blockers format with PR links
- **Result**: Saves ~65 min/week on standup preparation
- **URL**: https://pieces.app/

### Gemini CLI Morning Briefing (Google)
- **What**: Daily context loading via Google Workspace extension
- **Features**: Analyzes pings, unread emails, meeting notes from previous day; cross-references calendar; loads "personal context"
- **Unique**: Runs as a CLI command every morning; uses hooks for context injection (git commits, Jira tickets, local docs)
- **Architecture**: Gemini CLI + hooks + Google Workspace extension
- **URL**: https://geminicli.com/

### DailyBot (dailybot.com)
- **What**: Customized check-ins with AI summaries
- **Features**: Automatic blocker detection; AI-driven daily standups; async check-ins
- **Unique**: Surfaces obstacles early to managers; saves hours per week

### Geekbot (geekbot.com)
- **What**: Async standups in Slack/Teams
- **Features**: Bot-driven standup collection and sharing
- **Unique**: Zero-effort team standup workflow in Slack

### Git Digest / GitRecap
- **What**: AI-powered codebase reporting from GitHub commits
- **Features**: Automated daily/weekly reports via Slack or email
- **Unique**: Pure git-based activity analysis

### dailystatus.ai
- **What**: AI-generated daily progress updates
- **Data Sources**: Slack, GitHub activity analysis
- **Unique**: Analyzes activity across platforms automatically

---

## 5. Developer-Focused Task Management

### Super Productivity (super-productivity.com)
- **What**: Open source developer-focused to-do app
- **Features**: Jira/GitHub/GitLab integration, built-in Pomodoro timer, time tracking with export, offline-first, plugin system
- **Unique**: Mirrors issue tracker work without altering original tickets; adds personal notes and sub-tasks
- **URL**: https://super-productivity.com/

### Taskwarrior
- **What**: CLI-only task manager
- **Features**: Advanced filtering/query language, Timewarrior integration, scriptable hooks
- **Unique**: Pure terminal workflow; maximum speed; automation via scripts
- **URL**: https://taskwarrior.org/

### Linear (linear.app)
- **What**: Issue tracker for high-performance teams
- **Features**: GitHub PR integration, keyboard-centric UI, cycles/sprint planning
- **Unique**: Built specifically for software delivery workflows; extremely fast UI

### TaskCafe (github.com/JordanKnott/taskcafe)
- **What**: Open source kanban task management
- **Unique**: Developer built it because he wanted a tool he'd enjoy using himself

### Kanri
- **What**: Cross-platform offline-first kanban board
- **Tech**: Tauri + Nuxt.js v3 + Tailwind CSS
- **Unique**: Desktop native; offline-first; focus on simplicity

### Vikunja (vikunja.io)
- **What**: Open source self-hostable to-do app
- **Unique**: Full-featured Todoist alternative with self-hosting

---

## 6. GitHub-Centric Personal Management

### GitHub Projects as Life Management (Zenn article)
- **Author**: Kyohei Fukuda (@hand_dot)
- **Approach**: Uses a personal "life" GitHub repo with Issues for substantial tasks (apartment lease, dental, NISA setup)
- **Tools**: Project Boards (kanban), Task Lists (nested checklists), Milestones
- **Philosophy**: "Consistent operations across work and personal life eliminate cognitive switching"
- **Boundary**: Complex multi-step tasks -> GitHub Issues; shopping lists -> Microsoft To Do
- **URL**: https://zenn.dev/hand_dot/articles/85c9640b7dcc66

### GitHub Projects Productivity Dashboard (ZOZO)
- **Architecture**: GitHub Projects -> GitHub GraphQL API -> GitHub Actions (Python) -> BigQuery -> Looker Studio
- **Metrics**: Timeline (planned vs actual), work classification, AI adoption (hours saved), estimation accuracy
- **4 Dashboard Views**: WBS roadmap, Initiative Review (bottleneck prediction), Half-Year Review, Hours Entry
- **Retrospectives**: Weekly (20 min), Post-initiative, Semi-annual
- **Finding**: AI usage rose from 44% to 73% of issues (Apr-Dec 2025)
- **URL**: https://techblog.zozo.com/entry/github-projects-productivity-metrics

### GitHub PR Dashboard (github.com/AKharytonchyk/git-pull-request-dashboard)
- **What**: Comprehensive PR monitoring across multiple repos
- **Features**: Highlights where review is requested; syncs every minute

### git-quick-stats (git-quick-stats.sh)
- **What**: CLI for git repository statistics
- **Features**: `--my-daily-stats`, `--commits-per-day`, contributor stats
- **Unique**: Simple and fast; no setup required

---

## 7. Coding Activity Tracking

### WakaTime (wakatime.com)
- **What**: Automatic coding activity tracking via editor plugins
- **Features**: Time per project/language/editor; leaderboards; goals
- **Unique**: Works across all major IDEs; open source plugins

### Wakapi (wakapi.dev)
- **What**: Open source self-hosted WakaTime-compatible backend
- **Tech**: Go + SQLite/MySQL/PostgreSQL
- **Features**: Prometheus exports, REST API, weekly email reports
- **Unique**: Full WakaTime compatibility; self-hosted; privacy-first
- **URL**: https://github.com/muety/wakapi

### ActivityWatch
- **What**: Open source automated time tracker
- **Features**: Cross-platform; tracks all application usage
- **Unique**: Privacy-first; comprehensive (not just coding)

### FlouState
- **What**: Developer activity tracker
- **Unique**: Tracks WHAT you code (creating, debugging, refactoring), not just duration

---

## 8. Developer Journal & Work Log Tools

### Journalot (journalot.dev)
- **What**: Minimal CLI journaling for developers
- **Features**: Git-based version control, markdown files, quick capture, natural language dates, search/stats
- **Unique**: Respects $EDITOR; git-native

### stup (github.com/iridakos/stup)
- **What**: CLI tool for standup notes
- **Tech**: Bash script
- **Unique**: Purpose-built for daily standup note management

### dsu (Daily Stand Up)
- **What**: CLI for daily standup participation
- **Features**: CRUD for daily activities
- **Unique**: Agile DSU-specific

### jrnl
- **What**: Open source CLI journal
- **Features**: AES encryption, lightweight
- **Unique**: Privacy-first with encryption

---

## 9. Internal Developer Portals & Platform Engineering

### Backstage (backstage.io)
- **What**: Open source developer portal framework (Spotify)
- **Features**: Software catalog, service ownership, documentation, TechDocs, scaffolding templates
- **Adoption**: 3,400+ orgs, 2M+ developers, 89% market share among IDP frameworks
- **Users**: American Airlines, LinkedIn, HP, Mercedes-Benz, IKEA, Epic Games, etc.
- **Challenge**: Keeping data (especially ownership) accurate and up-to-date
- **URL**: https://backstage.io/

### Port (port.io)
- **What**: Internal developer portal platform
- **Features**: Service catalogs, quality scorecards, integration plugins
- **Unique**: Self-service discovery; curated developer experience

### Key Trends (2025-2026)
- 55% of orgs adopted platform engineering in 2025; Gartner forecasts 80% by 2026
- Average dev team uses 7.4 tools; 75% of devs lose 6-15 hours/week to context switching
- 92% of CIOs planning AI integrations into platforms
- GitOps becoming gold standard ("single source of truth in a repository")

---

## 10. Workflow Automation Platforms

### n8n (n8n.io)
- **What**: Open source workflow automation (self-hostable Zapier alternative)
- **Features**: 400+ integrations including GitHub, Slack, Google Calendar; visual editor; AI capabilities
- **Templates**: 280+ free templates including DevOps automation
- **Unique**: Full data control; self-hostable; open source
- **URL**: https://n8n.io/

### Windmill (windmill.dev)
- **What**: Open source workflow engine for data pipelines and internal tools
- **Unique**: Enterprise security; developer-focused; AI integration

### Activepieces
- **What**: Open source automation platform
- **Features**: Visual workflow builder; AI capabilities
- **Unique**: Team-focused; open source

### ToolJet
- **What**: Open source AI-native platform for internal tools
- **Features**: Dashboards, workflows, AI agents
- **Unique**: Comprehensive platform for building custom internal tools

---

## 11. Developer Feed & News Aggregators

### daily.dev
- **What**: Personalized developer news feed
- **Features**: Browser extension; AI-curated feed tailored to your tech stack; community
- **Unique**: 1M+ newsletter subscribers; automatic tech stack detection

### DevURLs (devurls.com)
- **What**: Developer news aggregator
- **Unique**: Clean, minimal interface; multiple source aggregation

---

## 12. Developer Environment & Launcher Tools

### Raycast (raycast.com)
- **What**: macOS launcher with developer extensions
- **Features**: GitHub PR management, Google Calendar, Reclaim.ai scheduling, Copilot integration, clipboard history, window management
- **Unique**: Keyboard-driven; massive extension ecosystem; AI integration

### ScriptKit
- **What**: Automation launcher with JavaScript scripting
- **Usage**: Custom documentation searches, browser tab management, package lookups, GitHub access, note search, code snippet insertion
- **Unique**: Simple JavaScript for custom automation; rapid prototyping

---

## 13. Emerging Patterns & HN Community Insights

### What Developers Want (from HN "What tool do you wish existed in 2026?")
1. **"Jarvis at work"** -- AI that determines daily priorities and what needs attention; existing planners fall short
2. **Physical-to-digital bridge** -- Whiteboard/sticky notes that automatically become digital and iterable
3. **Local CI environments** -- Access to CI environment locally; eliminate commit-push-wait cycle
4. **Context-aware briefing** -- Morning briefing that loads personal context for focused day start

### Key Themes Across All Research
1. **Context switching is the #1 enemy** -- 7.4 tools average; 6-15 hours/week lost
2. **Terminal-first tools gaining traction** -- Developers want dashboards in their existing workflow
3. **AI summarization is the killer feature** -- Auto-generating standups, briefings, reports from activity
4. **Self-hosted/privacy-first is important** -- Developers want control of their data
5. **GitHub as center of gravity** -- Many tools orbit around GitHub as the source of truth
6. **"Personal context loading"** -- The idea of a morning briefing that loads your state (Gemini CLI, Pieces)
7. **Paired metrics over single metrics** -- Never measure just velocity; always pair with quality/satisfaction
8. **Work journal/daily log as secret weapon** -- Many devs advocate for journaling as productivity multiplier
9. **Passive capture > manual logging** -- Auto-detecting activity beats manual time tracking
10. **Unified view is aspirational** -- Everyone wants one dashboard but most still use 5-10 tools

---

## 14. Open Source Projects Worth Studying

| Project | Stars | Tech | Focus |
|---------|-------|------|-------|
| WTF | 14.2k | Go | Terminal personal dashboard |
| Backstage | 28k+ | TypeScript | Developer portal framework |
| n8n | 40k+ | TypeScript | Workflow automation |
| Grafana | 65k+ | Go/TypeScript | Metrics visualization |
| Super Productivity | 10k+ | TypeScript | Developer task management |
| Wakapi | 2.5k+ | Go | Self-hosted WakaTime |
| Dashy | 18k+ | Vue | Self-hosted homepage |
| Monica | 21k+ | PHP | Personal CRM |
| DevDash | 5k+ | Go | Terminal dev dashboard |
| Kanboard | 8k+ | PHP | Kanban board |
| ToolJet | 30k+ | TypeScript | Internal tools builder |

---

## 15. Japanese Community Insights

### GitHub Projects 活用 (ZOZO Tech Blog)
- GitHub Projects + BigQuery + Looker Studio で工数可視化
- カスタムフィールドで AI 活用時間を計測
- 週次/半期レトロスペクティブで改善サイクル

### GitHub で人生管理 (Zenn)
- 個人リポジトリで生活タスクをIssue管理
- 仕事と同じ操作体系で認知負荷を削減
- マイルストーン、プロジェクトボード活用

### サイボウズ生産性向上チーム (Zenn)
- SPACEフレームワークで開発者生産性を理解
- CI/CD基盤整備、ドキュメント整備に注力

### AIツール自作トレンド (2025-2026)
- AIを活用して数時間で無料でツール開発可能に
- プログラム知識不要で個人ダッシュボード構築

---

## Summary: Key Differentiation from Generic PM Tools

What makes developer-specific dashboards different from generic project management:

1. **Git-native**: Activity data comes from commits, PRs, branches -- not manual entry
2. **Code-aware**: Understands code complexity, churn, review cycles
3. **Terminal-friendly**: CLI/TUI interfaces that fit developer workflow
4. **API-first**: Designed for extensibility and custom integrations
5. **Privacy-conscious**: Self-hostable, local-first options
6. **Metrics that matter**: DORA, SPACE, Flow -- not just "tasks completed"
7. **Context-aware AI**: Understands development context for summarization
8. **Low-friction capture**: Passive activity tracking vs manual logging
9. **Cross-tool aggregation**: Pulls from GitHub + CI + issue tracker + calendar + chat
10. **Developer autonomy**: Tools devs choose for themselves, not imposed top-down
