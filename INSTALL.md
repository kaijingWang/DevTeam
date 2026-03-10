# DevTeam CLI v3.0 - 安装和使用指南

## 📦 安装方式

### 方式1：从GitHub安装（推荐）

```bash
# 1. 克隆仓库
git clone https://github.com/kaijingWang/DevTeam.git
cd DevTeam

# 2. 安装依赖
npm install

# 3. 全局链接
npm link

# 4. 验证安装
devteam --version
```

### 方式2：从npm安装（即将支持）

```bash
# 即将发布到npm
npm install -g devteam-cli
```

## ✅ 安装验证

安装成功后，运行以下命令验证：

```bash
# 查看版本（应显示v3.0.0）
devteam --version

# 查看帮助
devteam --help

# 查看配置
devteam config list

# 查看缓存统计
devteam cache stats
```

**预期输出：**
```
╔═══════════════════════════════════════════════════════════╗
║            DevTeam CLI - v3.0                             ║
║            AI-Powered Development Team                    ║
║                                                           ║
║  ✨ v3.0 新特性：                                         ║
║  • 更专业的Agent提示词                                    ║
║  • 自动代码修复                                           ║
║  • 自动代码验证                                           ║
║  • 迭代优化（自动修复Bug）                                ║
║  • UI交互式优化                                           ║
║  • 智能并行执行（3-5x加速）                               ║
║  • 生成可直接运行的代码                                   ║
╚═══════════════════════════════════════════════════════════╝

3.0.0
```

## ⚙️ 配置

### 首次配置

```bash
# 配置Claude API
devteam config set llm.apiKey YOUR_API_KEY
devteam config set llm.apiUrl https://api.anthropic.com
devteam config set llm.model claude-sonnet-4-6

# 查看配置
devteam config list
```

### 配置文件位置

- Linux/Mac: `~/.devteam/config.json`
- Windows: `%USERPROFILE%\.devteam\config.json`

## 🚀 快速开始

### 1. 交互式菜单（推荐新手）

```bash
devteam
# 或
devteam menu
```

会显示友好的交互式菜单，引导你完成操作。

### 2. 并行开发（最快）

```bash
devteam parallel "开发一个待办事项应用"
```

特点：
- 多Agent并行执行
- 3-5x加速
- 自动修复和验证

### 3. 迭代开发（最可靠）

```bash
devteam iterate "开发一个计算器" --max-iterations 10
```

特点：
- 自动修复Bug
- 持续迭代直到完成
- 代码质量保证

### 4. 快速开发（一键完成）

```bash
devteam quick "开发一个博客系统"
```

特点：
- 并行执行
- 自动修复
- 自动验证
- 一键完成

## 📚 常用命令

### 开发命令

```bash
# 标准开发
devteam dev "开发一个XXX"

# 并行开发（推荐）
devteam parallel "开发一个XXX"

# 迭代开发（高质量）
devteam iterate "开发一个XXX" --max-iterations 10

# 快速开发（最简单）
devteam quick "开发一个XXX"
```

### 优化命令

```bash
# UI优化（交互式）
devteam refine

# 指定项目路径
devteam refine --project-path ./my-project
```

### 配置命令

```bash
# 查看配置
devteam config list

# 设置配置
devteam config set llm.apiKey YOUR_KEY
devteam config set llm.model claude-sonnet-4-6
```

### 缓存命令

```bash
# 查看缓存统计
devteam cache stats

# 清空缓存
devteam cache clear
```

## 🎯 使用场景

### 场景1：快速原型

```bash
devteam quick "开发一个待办事项应用"
cd devteam-workspace
npm install
npm run dev
```

### 场景2：高质量项目

```bash
devteam iterate "开发一个电商系统" --max-iterations 10
cd devteam-workspace
npm run build
```

### 场景3：UI精雕细琢

```bash
# 先生成基础版本
devteam dev "开发一个博客系统"

# 交互式优化UI
devteam refine

# 在交互中不断优化直到满意
```

## 🔧 故障排除

### 问题1：命令不存在

```bash
# 解决方案：重新链接
cd DevTeam
npm unlink -g
npm link
```

### 问题2：API调用失败

```bash
# 检查配置
devteam config list

# 重新设置API Key
devteam config set llm.apiKey YOUR_KEY
```

### 问题3：缓存问题

```bash
# 清空缓存
devteam cache clear

# 重新运行
devteam parallel "开发一个XXX"
```

### 问题4：生成的代码有错误

```bash
# 使用迭代模式自动修复
devteam iterate "修复XXX问题" --max-iterations 5
```

## 📊 性能对比

| 模式 | 速度 | 质量 | 适用场景 |
|------|------|------|----------|
| quick | ⚡⚡⚡ | ⭐⭐⭐ | 快速原型 |
| parallel | ⚡⚡⚡ | ⭐⭐⭐⭐ | 标准开发 |
| iterate | ⚡⚡ | ⭐⭐⭐⭐⭐ | 高质量项目 |
| dev | ⚡⚡ | ⭐⭐⭐⭐ | 稳定开发 |

## 🆚 版本对比

### v2.0.1（旧版）

```bash
# 使用旧版
devteam-v2 dev "开发一个XXX"
```

特点：
- 顺序执行
- 无自动修复
- 无代码验证
- 生成的代码可能有错误

### v3.0.0（新版）

```bash
# 使用新版
devteam parallel "开发一个XXX"
```

特点：
- ✅ 并行执行（3-5x加速）
- ✅ 自动修复
- ✅ 代码验证
- ✅ 迭代优化
- ✅ 生成可直接运行的代码

## 💡 最佳实践

1. **首次使用** - 使用交互式菜单熟悉功能
2. **快速原型** - 使用quick命令
3. **生产项目** - 使用iterate命令确保质量
4. **UI优化** - 使用refine命令交互式优化
5. **定期清理** - 定期清空缓存释放空间

## 📞 获取帮助

- GitHub Issues: https://github.com/kaijingWang/DevTeam/issues
- 文档: https://github.com/kaijingWang/DevTeam
- Email: wkj11250412@outlook.com

## 🎉 开始使用

```bash
# 1. 安装
git clone https://github.com/kaijingWang/DevTeam.git
cd DevTeam
npm install
npm link

# 2. 配置
devteam config set llm.apiKey YOUR_API_KEY

# 3. 开始开发
devteam
```

---

**让AI成为你的开发团队！** 🚀
