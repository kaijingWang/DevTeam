# DevTeam CLI - 增量开发模式设计

## 使用场景

### 场景1：新项目开发
```bash
devteam dev "用户登录功能"
# 在空目录创建完整项目
```

### 场景2：现有项目增量开发
```bash
cd my-existing-project
devteam dev "添加支付功能" --incremental
# 在现有代码基础上添加新功能
```

---

## 核心功能

### 1. 项目检测

**自动检测现有项目：**
- 检查是否存在 `package.json`
- 检查是否存在 `src/` 目录
- 检查是否存在 `.git/` 目录
- 分析现有代码结构

**检测结果：**
```javascript
{
  isExistingProject: true,
  projectType: 'node', // node, react, vue, etc.
  hasBackend: true,
  hasFrontend: true,
  hasTests: false,
  structure: {
    backend: ['src/controllers', 'src/services', 'src/models'],
    frontend: ['src/components', 'src/pages'],
    docs: ['docs/']
  }
}
```

### 2. 上下文分析

**读取现有代码：**
```javascript
class ProjectAnalyzer {
  async analyze(projectPath) {
    // 1. 读取package.json
    const packageJson = await this.readPackageJson();
    
    // 2. 分析目录结构
    const structure = await this.analyzeStructure();
    
    // 3. 读取关键文件
    const keyFiles = await this.readKeyFiles([
      'README.md',
      'docs/API.md',
      'src/app.ts',
      'src/routes/index.ts'
    ]);
    
    // 4. 分析依赖
    const dependencies = this.analyzeDependencies(packageJson);
    
    // 5. 分析技术栈
    const techStack = this.detectTechStack(packageJson, structure);
    
    return {
      packageJson,
      structure,
      keyFiles,
      dependencies,
      techStack
    };
  }
}
```

### 3. 增量开发流程

**工作流程：**
```
用户输入需求
  ↓
检测现有项目 → 分析项目结构
  ↓
PM Agent（基于现有代码分析需求）
  ↓
Architect Agent（设计增量方案，不破坏现有架构）
  ↓
API Designer Agent（扩展现有API）
  ↓
Backend Agent（在现有代码基础上添加）
  ↓
Frontend Agent（在现有组件基础上添加）
  ↓
QA Agent（生成新功能测试）
  ↓
Git Agent（提交新代码）
```

### 4. 智能代码插入

**策略：**
1. **识别插入点** - 分析现有代码，找到合适的插入位置
2. **保持风格** - 遵循现有代码风格和命名规范
3. **避免冲突** - 检查命名冲突，自动重命名
4. **增量提交** - 只提交新增和修改的文件

**示例：**
```javascript
// 现有代码：src/routes/index.ts
import { userRouter } from './user';

app.use('/api/user', userRouter);

// 增量添加：
import { userRouter } from './user';
import { paymentRouter } from './payment'; // 新增

app.use('/api/user', userRouter);
app.use('/api/payment', paymentRouter); // 新增
```

---

## 实现方案

### 1. 命令行参数

```bash
devteam dev <requirement> [options]

Options:
  -i, --incremental     增量开发模式（在现有项目上开发）
  -p, --project <path>  项目路径（默认当前目录）
  --analyze             只分析项目，不生成代码
  --dry-run             预览将要生成的文件，不实际写入
```

### 2. 项目分析器

