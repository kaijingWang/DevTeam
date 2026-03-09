# DevTeam CLI - 智能启动分析设计

## 核心逻辑

**启动时自动分析：**
1. 扫描当前目录
2. 检测是否存在项目
3. 如果存在项目：
   - 分析项目类型
   - 分析开发进度
   - 检测潜在问题
   - 提供建议
4. 根据分析结果决定模式

---

## 工作流程

```
用户运行: devteam dev "需求"
  ↓
自动扫描当前目录
  ↓
检测到项目？
  ├─ 否 → 新项目模式
  └─ 是 → 分析项目
       ↓
    ┌─────────────────────┐
    │  项目深度分析        │
    ├─────────────────────┤
    │ 1. 项目类型         │
    │ 2. 技术栈           │
    │ 3. 开发进度         │
    │ 4. 代码质量         │
    │ 5. 潜在问题         │
    │ 6. 缺失功能         │
    └─────────────────────┘
       ↓
    显示分析报告
       ↓
    询问用户：新功能 or 修复问题？
       ↓
    执行相应操作
```

---

## 分析维度

### 1. 项目识别
- 项目类型（Express、React、Vue等）
- 技术栈（语言、框架、数据库）
- 项目规模（文件数、代码行数）

### 2. 开发进度分析
- 已完成的功能模块
- 正在开发的功能
- 待开发的功能
- 完成度百分比

### 3. 代码质量检测
- 语法错误
- 类型错误（TypeScript）
- 代码规范问题
- 潜在的bug
- 安全隐患

### 4. 架构分析
- 目录结构是否合理
- 模块划分是否清晰
- 是否遵循最佳实践
- 是否有技术债务

### 5. 功能完整性
- 缺少的核心功能
- 不完整的功能
- 需要优化的功能

### 6. 测试覆盖
- 是否有测试
- 测试覆盖率
- 缺失的测试

---

## 实现方案

### 1. 增强的ProjectAnalyzer

