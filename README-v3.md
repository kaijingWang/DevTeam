# DevTeam CLI v3.0

> AI驱动的开发团队，在你的终端里

[![Version](https://img.shields.io/badge/version-3.0.0-blue.svg)](https://github.com/your-repo/devteam-cli)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## ✨ v3.0 新特性

- 🎯 **更专业的Agent** - 重构所有Agent提示词，生成高质量代码
- 🔧 **自动修复** - 自动修复常见问题（文件命名、配置文件等）
- ✅ **自动验证** - TypeScript检查、ESLint检查、构建验证
- 🚀 **即开即用** - 生成的代码可以直接运行，无需手动修复
- 📦 **项目模板** - 内置React + Vite + TypeScript完整模板
- 🔌 **连接池** - 复用TCP连接，提升API调用速度
- 💾 **智能缓存** - 缓存API响应，减少重复调用
- 🌊 **流式输出** - 实时显示生成内容，不用等待

## 🎯 核心功能

### 8个专业Agent协作

1. **PM Agent** - 产品经理，生成专业PRD文档
2. **Architect Agent** - 架构师，设计技术方案
3. **UI Designer Agent** - UI设计师，设计界面和Tailwind CSS
4. **API Designer Agent** - 接口设计师，设计API
5. **Backend Agent** - 后端工程师，生成Node.js代码
6. **Frontend Agent** - 前端工程师，生成React代码
7. **QA Agent** - 测试工程师，生成测试代码
8. **Git Agent** - DevOps工程师，管理代码版本

### 自动化工作流

```
需求输入 → Agent协作 → 代码生成 → 自动修复 → 自动验证 → 可运行项目
```

## 📦 安装

```bash
npm install -g devteam-cli
```

或者本地开发：

```bash
git clone https://github.com/your-repo/devteam-cli.git
cd devteam-cli
npm install
npm link
```

## 🚀 快速开始

### 1. 配置API

```bash
# 配置Claude API
devteam config set llm.apiKey YOUR_API_KEY
devteam config set llm.apiUrl https://api.anthropic.com
devteam config set llm.model claude-sonnet-4-6

# 查看配置
devteam config list
```

### 2. 开发项目

```bash
# 标准模式（生成+修复+验证）
devteam dev "开发一个待办事项应用"

# 快速模式（一键完成）
devteam quick "开发一个计算器"

# 不验证模式（只生成和修复）
devteam dev "开发一个五子棋游戏" --no-validate

# 不修复模式（只生成）
devteam dev "开发一个博客系统" --no-fix --no-validate
```

### 3. 运行项目

```bash
cd devteam-workspace
npm install  # 如果还没安装依赖
npm run dev  # 启动开发服务器
```

### 4. 构建部署

```bash
npm run build    # 构建生产版本
npm run preview  # 预览生产版本
```

## 📚 命令列表

### 核心命令

```bash
devteam dev <requirement>     # 开发新功能（v3增强版）
devteam quick <requirement>   # 快速开发（一键完成）
devteam chat                  # 交互式对话模式
```

### 配置管理

```bash
devteam config list                    # 查看配置
devteam config set <key> <value>       # 设置配置
devteam cache stats                    # 查看缓存统计
devteam cache clear                    # 清空缓存
```

### 其他功能

```bash
devteam template list          # 查看项目模板
devteam review [files...]      # AI代码审查
devteam fix [error]            # 自动修复Bug
devteam docs                   # 生成文档
devteam pair                   # AI Pair Programming
```

## 🎨 生成的项目结构

```
devteam-workspace/
├── docs/                      # 文档
│   ├── PRD.md                # 产品需求文档
│   ├── ARCHITECTURE.md       # 技术架构文档
│   └── API.md                # API文档
├── design/                    # 设计
│   └── UI-DESIGN.md          # UI设计文档
├── src/                       # 源代码
│   ├── components/           # UI组件
│   ├── pages/                # 页面
│   ├── store/                # 状态管理
│   ├── controllers/          # 业务逻辑
│   ├── services/             # 服务层
│   ├── utils/                # 工具函数
│   ├── types/                # 类型定义
│   ├── App.tsx               # 主应用
│   ├── main.tsx              # 入口文件
│   └── index.css             # 全局样式
├── tests/                     # 测试
│   ├── unit/                 # 单元测试
│   ├── integration/          # 集成测试
│   └── e2e/                  # E2E测试
├── public/                    # 静态资源
├── index.html                 # HTML入口
├── package.json               # 依赖配置
├── tsconfig.json              # TypeScript配置
├── vite.config.ts             # Vite配置
├── tailwind.config.js         # Tailwind配置
└── README.md                  # 项目文档
```

## 🔧 配置选项

### LLM配置

```bash
devteam config set llm.provider claude        # LLM提供商
devteam config set llm.model claude-sonnet-4-6  # 模型
devteam config set llm.apiKey YOUR_KEY        # API密钥
devteam config set llm.apiUrl https://...    # API地址
devteam config set llm.maxTokens 8192         # 最大Token数
devteam config set llm.temperature 0.7        # 温度参数
```

### 工作空间配置

```bash
devteam config set workspace.root ./devteam-workspace
devteam config set workspace.docsDir docs
devteam config set workspace.srcDir src
devteam config set workspace.testsDir tests
```

## 📊 性能优化

### 连接池

- 复用TCP连接，减少握手时间
- 最多10个并发连接
- Keep-Alive保持连接活跃

### 智能缓存

- 缓存API响应，避免重复调用
- 24小时有效期
- 最大100MB存储
- 自动清理过期缓存

### 流式输出

- 实时显示生成内容
- 不用等待完整响应
- 提升用户体验

## 🐛 故障排除

### API调用失败

```bash
# 检查配置
devteam config list

# 检查网络
curl -I https://api.anthropic.com

# 查看缓存
devteam cache stats

# 清空缓存重试
devteam cache clear
```

### 构建失败

```bash
cd devteam-workspace

# 检查依赖
npm install

# 检查TypeScript
npx tsc --noEmit

# 检查构建
npm run build
```

### 文件命名问题

```bash
# 使用自动修复
devteam dev "..." --fix

# 或手动修复
cd devteam-workspace
# 重命名 "文件：xxx" 为 "xxx"
```

## 🤝 贡献

欢迎贡献代码、报告问题、提出建议！

1. Fork本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

## 📝 更新日志

### v3.0.0 (2026-03-10)

**重大更新：**
- 🎯 重构所有Agent提示词，生成更专业的代码
- 🔧 添加自动修复工具，解决常见问题
- ✅ 添加代码验证器，确保代码质量
- 📦 添加项目模板系统
- 🔌 添加连接池，提升性能
- 💾 添加智能缓存，减少API调用
- 🌊 改用流式输出，实时显示内容

**Bug修复：**
- 修复文件命名问题（"文件："前缀）
- 修复PostCSS配置扩展名
- 修复package.json构建脚本
- 修复缺失的配置文件

### v2.0.1 (2026-03-09)

- 添加交互式对话模式
- 添加AI Pair Programming
- 添加学习模式
- 改进错误处理

### v2.0.0 (2026-03-09)

- 初始发布
- 8个Agent协作
- 完整的开发工作流

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- [Anthropic](https://www.anthropic.com/) - Claude API
- [OpenClaw](https://openclaw.ai/) - 灵感来源
- 所有贡献者

## 📮 联系方式

- 作者：小瞎子
- Email：wkj11250412@outlook.com
- GitHub：[@kaijingWang](https://github.com/kaijingWang)

---

**让AI成为你的开发团队！** 🚀
