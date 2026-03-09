# DevTeam CLI 使用教程

## 🚀 快速开始

### 1. 配置 API Key

首先需要配置 Claude API Key：

```bash
# 设置 API Key
devteam config set llm.apiKey YOUR_CLAUDE_API_KEY

# 验证配置
devteam config get llm.apiKey
```

**获取 API Key**: https://console.anthropic.com/

---

## 📖 基础使用

### 创建新项目

最简单的方式：

```bash
devteam dev "开发一个用户登录功能"
```

这会：
1. PM Agent 分析需求，生成 PRD 文档
2. Architect Agent 设计技术方案
3. UI Designer Agent 设计界面
4. API Designer Agent 设计接口
5. Backend Agent 生成后端代码
6. Frontend Agent 生成前端代码
7. QA Agent 生成测试代码
8. Git Agent 初始化仓库并提交

**输出目录**: `./devteam-workspace/`

---

## 🎯 使用模板

### 查看可用模板

```bash
devteam template list
```

输出：
```
📦 可用模板:

🔧 express-api - Express REST API 模板
🔧 react-app - React SPA 应用模板
🔧 nextjs-app - Next.js 全栈应用模板
```

### 使用模板创建项目

```bash
# 使用 React 模板
devteam template init react-app my-app

# 使用 Express 模板
devteam template init express-api my-api

# 使用 Next.js 模板
devteam template init nextjs-app my-nextjs-app
```

---

## 🔍 代码审查

### 审查整个项目

```bash
devteam review
```

### 审查指定目录

```bash
devteam review src/
```

### 审查指定文件

```bash
devteam review src/app.js src/utils.js
```

**输出示例**：
```
╔═══════════════════════════════════════════════════════════╗
║                    代码审查报告                           ║
╚═══════════════════════════════════════════════════════════╝

📊 总体评分: 85/100

🐛 发现问题: 5个
  🔴 严重: 1个 - SQL注入风险
  🟠 重要: 2个 - 未处理的Promise
  🟡 一般: 2个 - 代码规范问题
```

---

## 🔧 自动修复 Bug

### 修复错误

```bash
devteam fix "TypeError: Cannot read property 'name' of undefined" --file src/user.js
```

**流程**：
1. AI 分析错误原因
2. 生成修复方案
3. 显示修复代码预览
4. 询问是否应用
5. 自动备份原文件
6. 应用修复

**输出示例**：
```
🔧 正在分析错误...
  ✓ 错误分析完成
  类型: runtime
  原因: 访问null对象的属性

🔧 正在生成修复方案...
  ✓ 修复方案已生成

╔═══════════════════════════════════════════════════════════╗
║                    Bug修复报告                            ║
╚═══════════════════════════════════════════════════════════╝

🔍 错误分析:
  类型: runtime
  原因: 访问null对象的属性
  严重程度: high

🔧 修复方案:
  置信度: 90%
  说明: 添加null检查

是否应用此修复？
  ✅ 应用修复
```

---

## 📝 生成文档

### 生成 README

```bash
devteam docs readme
```

### 生成 API 文档

```bash
devteam docs api
```

### 生成部署文档

```bash
devteam docs deploy
```

### 生成所有文档

```bash
devteam docs all
```

**输出**：
- `README.md` - 项目说明
- `docs/API.md` - API 文档
- `docs/DEPLOY.md` - 部署指南

---

## 🤝 AI Pair Programming

实时监控代码变化，提供即时建议：

```bash
devteam pair
```

**功能**：
- 监控文件变化
- 快速检查常见问题
- AI 深度分析
- 实时建议

**输出示例**：
```
🤝 启动AI Pair Programming模式...
  实时监控代码变化
  提供即时建议和警告
  按 Ctrl+C 退出

✓ 监控已启动

────────────────────────────────────────

📝 检测到文件变化: src/app.js

⚠️  发现问题 (src/app.js):
  🟡 包含console.log，记得在生产环境移除
  🔴 Promise缺少错误处理

────────────────────────────────────────
```

---

## 🧠 学习模式

### 分析编码风格

```bash
devteam learn analyze
```

AI 会学习你的：
- 缩进方式（spaces/tabs）
- 引号风格（single/double）
- 分号使用
- 命名习惯

### 查看学习到的配置

```bash
devteam learn profile
```

**输出示例**：
```
👤 用户配置:
────────────────────────────────────────

📝 编码风格:
  缩进: spaces (2)
  引号: single
  分号: 使用
  尾逗号: es5

📊 使用统计:
  总命令数: 42
  总项目数: 8

⭐ 常用命令:
  dev: 15次
  review: 8次
  fix: 6次
```

### 获取个性化推荐

```bash
devteam learn recommend
```

---

## 🔌 插件管理

### 列出插件

```bash
devteam plugin list
```

### 安装插件

```bash
devteam plugin install @devteam/eslint
```