```javascript
// src/analyzer/ProjectAnalyzer.js
class ProjectAnalyzer {
  async analyze(projectPath) {
    const context = {
      path: projectPath,
      isExisting: await this.isExistingProject(projectPath),
      type: null,
      structure: {},
      techStack: {},
      codebase: {}
    };
    
    if (context.isExisting) {
      context.type = await this.detectProjectType(projectPath);
      context.structure = await this.analyzeStructure(projectPath);
      context.techStack = await this.detectTechStack(projectPath);
      context.codebase = await this.readCodebase(projectPath);
    }
    
    return context;
  }
  
  async isExistingProject(projectPath) {
    const indicators = [
      'package.json',
      'src/',
      '.git/'
    ];
    
    for (const indicator of indicators) {
      if (await fs.pathExists(path.join(projectPath, indicator))) {
        return true;
      }
    }
    
    return false;
  }
  
  async detectProjectType(projectPath) {
    const packageJson = await this.readPackageJson(projectPath);
    
    if (packageJson.dependencies?.react) return 'react';
    if (packageJson.dependencies?.vue) return 'vue';
    if (packageJson.dependencies?.express) return 'express';
    if (packageJson.dependencies?.['@nestjs/core']) return 'nestjs';
    
    return 'node';
  }
  
  async analyzeStructure(projectPath) {
    const structure = {
      backend: [],
      frontend: [],
      tests: [],
      docs: []
    };
    
    // 扫描目录
    const dirs = await this.scanDirectories(projectPath);
    
    for (const dir of dirs) {
      if (dir.includes('controller') || dir.includes('service')) {
        structure.backend.push(dir);
      } else if (dir.includes('component') || dir.includes('page')) {
        structure.frontend.push(dir);
      } else if (dir.includes('test')) {
        structure.tests.push(dir);
      } else if (dir.includes('doc')) {
        structure.docs.push(dir);
      }
    }
    
    return structure;
  }
  
  async readCodebase(projectPath) {
    const codebase = {
      routes: [],
      controllers: [],
      services: [],
      models: [],
      components: []
    };
    
    // 读取关键文件
    const files = await this.findKeyFiles(projectPath);
    
    for (const file of files) {
      const content = await fs.readFile(file, 'utf-8');
      const type = this.classifyFile(file);
      
      codebase[type].push({
        path: file,
        content: content.substring(0, 1000) // 只读取前1000字符
      });
    }
    
    return codebase;
  }
}
```

### 3. 增量Agent

**修改Agent基类：**
```javascript
// src/agents/base/Agent.js
class Agent {
  constructor(name, role) {
    this.name = name;
    this.role = role;
    this.llm = new ClaudeProvider();
    this.workspace = config.get('workspace').root;
    this.isIncremental = false;
    this.projectContext = null;
  }
  
  setIncrementalMode(projectContext) {
    this.isIncremental = true;
    this.projectContext = projectContext;
  }
  
  async execute(input) {
    if (this.isIncremental) {
      return await this.executeIncremental(input);
    } else {
      return await this.executeNew(input);
    }
  }
  
  async executeNew(input) {
    // 原有的新项目逻辑
  }
  
  async executeIncremental(input) {
    // 增量开发逻辑（子类实现）
    throw new Error('executeIncremental() must be implemented');
  }
}
```

**Backend Agent增量模式：**
```javascript
// src/agents/BackendAgent.js
class BackendAgent extends Agent {
  async executeIncremental(input) {
    const { requirement, apiDoc } = input;
    const { structure, codebase } = this.projectContext;
    
    console.log('  分析现有后端代码...');
    console.log(`  现有路由: ${codebase.routes.length}个`);
    console.log(`  现有控制器: ${codebase.controllers.length}个`);
    
    const prompt = `你正在为一个现有项目添加新功能。

现有项目信息：
- 项目类型: ${this.projectContext.type}
- 技术栈: ${JSON.stringify(this.projectContext.techStack)}
- 目录结构: ${JSON.stringify(structure.backend)}

现有代码示例：
${this.formatCodebase(codebase)}

新需求：
${requirement}

API文档：
${apiDoc}

请生成以下内容：

1. 需要新增的文件（完整代码）
2. 需要修改的文件（只输出修改部分）
3. 集成说明（如何将新代码集成到现有项目）

要求：
- 遵循现有代码风格
- 避免命名冲突
- 保持架构一致性
- 提供清晰的集成步骤

输出格式：

