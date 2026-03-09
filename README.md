# DevTeam CLI

> 一句话，组建你的AI开发团队

[![npm version](https://img.shields.io/npm/v/devteam-cli.svg)](https://www.npmjs.com/package/devteam-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 特性

- 🎯 **产品经理** - 需求分析和PRD文档
- 🏗️ **架构师** - 技术方案设计
- 🎨 **UI设计师** - 设计系统和页面设计
- 📡 **接口设计** - API文档生成
- 👨‍💻 **开发团队** - 自动编写代码（前端+后端）
- 🧪 **测试工程师** - 自动化测试
- 📦 **DevOps** - Git管理和部署

## 安装

```bash
npm install -g devteam-cli
```

## 快速开始

### 1. 配置

首次使用需要配置API密钥：

```bash
devteam config setup
```

按照提示输入：
- LLM提供商（推荐Claude）
- API密钥
- 默认模型
- 工作目录

### 2. 开发

```bash
# 自动模式（全自动运行）
devteam dev "用户登录功能"

# 交互模式（每步询问）
devteam dev "用户登录功能" --interactive

# 步进模式（每步暂停）
devteam dev "用户登录功能" --step
```

### 3. 查看配置

```bash
devteam config list
```

## 命令

### config - 配置管理

```bash
devteam config setup          # 交互式配置向导
devteam config list           # 查看当前配置
devteam config set <key> <value>  # 设置配置项
devteam config get <key>      # 获取配置项
devteam config reset          # 重置配置
```

### dev - 开发功能

```bash
devteam dev <requirement>     # 开发新功能
  -i, --interactive           # 交互模式
  -s, --step                  # 步进模式
  -a, --auto                  # 自动模式（默认）
  --agent <agent>             # 只运行指定Agent
```

### resume - 恢复会话

```bash
devteam resume                # 恢复最近的会话
devteam resume -s <id>        # 恢复指定会话
```

### sessions - 会话管理

```bash
devteam sessions              # 查看所有会话
devteam sessions clean        # 清理已完成的会话
devteam sessions delete <id>  # 删除指定会话
```

## 工作流程

```
用户输入需求
    ↓
产品经理Agent → PRD文档
    ↓
架构师Agent → 技术方案
    ↓
UI设计师Agent → 设计系统 + 页面设计
    ↓
接口设计Agent → API文档
    ↓
后端Agent + 前端Agent（并行开发）
    ↓
测试Agent → 测试报告
    ↓
Git Agent → 提交推送
```

## 输出物

完成开发后，会生成以下文件：

```
devteam-workspace/
├── docs/
│   ├── PRD.md              # 需求文档
│   ├── TECH.md             # 技术方案
│   ├── API.md              # API文档
│   └── DESIGN.md           # 设计文档
├── design/
│   ├── design-system.json  # 设计系统
│   ├── tailwind.config.js  # Tailwind配置
│   └── components/         # 组件样式
├── src/
│   ├── backend/            # 后端代码
│   └── frontend/           # 前端代码
└── tests/                  # 测试代码
```

## 示例

### 开发用户登录功能

```bash
$ devteam dev "用户登录功能，支持用户名密码登录和手机号验证码登录" --interactive

🚀 DevTeam CLI 开始工作...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Step 1/7: 产品经理分析需求
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

产品经理正在分析... ⠋

✅ 需求分析完成

📄 需求概要：
- 用户名/密码登录
- 手机号验证码登录
- 记住登录状态
- 忘记密码功能

请选择：
  [1] 查看PRD文档
  [2] 继续下一步
  [3] 重新生成PRD
  [q] 退出

👤 输入选项: _
```

## 配置文件

配置文件位置：`~/.config/devteam-cli/config.json`

示例配置：

```json
{
  "version": "1.0.0",
  "llm": {
    "provider": "claude",
    "apiKey": "sk-ant-xxx",
    "apiUrl": "https://api.anthropic.com",
    "model": "claude-3-5-sonnet-20241022",
    "maxTokens": 4096,
    "temperature": 0.7,
    "streaming": true
  },
  "workspace": {
    "root": "./devteam-workspace",
    "docsDir": "docs",
    "srcDir": "src",
    "testsDir": "tests"
  }
}
```

## 开发状态

当前版本：**v1.0.0-alpha**

- [x] 项目框架
- [x] 配置系统
- [x] Claude集成
- [ ] Agent实现（开发中）
- [ ] Orchestrator（开发中）
- [ ] 记忆系统（计划中）
- [ ] 状态管理（计划中）

## 技术栈

- **语言**: TypeScript
- **CLI框架**: Commander.js
- **交互**: Inquirer.js
- **LLM**: Anthropic Claude API
- **配置**: Conf
- **终端美化**: Chalk, Ora, Boxen

## 作者

王凯景 <wkj11250412@outlook.com>

## License

MIT

## 贡献

欢迎提交Issue和Pull Request！

## 路线图

- [ ] 支持更多LLM（OpenAI, Gemini）
- [ ] 插件系统
- [ ] 自定义Agent
- [ ] Web界面
- [ ] 团队协作
- [ ] 云端部署

---

**让AI成为你的开发团队！**