### 卸载插件

```bash
devteam plugin uninstall @devteam/eslint
```

### 启用/禁用插件

```bash
devteam plugin enable @devteam/eslint
devteam plugin disable @devteam/eslint
```

---

## ⚙️ 配置管理

### 查看所有配置

```bash
devteam config
```

### 设置配置

```bash
# 设置 API Key
devteam config set llm.apiKey YOUR_KEY

# 设置 LLM 提供商
devteam config set llm.provider claude
devteam config set llm.provider openai
devteam config set llm.provider ollama

# 设置模型
devteam config set llm.model claude-3-sonnet-20240229
devteam config set llm.model gpt-4-turbo-preview
```

### 获取配置

```bash
devteam config get llm.apiKey
devteam config get llm.provider
```

---

## 📦 会话管理

### 查看会话列表

```bash
devteam sessions
```

### 恢复会话

```bash
devteam resume <session-id>
```

---

## 🗄️ 缓存管理

### 查看缓存统计

```bash
devteam cache stats
```

### 列出缓存

```bash
devteam cache list
```

### 清除缓存

```bash
devteam cache clear
```

### 清除指定项目缓存

```bash
devteam cache invalidate /path/to/project
```

---

## 🎨 交互模式

DevTeam CLI 支持三种运行模式：

### 1. 自动模式（默认）

```bash
devteam dev "需求" --auto
```

全自动运行，无需确认。

### 2. 交互模式

```bash
devteam dev "需求" --interactive
```

每一步都询问是否继续。

### 3. 步进模式

```bash
devteam dev "需求" --step
```

每一步暂停，查看输出后继续。

---

## 💡 实用示例

### 示例1: 创建博客系统

```bash
devteam dev "创建一个博客系统，包含文章管理、评论功能、用户认证"
```

### 示例2: 添加支付功能

```bash
devteam dev "在现有电商系统中添加支付宝和微信支付功能" --incremental
```

### 示例3: 使用模板快速开始

```bash
# 1. 创建项目
devteam template init react-app my-blog

# 2. 进入目录
cd my-blog

# 3. 添加功能
devteam dev "添加用户登录和文章发布功能"

# 4. 代码审查
devteam review src/

# 5. 生成文档
devteam docs all
```

### 示例4: 修复生产环境Bug

```bash
# 1. 修复错误
devteam fix "数据库连接超时" --file src/db.js

# 2. 审查修复
devteam review src/db.js

# 3. 生成测试
devteam dev "为数据库连接添加单元测试"
```

---

## 🔥 高级用法

### 增量开发模式

在现有项目上开发：

```bash
cd existing-project
devteam dev "添加新功能" --incremental
```

DevTeam 会：
1. 自动分析现有代码
2. 检测项目类型和技术栈
3. 在现有基础上开发

### 只分析不生成

```bash
devteam dev "需求" --analyze
```

只生成分析报告，不生成代码。

### 跳过缓存

```bash
devteam dev "需求" --skip-cache
```

强制重新分析项目。

---

## 📚 获取帮助

### 查看主帮助

```bash
devteam --help
```

### 查看命令帮助

```bash
devteam dev --help
devteam template --help
devteam review --help
```

---

## 🎯 最佳实践

### 1. 清晰的需求描述

❌ 不好：
```bash
devteam dev "做个网站"
```

✅ 好：
```bash
devteam dev "创建一个电商网站，包含商品列表、购物车、订单管理、用户认证功能"
```

### 2. 使用模板快速开始

```bash
# 先用模板创建基础结构
devteam template init react-app my-app

# 再添加具体功能
cd my-app
devteam dev "添加用户登录功能"
```

### 3. 定期代码审查

```bash
# 开发完成后审查
devteam review

# 修复发现的问题
devteam fix "问题描述" --file 文件路径
```

### 4. 生成完整文档

```bash
devteam docs all
```

### 5. 使用 AI Pair Programming

```bash
# 开发时开启实时监控
devteam pair
```

---

## 🆘 常见问题

### Q: API Key 在哪里获取？

A: https://console.anthropic.com/

### Q: 如何切换 LLM 提供商？

A: 
```bash
devteam config set llm.provider openai
devteam config set llm.apiKey YOUR_OPENAI_KEY
```

### Q: 生成的代码在哪里？

A: 默认在 `./devteam-workspace/` 目录

### Q: 如何在现有项目上使用？

A: 
```bash
cd your-project
devteam dev "需求" --incremental
```

### Q: 如何查看配置文件位置？

A: 配置文件在 `~/.devteam/config.json`

---

## 🔗 相关链接

- **GitHub**: https://github.com/kaijingWang/DevTeam
- **问题反馈**: https://github.com/kaijingWang/DevTeam/issues
- **邮箱**: wkj11250412@outlook.com

---

**享受 AI 开发的乐趣！** 🚀
