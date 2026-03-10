# DevTeam CLI v3.0 - 迭代优化功能

## 🔄 核心功能

### 1. 迭代开发（iterate）

自动修复Bug和问题，直到项目完成。

**工作流程：**
```
初始生成 → 验证 → 发现问题 → 分配Agent → 修复 → 再验证 → ...
```

**使用方法：**
```bash
# 基础用法
devteam iterate "开发一个待办事项应用"

# 指定最大迭代次数
devteam iterate "开发一个计算器" --max-iterations 10

# 不自动修复（只生成和验证）
devteam iterate "开发一个博客" --no-auto-fix
```

**迭代过程：**
1. **初始生成** - 8个Agent协作生成完整项目
2. **自动修复** - 修复文件命名、配置文件等常见问题
3. **代码验证** - TypeScript检查、ESLint检查、构建验证
4. **问题分析** - 识别TypeScript错误、构建错误、测试失败
5. **任务分配** - 根据问题类型分配给相应的Agent
6. **Agent修复** - 各Agent修复分配的问题
7. **再次验证** - 验证修复效果
8. **重复迭代** - 直到所有问题解决或达到最大次数

**问题分类：**
- TypeScript错误 → Frontend/Backend Agent
- 构建错误 → Frontend Agent
- 测试失败 → QA Agent
- ESLint错误 → Frontend/Backend Agent
- UI问题 → UI Designer Agent

**完成标准：**
- ✅ 所有测试通过
- ✅ 构建成功
- ✅ 无TypeScript错误
- ✅ 无ESLint错误

### 2. UI优化（refine）

交互式UI优化，根据用户反馈不断改进。

**工作流程：**
```
查看UI → 提出反馈 → Agent优化 → 查看效果 → 继续反馈 → ...
```

**使用方法：**
```bash
# 基础用法
devteam refine

# 指定项目路径
devteam refine --project-path ./my-project

# 只优化UI设计
devteam refine --ui

# 只优化代码实现
devteam refine --code
```

**交互流程：**
1. **选择类别** - UI设计 / 代码实现 / Bug修复 / 完成
2. **描述问题** - 详细说明需要优化的内容
3. **指定文件** - 可选，指定涉及的文件
4. **Agent优化** - UI Designer或Frontend Agent执行优化
5. **查看效果** - 运行项目查看优化效果
6. **继续优化** - 重复上述流程直到满意

**优化示例：**

```
🎨 UI设计优化：
- "主色调改成蓝色"
- "按钮圆角改大一点"
- "卡片间距增加"
- "字体改成Inter"

💻 代码实现优化：
- "添加加载动画"
- "优化列表性能"
- "添加错误提示"
- "改进表单验证"

🐛 Bug修复：
- "点击按钮没反应"
- "数据不刷新"
- "样式错位"
```

### 3. 标准开发（dev）

生成 + 修复 + 验证，一次完成。

```bash
devteam dev "开发一个XXX"
```

### 4. 快速开发（quick）

最简单的方式，一键完成所有步骤。

```bash
devteam quick "开发一个XXX"
```

## 📊 对比

| 命令 | 生成 | 修复 | 验证 | 迭代 | 交互 | 适用场景 |
|------|------|------|------|------|------|----------|
| dev | ✅ | ✅ | ✅ | ❌ | ❌ | 标准开发 |
| quick | ✅ | ✅ | ✅ | ❌ | ❌ | 快速开发 |
| iterate | ✅ | ✅ | ✅ | ✅ | ❌ | 自动优化 |
| refine | ❌ | ❌ | ❌ | ✅ | ✅ | UI优化 |

## 🎯 使用场景

### 场景1：快速原型

```bash
# 快速生成一个可运行的原型
devteam quick "开发一个待办事项应用"
cd devteam-workspace
npm run dev
```

### 场景2：高质量项目

```bash
# 迭代优化，确保代码质量
devteam iterate "开发一个电商系统" --max-iterations 10

# 查看结果
cd devteam-workspace
npm run build
npm run preview
```

### 场景3：UI精雕细琢

```bash
# 先生成基础版本
devteam dev "开发一个博客系统"

# 交互式优化UI
devteam refine

# 在交互中：
# 1. 选择"UI设计"
# 2. 输入"主色调改成深蓝色，卡片加阴影"
# 3. 查看效果
# 4. 继续优化直到满意
```

### 场景4：Bug修复

```bash
# 生成项目
devteam dev "开发一个游戏"

# 发现Bug后，使用迭代模式自动修复
devteam iterate "修复游戏中的Bug" --max-iterations 5
```

## 🔧 高级用法

### 自定义迭代策略

```javascript
// 在代码中使用
const { IterationCoordinator } = require('devteam-cli');

const coordinator = new IterationCoordinator();
coordinator.maxIterations = 10;

const result = await coordinator.execute({
  requirement: "开发一个XXX",
  projectPath: "./my-project",
  validationResult: {...},
  testResult: {...}
});
```

### 自定义问题分类

```javascript
// 扩展IterationCoordinator
class MyCoordinator extends IterationCoordinator {
  determineResponsibleAgent(filePath) {
    // 自定义逻辑
    if (filePath.includes('/api/')) {
      return 'Backend';
    }
    return super.determineResponsibleAgent(filePath);
  }
}
```

## 💡 最佳实践

### 1. 迭代次数设置

- **简单项目**：3-5次
- **中等项目**：5-10次
- **复杂项目**：10-15次

### 2. 反馈描述

**好的反馈：**
- ✅ "主色调改成#1976D2，按钮圆角改成8px"
- ✅ "列表项之间的间距增加到16px"
- ✅ "添加加载动画，使用spin图标"

**不好的反馈：**
- ❌ "改好看点"
- ❌ "优化一下"
- ❌ "不太对"

### 3. 迭代策略

1. **先自动后手动** - 先用iterate自动修复，再用refine手动优化
2. **分步优化** - 先修复Bug，再优化UI，最后优化性能
3. **及时验证** - 每次优化后立即运行查看效果

### 4. 问题追踪

```bash
# 第1次迭代
devteam iterate "开发XXX" --max-iterations 3
# 记录剩余问题

# 第2次迭代（针对剩余问题）
devteam iterate "修复XXX问题" --max-iterations 3

# 第3次迭代（UI优化）
devteam refine
```

## 🐛 故障排除

### 迭代不收敛

**问题：** 迭代多次仍有问题

**解决：**
1. 增加迭代次数
2. 检查API配置
3. 手动修复关键问题
4. 使用refine交互式优化

### Agent修复失败

**问题：** Agent无法修复某些问题

**解决：**
1. 查看详细错误信息
2. 手动修复该问题
3. 继续迭代其他问题

### 验证一直失败

**问题：** 代码验证总是失败

**解决：**
1. 检查TypeScript配置
2. 检查依赖是否安装
3. 手动运行验证命令查看详细错误

## 📚 相关文档

- [README-v3.md](README-v3.md) - 完整使用文档
- [UPGRADE-SUMMARY.md](UPGRADE-SUMMARY.md) - 升级总结
- [UPGRADE-PLAN.md](UPGRADE-PLAN.md) - 升级计划

---

**让AI团队不断优化，直到完美！** 🚀
