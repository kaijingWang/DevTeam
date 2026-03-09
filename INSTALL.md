# DevTeam CLI - 一键安装指南

## 🚀 快速安装

### macOS / Linux

```bash
curl -fsSL https://raw.githubusercontent.com/kaijingWang/DevTeam/main/install.sh | bash
```

或者使用 wget:

```bash
wget -qO- https://raw.githubusercontent.com/kaijingWang/DevTeam/main/install.sh | bash
```

### Windows

**方法1: PowerShell (推荐)**

```powershell
irm https://raw.githubusercontent.com/kaijingWang/DevTeam/main/install.bat | iex
```

**方法2: 下载并运行**

1. 下载 [install.bat](https://raw.githubusercontent.com/kaijingWang/DevTeam/main/install.bat)
2. 右键 → 以管理员身份运行

### 手动安装

```bash
# 克隆仓库
git clone https://github.com/kaijingWang/DevTeam.git
cd DevTeam

# 安装依赖
npm install

# 全局安装
npm link
```

---

## 📋 系统要求

- **Node.js**: v16.0.0 或更高
- **npm**: v7.0.0 或更高
- **Git**: 可选（用于克隆仓库）

### 检查版本

```bash
node -v   # 应该 >= v16.0.0
npm -v    # 应该 >= v7.0.0
```

### 安装 Node.js

**macOS:**
```bash
brew install node
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install nodejs npm
```

**Windows:**
下载安装包: https://nodejs.org

---

## ⚙️ 配置

安装完成后，配置 Claude API Key:

```bash
devteam config set llm.apiKey YOUR_CLAUDE_API_KEY
```

获取 API Key: https://console.anthropic.com

---

## 🎯 快速开始

### 1. 创建新项目

```bash
devteam dev "用户登录功能"
```

### 2. 使用模板

```bash
# 查看可用模板
devteam template list

# 使用模板创建项目
devteam template init react-app my-app
```

### 3. 代码审查

```bash
devteam review src/
```

### 4. 修复 Bug

```bash
devteam fix "TypeError: Cannot read property" --file src/app.js
```

### 5. 生成文档

```bash
devteam docs all
```

### 6. AI Pair Programming

```bash
devteam pair
```

---

## 📖 完整命令列表

```bash
devteam --help              # 查看帮助
devteam dev <requirement>   # 开发新功能
devteam template <cmd>      # 模板管理
devteam review [files]      # 代码审查
devteam fix <error>         # 修复Bug
devteam docs <type>         # 生成文档
devteam plugin <cmd>        # 插件管理
devteam pair                # AI Pair Programming
devteam learn <cmd>         # 学习模式
devteam config              # 配置管理
devteam sessions            # 会话管理
devteam cache               # 缓存管理
devteam resume              # 恢复会话
```

---

## 🔧 故障排除

### 权限错误

**macOS/Linux:**
```bash
sudo npm link
```

**Windows:**
以管理员身份运行 PowerShell 或 CMD

### 找不到命令

检查 npm 全局路径是否在 PATH 中:

```bash
npm config get prefix
```

添加到 PATH:

**macOS/Linux (bash):**
```bash
echo 'export PATH="$(npm config get prefix)/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

**macOS (zsh):**
```bash
echo 'export PATH="$(npm config get prefix)/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

**Windows:**
系统设置 → 环境变量 → Path → 添加 `%APPDATA%\npm`

### 网络问题

使用国内镜像:

```bash
npm config set registry https://registry.npmmirror.com
```

---

## 🆕 更新

```bash
npm update -g devteam-cli
```

或重新运行安装脚本。

---

## 🗑️ 卸载

```bash
npm uninstall -g devteam-cli
```

---

## 💬 获取帮助

- **GitHub Issues**: https://github.com/kaijingWang/DevTeam/issues
- **文档**: https://github.com/kaijingWang/DevTeam#readme
- **邮箱**: wkj11250412@outlook.com

---

## 📄 许可证

MIT License

---

**享受 AI 开发的乐趣！** 🚀
