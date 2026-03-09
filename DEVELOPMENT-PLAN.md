# DevTeam CLI v2.0.0 - 全功能开发计划

## 开发进度

### ✅ Phase 1: 基础功能（已完成）
- [x] 8个专业Agent
- [x] 智能项目分析
- [x] 增量开发模式
- [x] 交互式模式
- [x] 记忆系统
- [x] 状态管理
- [x] 缓存系统

### 🚧 Phase 2: 用户体验提升（进行中）
- [x] 流式输出 - ClaudeProvider已更新
- [x] 代码预览和确认 - CodeReviewer已创建
- [x] 模板系统 - TemplateManager已创建
- [ ] 集成到Orchestrator
- [ ] 添加模板命令
- [ ] 创建更多内置模板

### ⏳ Phase 3: 代码质量提升（待开发）
- [ ] AI代码审查
- [ ] 自动修复Bug
- [ ] 测试生成增强

### ⏳ Phase 4: 开发效率提升（待开发）
- [ ] 文档生成
- [ ] 部署助手
- [ ] Git工作流增强
- [ ] 依赖管理

### ⏳ Phase 5: 平台能力提升（待开发）
- [ ] 插件系统
- [ ] 多LLM支持
- [ ] 性能分析
- [ ] 数据库迁移

### ⏳ Phase 6: 创新功能（待开发）
- [ ] AI Pair Programming
- [ ] 学习模式
- [ ] 智能重构
- [ ] 需求理解增强

### ⏳ Phase 7: 生态建设（待开发）
- [ ] Web界面
- [ ] 插件市场
- [ ] 社区建设

---

## 已创建的文件

### 流式输出
- `src/llm/ClaudeProvider.js` - 已更新支持流式
- `src/agents/base/Agent.js` - 已更新支持流式

### 代码预览
- `src/utils/codeReviewer.js` - 代码审查和确认

### 模板系统
- `src/templates/TemplateManager.js` - 模板管理器
- `templates/express-api/` - Express API模板

---

## 下一步工作

### 立即完成（今天）
1. 集成流式输出到所有Agent
2. 集成代码预览到Orchestrator
3. 添加template命令
4. 创建更多内置模板（React、Vue、Next.js）
5. 测试所有新功能

### 本周完成
6. AI代码审查功能
7. 自动修复Bug功能
8. 测试生成增强
9. 文档生成功能

### 下周完成
10. 部署助手
11. Git工作流增强
12. 依赖管理
13. 插件系统基础

---

## 实现细节

### 1. 集成流式输出

**修改所有Agent的execute方法**:
```javascript
async execute(input, options = {}) {
  const prompt = this.buildPrompt(input);
  
  if (options.stream) {
    console.log('\n  生成中...\n');
    const result = await this.chat(prompt, null, {
      stream: true,
      onChunk: (chunk) => {
        process.stdout.write(chunk);
      }
    });
    console.log('\n');
    return this.parseResult(result);
  }
  
  // 非流式模式
  const result = await this.chat(prompt);
  return this.parseResult(result);
}
```

### 2. 集成代码预览

**修改Orchestrator**:
```javascript
const { CodeReviewer } = require('../utils/codeReviewer');

async runStep(name, displayName, description, fn, results) {
  // ... 执行Agent ...
  
  const result = await fn();
  
  // 如果有代码，进行预览
  if (result.code) {
    const reviewer = new CodeReviewer();
    const { action, files } = await reviewer.reviewAndConfirm(result.code);
    
    if (action === 'regenerate') {
      return await this.runStep(name, displayName, description, fn, results);
    }
    
    if (action === 'save') {
      // 保存文件
      for (const [filename, content] of Object.entries(files)) {
        await this.saveFile(filename, content);
      }
    }
  }
  
  return result;
}
```

### 3. 添加template命令

**创建commands/template.js**:
```javascript
const { Command } = require('commander');
const { TemplateManager } = require('../templates/TemplateManager');

const templateCommand = new Command('template')
  .description('模板管理');

templateCommand
  .command('list')
  .description('列出所有模板')
  .action(async () => {
    const manager = new TemplateManager();
    const templates = await manager.list();
    
    console.log('\n📦 可用模板:\n');
    templates.forEach(t => {
      console.log(`  ${t.name} - ${t.description}`);
    });
    console.log();
  });

templateCommand
  .command('init <template> [dir]')
  .description('使用模板初始化项目')
  .action(async (template, dir = '.') => {
    const manager = new TemplateManager();
    await manager.init(template, dir);
  });

module.exports = { templateCommand };
```

### 4. 创建更多模板

**React模板**:
- `templates/react-app/`
- TypeScript + React + Vite
- Tailwind CSS
- React Router
- 状态管理

**Vue模板**:
- `templates/vue-app/`
- TypeScript + Vue 3 + Vite
- Vue Router
- Pinia状态管理

**Next.js模板**:
- `templates/nextjs-app/`
- TypeScript + Next.js 14
- App Router
- Tailwind CSS

---

## 测试计划

### 单元测试
- [ ] TemplateManager测试
- [ ] CodeReviewer测试
- [ ] ClaudeProvider流式测试

### 集成测试
- [ ] 完整开发流程测试
- [ ] 模板初始化测试
- [ ] 代码预览流程测试

### 端到端测试
- [ ] 新项目创建
- [ ] 现有项目增量开发
- [ ] 模板使用

---

## 文档更新

- [ ] 更新README - 添加新功能说明
- [ ] 创建TEMPLATES.md - 模板使用指南
- [ ] 创建STREAMING.md - 流式输出说明
- [ ] 更新CHANGELOG.md - 版本更新日志

---

## 发布计划

### v1.3.0 (本周)
- 流式输出
- 代码预览
- 模板系统

### v1.4.0 (下周)
- AI代码审查
- 自动修复Bug
- 测试增强

### v1.5.0 (2周后)
- 文档生成
- 部署助手
- Git增强

### v2.0.0 (1个月后)
- 插件系统
- 多LLM支持
- Web界面

---

**当前状态**: Phase 2 进行中  
**完成度**: 40%  
**预计完成时间**: 2周

**项目位置**: `/root/.openclaw/workspace/devteam-cli/`