### 新增文件：src/controllers/payment.controller.ts
\`\`\`typescript
// 完整代码
\`\`\`

### 修改文件：src/routes/index.ts
\`\`\`typescript
// 在第10行后添加：
import { paymentRouter } from './payment';

// 在第25行后添加：
app.use('/api/payment', paymentRouter);
\`\`\`

### 集成说明
1. 安装依赖：npm install stripe
2. 配置环境变量：STRIPE_KEY=xxx
3. 重启服务
`;

    const response = await this.chat(prompt);
    
    // 解析响应
    const { newFiles, modifications, integration } = this.parseIncrementalResponse(response);
    
    // 创建新文件
    for (const [filename, content] of Object.entries(newFiles)) {
      await this.saveOutput(filename, content);
    }
    
    // 应用修改
    for (const mod of modifications) {
      await this.applyModification(mod);
    }
    
    return {
      newFiles: Object.keys(newFiles),
      modifications: modifications.length,
      integration,
      summary: `新增${Object.keys(newFiles).length}个文件，修改${modifications.length}个文件`
    };
  }
  
  async applyModification(mod) {
    const { file, insertAfterLine, content } = mod;
    
    // 读取现有文件
    const existing = await fs.readFile(file, 'utf-8');
    const lines = existing.split('\n');
    
    // 插入新内容
    lines.splice(insertAfterLine, 0, content);
    
    // 写回文件
    await fs.writeFile(file, lines.join('\n'), 'utf-8');
  }
}
```

### 4. 冲突检测

```javascript
// src/utils/conflictDetector.js
class ConflictDetector {
  async detectConflicts(newCode, existingCode) {
    const conflicts = [];
    
    // 1. 检查命名冲突
    const newNames = this.extractNames(newCode);
    const existingNames = this.extractNames(existingCode);
    
    for (const name of newNames) {
      if (existingNames.includes(name)) {
        conflicts.push({
          type: 'naming',
          name,
          suggestion: `${name}New` // 建议重命名
        });
      }
    }
    
    // 2. 检查路由冲突
    const newRoutes = this.extractRoutes(newCode);
    const existingRoutes = this.extractRoutes(existingCode);
    
    for (const route of newRoutes) {
      if (existingRoutes.includes(route)) {
        conflicts.push({
          type: 'route',
          route,
          suggestion: `修改路由为 ${route}/v2`
        });
      }
    }
    
    return conflicts;
  }
  
  async resolveConflicts(conflicts, newCode) {
    let resolved = newCode;
    
    for (const conflict of conflicts) {
      if (conflict.type === 'naming') {
        resolved = resolved.replace(
          new RegExp(`\\b${conflict.name}\\b`, 'g'),
          conflict.suggestion
        );
      }
    }
    
    return resolved;
  }
}
```

---

## 使用示例

### 示例1：新项目

```bash
mkdir my-app
cd my-app
devteam dev "用户登录和注册功能"

# 生成完整项目
# ├── docs/
# ├── src/
# │   ├── backend/
# │   └── frontend/
# └── tests/
```

### 示例2：现有项目增量开发

```bash
cd existing-project
devteam dev "添加支付功能" --incremental

# 输出：
# 📊 分析现有项目...
# ✓ 检测到 Express 项目
# ✓ 发现 8 个路由
# ✓ 发现 12 个控制器
# 
# 🔍 分析需求...
# ✓ 需要添加支付路由
# ✓ 需要集成 Stripe
# 
# 📝 生成代码...
# ✓ 新增 src/controllers/payment.controller.ts
# ✓ 新增 src/services/payment.service.ts
# ✓ 修改 src/routes/index.ts
# ✓ 修改 package.json
# 
# 📋 集成说明：
# 1. 运行: npm install stripe
# 2. 配置: STRIPE_KEY=xxx
# 3. 重启服务
```

### 示例3：只分析不生成

```bash
devteam dev "添加支付功能" --analyze

# 输出项目分析报告
# 不生成代码
```

---

## 优势

### 1. 灵活性
- ✅ 支持新项目
- ✅ 支持现有项目
- ✅ 自动检测项目类型

### 2. 智能性
- ✅ 理解现有代码
- ✅ 遵循现有风格
- ✅ 避免冲突

### 3. 安全性
- ✅ 预览模式（--dry-run）
- ✅ 冲突检测
- ✅ 增量提交

### 4. 易用性
- ✅ 自动检测模式
- ✅ 清晰的集成说明
- ✅ 友好的错误提示

---

## 实现计划

### Phase 1: 项目检测（2小时）
- [ ] ProjectAnalyzer实现
- [ ] 项目类型检测
- [ ] 目录结构分析

### Phase 2: 增量Agent（3小时）
- [ ] Agent基类增强
- [ ] Backend增量模式
- [ ] Frontend增量模式

### Phase 3: 冲突处理（2小时）
- [ ] ConflictDetector实现
- [ ] 自动冲突解决
- [ ] 用户确认机制

### Phase 4: 测试和文档（2小时）
- [ ] 端到端测试
- [ ] 使用文档
- [ ] 示例项目

**总计：9小时**

---

## 总结

这个增强将使DevTeam CLI成为：
- ✅ 既能创建新项目
- ✅ 又能扩展现有项目
- ✅ 真正的全能开发助手

**这将是DevTeam CLI的杀手级功能！** 🚀