```javascript
class ProjectAnalyzer {
  async deepAnalyze(projectPath) {
    console.log('\n🔍 正在深度分析项目...\n');
    
    const analysis = {
      // 基础信息
      basic: await this.analyzeBasic(projectPath),
      
      // 开发进度
      progress: await this.analyzeProgress(projectPath),
      
      // 代码质量
      quality: await this.analyzeQuality(projectPath),
      
      // 潜在问题
      issues: await this.detectIssues(projectPath),
      
      // 缺失功能
      missing: await this.detectMissing(projectPath),
      
      // 建议
      suggestions: []
    };
    
    // 生成建议
    analysis.suggestions = this.generateSuggestions(analysis);
    
    return analysis;
  }
  
  async analyzeProgress(projectPath) {
    // 分析开发进度
    const progress = {
      completedModules: [],
      inProgressModules: [],
      todoModules: [],
      completionRate: 0
    };
    
    // 1. 读取README/TODO
    const readme = await this.readFile(projectPath, 'README.md');
    const todo = await this.readFile(projectPath, 'TODO.md');
    
    // 2. 分析代码注释中的TODO
    const todos = await this.findTODOComments(projectPath);
    progress.todoModules = todos;
    
    // 3. 分析已实现的功能
    const routes = await this.analyzeRoutes(projectPath);
    progress.completedModules = routes.filter(r => r.implemented);
    progress.inProgressModules = routes.filter(r => !r.implemented);
    
    // 4. 计算完成度
    const total = progress.completedModules.length + 
                  progress.inProgressModules.length + 
                  progress.todoModules.length;
    progress.completionRate = total > 0 
      ? Math.round((progress.completedModules.length / total) * 100)
      : 0;
    
    return progress;
  }
  
  async analyzeQuality(projectPath) {
    const quality = {
      syntaxErrors: [],
      typeErrors: [],
      lintIssues: [],
      securityIssues: [],
      score: 0
    };
    
    // 1. 检查语法错误
    quality.syntaxErrors = await this.checkSyntax(projectPath);
    
    // 2. TypeScript类型检查
    if (await this.hasTypeScript(projectPath)) {
      quality.typeErrors = await this.checkTypes(projectPath);
    }
    
    // 3. ESLint检查
    if (await this.hasESLint(projectPath)) {
      quality.lintIssues = await this.runESLint(projectPath);
    }
    
    // 4. 安全检查
    quality.securityIssues = await this.checkSecurity(projectPath);
    
    // 5. 计算质量分数
    quality.score = this.calculateQualityScore(quality);
    
    return quality;
  }
  
  async detectIssues(projectPath) {
    const issues = [];
    
    // 1. 检查依赖问题
    const depIssues = await this.checkDependencies(projectPath);
    issues.push(...depIssues);
    
    // 2. 检查配置问题
    const configIssues = await this.checkConfig(projectPath);
    issues.push(...configIssues);
    
    // 3. 检查代码问题
    const codeIssues = await this.checkCode(projectPath);
    issues.push(...codeIssues);
    
    // 4. 检查性能问题
    const perfIssues = await this.checkPerformance(projectPath);
    issues.push(...perfIssues);
    
    return issues;
  }
  
  async detectMissing(projectPath) {
    const missing = [];
    
    // 1. 检查缺失的核心文件
    const requiredFiles = [
      'README.md',
      '.gitignore',
      'package.json',
      'tsconfig.json' // 如果是TS项目
    ];
    
    for (const file of requiredFiles) {
      if (!await this.fileExists(projectPath, file)) {
        missing.push({
          type: 'file',
          name: file,
          severity: 'high'
        });
      }
    }
    
    // 2. 检查缺失的功能
    const hasDocs = await this.fileExists(projectPath, 'docs');
    if (!hasDocs) {
      missing.push({
        type: 'feature',
        name: '文档',
        severity: 'medium'
      });
    }
    
    const hasTests = await this.fileExists(projectPath, 'tests');
    if (!hasTests) {
      missing.push({
        type: 'feature',
        name: '测试',
        severity: 'high'
      });
    }
    
    // 3. 检查缺失的配置
    const hasCI = await this.fileExists(projectPath, '.github/workflows');
    if (!hasCI) {
      missing.push({
        type: 'config',
        name: 'CI/CD配置',
        severity: 'low'
      });
    }
    
    return missing;
  }
  
  generateSuggestions(analysis) {
    const suggestions = [];
    
    // 基于进度的建议
    if (analysis.progress.completionRate < 50) {
      suggestions.push({
        type: 'progress',
        priority: 'high',
        message: `项目完成度${analysis.progress.completionRate}%，建议优先完成核心功能`
      });
    }
    
    // 基于质量的建议
    if (analysis.quality.syntaxErrors.length > 0) {
      suggestions.push({
        type: 'quality',
        priority: 'critical',
        message: `发现${analysis.quality.syntaxErrors.length}个语法错误，建议立即修复`
      });
    }
    
    if (analysis.quality.score < 60) {
      suggestions.push({
        type: 'quality',
        priority: 'high',
        message: `代码质量分数${analysis.quality.score}，建议进行代码重构`
      });
    }
    
    // 基于问题的建议
    if (analysis.issues.length > 0) {
      const critical = analysis.issues.filter(i => i.severity === 'critical');
      if (critical.length > 0) {
        suggestions.push({
          type: 'issue',
          priority: 'critical',
          message: `发现${critical.length}个严重问题，建议立即处理`
        });
      }
    }
    
    // 基于缺失的建议
    const missingTests = analysis.missing.find(m => m.name === '测试');
    if (missingTests) {
      suggestions.push({
        type: 'missing',
        priority: 'high',
        message: '项目缺少测试，建议添加单元测试和集成测试'
      });
    }
    
    return suggestions;
  }
}
```

### 2. 智能启动流程

```javascript
// src/orchestrator/Orchestrator.js
class Orchestrator {
  async develop(requirement, options = {}) {
    // 1. 自动扫描和分析
    console.log('\n🔍 扫描当前目录...\n');
    
    const analyzer = new ProjectAnalyzer();
    const basicContext = await analyzer.analyze('.');
    
    if (basicContext.isExisting) {
      // 2. 深度分析
      console.log('✓ 检测到现有项目\n');
      const deepAnalysis = await analyzer.deepAnalyze('.');
      
      // 3. 显示分析报告
      this.displayAnalysisReport(deepAnalysis);
      
      // 4. 询问用户意图
      const action = await this.askUserAction(deepAnalysis);
      
      // 5. 根据用户选择执行
      if (action === 'fix') {
        return await this.fixIssues(deepAnalysis);
      } else if (action === 'new') {
        return await this.addFeature(requirement, deepAnalysis);
      } else if (action === 'refactor') {
        return await this.refactorCode(deepAnalysis);
      }
    } else {
      // 新项目模式
      console.log('✓ 新项目模式\n');
      return await this.createNewProject(requirement);
    }
  }
  
  displayAnalysisReport(analysis) {
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║                    项目分析报告                           ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');
    
    // 基础信息
    console.log('📊 基础信息:');
    console.log(`  项目类型: ${analysis.basic.type}`);
    console.log(`  技术栈: ${Object.values(analysis.basic.techStack).join(', ')}`);
    console.log(`  代码规模: ${analysis.basic.fileCount}个文件, ${analysis.basic.lineCount}行代码\n`);
    
    // 开发进度
    console.log('📈 开发进度:');
    console.log(`  完成度: ${analysis.progress.completionRate}%`);
    console.log(`  已完成: ${analysis.progress.completedModules.length}个模块`);
    console.log(`  进行中: ${analysis.progress.inProgressModules.length}个模块`);
    console.log(`  待开发: ${analysis.progress.todoModules.length}个模块\n`);
    
    // 代码质量
    console.log('✨ 代码质量:');
    console.log(`  质量分数: ${analysis.quality.score}/100`);
    if (analysis.quality.syntaxErrors.length > 0) {
      console.log(`  ⚠️  语法错误: ${analysis.quality.syntaxErrors.length}个`);
    }
    if (analysis.quality.typeErrors.length > 0) {
      console.log(`  ⚠️  类型错误: ${analysis.quality.typeErrors.length}个`);
    }
    if (analysis.quality.lintIssues.length > 0) {
      console.log(`  ⚠️  代码规范: ${analysis.quality.lintIssues.length}个问题`);
    }
    console.log();
    
    // 潜在问题
    if (analysis.issues.length > 0) {
      console.log('🐛 潜在问题:');
      const critical = analysis.issues.filter(i => i.severity === 'critical');
      const high = analysis.issues.filter(i => i.severity === 'high');
      const medium = analysis.issues.filter(i => i.severity === 'medium');
      
      if (critical.length > 0) {
        console.log(`  🔴 严重: ${critical.length}个`);
      }
      if (high.length > 0) {
        console.log(`  🟠 重要: ${high.length}个`);
      }
      if (medium.length > 0) {
        console.log(`  🟡 一般: ${medium.length}个`);
      }
      console.log();
    }
    
    // 缺失功能
    if (analysis.missing.length > 0) {
      console.log('📋 缺失内容:');
      analysis.missing.forEach(m => {
        const icon = m.severity === 'high' ? '🔴' : 
                     m.severity === 'medium' ? '🟡' : '⚪';
        console.log(`  ${icon} ${m.name}`);
      });
      console.log();
    }
    
    // 建议
    if (analysis.suggestions.length > 0) {
      console.log('💡 建议:');
      analysis.suggestions.forEach((s, i) => {
        const icon = s.priority === 'critical' ? '🔴' : 
                     s.priority === 'high' ? '🟠' : '🟡';
        console.log(`  ${i + 1}. ${icon} ${s.message}`);
      });
      console.log();
    }
  }
  
  async askUserAction(analysis) {
    const inquirer = require('inquirer');
    
    const choices = [
      { name: '🆕 添加新功能', value: 'new' },
      { name: '🐛 修复问题', value: 'fix' },
      { name: '♻️  重构代码', value: 'refactor' },
      { name: '📊 查看详细报告', value: 'detail' },
      { name: '❌ 退出', value: 'exit' }
    ];
    
    // 如果有严重问题，优先显示修复选项
    if (analysis.issues.some(i => i.severity === 'critical')) {
      choices.unshift({ 
        name: '🚨 立即修复严重问题（推荐）', 
        value: 'fix-critical' 
      });
    }
    
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: '你想做什么？',
        choices
      }
    ]);
    
    return action;
  }
  
  async fixIssues(analysis) {
    console.log('\n🔧 开始修复问题...\n');
    
    // 按优先级排序问题
    const sortedIssues = analysis.issues.sort((a, b) => {
      const priority = { critical: 3, high: 2, medium: 1, low: 0 };
      return priority[b.severity] - priority[a.severity];
    });
    
    // 逐个修复
    for (const issue of sortedIssues) {
      console.log(`\n修复: ${issue.message}`);
      
      // 使用AI生成修复方案
      const fix = await this.generateFix(issue);
      
      // 应用修复
      await this.applyFix(fix);
      
      console.log(`✓ 已修复\n`);
    }
    
    console.log('🎉 所有问题已修复！\n');
  }
}
```

---

## 输出示例

```bash
$ cd my-project
$ devteam dev "添加支付功能"

🔍 扫描当前目录...

✓ 检测到现有项目

🔍 正在深度分析项目...

╔═══════════════════════════════════════════════════════════╗
║                    项目分析报告                           ║
╚═══════════════════════════════════════════════════════════╝

📊 基础信息:
  项目类型: express
  技术栈: Express, React, PostgreSQL, TypeScript
  代码规模: 156个文件, 8,432行代码

📈 开发进度:
  完成度: 65%
  已完成: 8个模块
  进行中: 3个模块
  待开发: 2个模块

✨ 代码质量:
  质量分数: 78/100
  ⚠️  类型错误: 5个
  ⚠️  代码规范: 12个问题

🐛 潜在问题:
  🔴 严重: 2个
  🟠 重要: 5个
  🟡 一般: 8个

📋 缺失内容:
  🔴 测试
  🟡 API文档
  ⚪ CI/CD配置

💡 建议:
  1. 🔴 发现2个严重问题，建议立即处理
  2. 🟠 项目缺少测试，建议添加单元测试和集成测试
  3. 🟡 代码质量分数78，建议进行代码重构

你想做什么？
  🚨 立即修复严重问题（推荐）
❯ 🆕 添加新功能
  🐛 修复问题
  ♻️  重构代码
  📊 查看详细报告
  ❌ 退出
```

---

## 优势

1. **自动化** - 无需手动指定模式
2. **智能化** - 深度理解项目状态
3. **主动性** - 主动发现问题
4. **友好性** - 清晰的报告和建议

---

## 实现计划

### Phase 1: 基础分析（2小时）
- [ ] 增强ProjectAnalyzer
- [ ] 实现进度分析
- [ ] 实现质量检测

### Phase 2: 问题检测（2小时）
- [ ] 依赖检查
- [ ] 配置检查
- [ ] 代码检查

### Phase 3: 智能交互（1小时）
- [ ] 分析报告展示
- [ ] 用户意图询问
- [ ] 操作分发

### Phase 4: 问题修复（3小时）
- [ ] AI生成修复方案
- [ ] 自动应用修复
- [ ] 验证修复结果

**总计：8小时**

---

这个设计将使DevTeam CLI真正智能化！🚀
