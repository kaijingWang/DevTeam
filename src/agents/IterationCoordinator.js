const { Agent } = require('./base/Agent');
const { CodeValidator } = require('../utils/CodeValidator');

class IterationCoordinator extends Agent {
  constructor() {
    super('IterationCoordinator', '迭代协调器');
    this.maxIterations = 5; // 最大迭代次数
    this.currentIteration = 0;
  }

  getSystemPrompt() {
    return `你是一个迭代协调器，负责协调各个Agent进行迭代优化。

核心职责：
1. 分析测试结果和验证报告
2. 识别需要改进的问题
3. 分配任务给相应的Agent
4. 跟踪迭代进度
5. 判断是否达到完成标准

问题分类：
- Bug/错误 → Backend/Frontend Agent
- UI/样式问题 → UI Designer Agent
- 性能问题 → Architect Agent
- 测试失败 → QA Agent
- 文档问题 → PM Agent

完成标准：
- 所有测试通过
- 构建成功
- 无TypeScript错误
- 无ESLint错误
- UI符合设计规范

你的目标是协调团队完成高质量的项目。`;
  }

  async execute(input) {
    const { 
      requirement, 
      projectPath, 
      validationResult,
      testResult 
    } = input;
    
    console.log('\n🔄 开始迭代优化...\n');
    
    // 分析问题
    const issues = await this.analyzeIssues(validationResult, testResult);
    
    if (issues.length === 0) {
      console.log('✅ 没有发现问题，项目已完成！');
      return {
        success: true,
        iterations: this.currentIteration,
        message: '项目已完成'
      };
    }
    
    console.log(`📋 发现 ${issues.length} 个问题需要修复：\n`);
    issues.forEach((issue, index) => {
      console.log(`${index + 1}. [${issue.type}] ${issue.description}`);
    });
    
    // 检查迭代次数
    if (this.currentIteration >= this.maxIterations) {
      console.log(`\n⚠️  已达到最大迭代次数 (${this.maxIterations})，停止迭代`);
      return {
        success: false,
        iterations: this.currentIteration,
        remainingIssues: issues,
        message: '达到最大迭代次数'
      };
    }
    
    this.currentIteration++;
    console.log(`\n🔄 第 ${this.currentIteration}/${this.maxIterations} 次迭代\n`);
    
    // 分配任务并执行
    const results = await this.assignAndExecuteTasks(issues, input);
    
    return {
      success: results.every(r => r.success),
      iterations: this.currentIteration,
      results,
      message: `完成第 ${this.currentIteration} 次迭代`
    };
  }

  /**
   * 分析问题
   */
  async analyzeIssues(validationResult, testResult) {
    const issues = [];
    
    // 分析TypeScript错误
    if (validationResult?.typescript && !validationResult.typescript.success) {
      const errors = this.parseTypeScriptErrors(validationResult.typescript.errors);
      errors.forEach(error => {
        issues.push({
          type: 'typescript',
          severity: 'high',
          description: error.message,
          file: error.file,
          line: error.line,
          agent: this.determineResponsibleAgent(error.file)
        });
      });
    }
    
    // 分析构建错误
    if (validationResult?.build && !validationResult.build.success) {
      issues.push({
        type: 'build',
        severity: 'high',
        description: '构建失败',
        errors: validationResult.build.errors,
        agent: 'Frontend'
      });
    }
    
    // 分析测试失败
    if (testResult && !testResult.success) {
      testResult.failures.forEach(failure => {
        issues.push({
          type: 'test',
          severity: 'medium',
          description: failure.message,
          test: failure.test,
          agent: this.determineResponsibleAgent(failure.file)
        });
      });
    }
    
    // 分析ESLint警告
    if (validationResult?.eslint && validationResult.eslint.warnings) {
      const warnings = this.parseESLintWarnings(validationResult.eslint.warnings);
      warnings.forEach(warning => {
        if (warning.severity === 'error') {
          issues.push({
            type: 'eslint',
            severity: 'medium',
            description: warning.message,
            file: warning.file,
            line: warning.line,
            agent: this.determineResponsibleAgent(warning.file)
          });
        }
      });
    }
    
    return issues;
  }

  /**
   * 分配任务并执行
   */
  async assignAndExecuteTasks(issues, input) {
    const tasksByAgent = this.groupIssuesByAgent(issues);
    const results = [];
    
    for (const [agentName, agentIssues] of Object.entries(tasksByAgent)) {
      console.log(`\n📤 分配给 ${agentName} Agent: ${agentIssues.length} 个问题`);
      
      const result = await this.executeAgentTask(agentName, agentIssues, input);
      results.push(result);
      
      if (result.success) {
        console.log(`✅ ${agentName} Agent 完成修复`);
      } else {
        console.log(`❌ ${agentName} Agent 修复失败: ${result.error}`);
      }
    }
    
    return results;
  }

  /**
   * 执行Agent任务
   */
  async executeAgentTask(agentName, issues, input) {
    try {
      const Agent = this.loadAgent(agentName);
      const agent = new Agent();
      
      const taskInput = {
        ...input,
        issues,
        mode: 'fix',
        instruction: this.generateFixInstruction(issues)
      };
      
      const result = await agent.execute(taskInput);
      
      return {
        agent: agentName,
        success: true,
        result
      };
    } catch (error) {
      return {
        agent: agentName,
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 生成修复指令
   */
  generateFixInstruction(issues) {
    const instruction = `请修复以下问题：

${issues.map((issue, index) => `
${index + 1}. [${issue.type}] ${issue.description}
   文件: ${issue.file || '未知'}
   ${issue.line ? `行号: ${issue.line}` : ''}
`).join('\n')}

修复要求：
- 只修复列出的问题
- 不要改变其他功能
- 确保修复后代码可以运行
- 保持代码风格一致

请生成修复后的完整文件内容。`;

    return instruction;
  }

  /**
   * 按Agent分组问题
   */
  groupIssuesByAgent(issues) {
    const groups = {};
    
    issues.forEach(issue => {
      const agent = issue.agent || 'Frontend';
      if (!groups[agent]) {
        groups[agent] = [];
      }
      groups[agent].push(issue);
    });
    
    return groups;
  }

  /**
   * 确定负责的Agent
   */
  determineResponsibleAgent(filePath) {
    if (!filePath) return 'Frontend';
    
    if (filePath.includes('/components/') || filePath.includes('/pages/')) {
      return 'Frontend';
    }
    if (filePath.includes('/store/')) {
      return 'Frontend';
    }
    if (filePath.includes('/controllers/') || filePath.includes('/services/')) {
      return 'Backend';
    }
    if (filePath.includes('/tests/')) {
      return 'QA';
    }
    if (filePath.includes('.css') || filePath.includes('tailwind')) {
      return 'UIDesigner';
    }
    
    return 'Frontend';
  }

  /**
   * 加载Agent
   */
  loadAgent(agentName) {
    const agentMap = {
      'Frontend': require('./FrontendAgent-v2').FrontendAgent,
      'Backend': require('./BackendAgent-v2').BackendAgent,
      'UIDesigner': require('./UIDesignerAgent-v2').UIDesignerAgent,
      'QA': require('./QAAgent-v2').QAAgent,
      'PM': require('./PMAgent-v2').PMAgent,
      'Architect': require('./ArchitectAgent-v2').ArchitectAgent
    };
    
    return agentMap[agentName] || agentMap['Frontend'];
  }

  /**
   * 解析TypeScript错误
   */
  parseTypeScriptErrors(errors) {
    if (!errors) return [];
    
    const errorRegex = /(.+?)\((\d+),(\d+)\): error TS\d+: (.+)/g;
    const parsed = [];
    let match;
    
    while ((match = errorRegex.exec(errors)) !== null) {
      parsed.push({
        file: match[1],
        line: parseInt(match[2]),
        column: parseInt(match[3]),
        message: match[4]
      });
    }
    
    return parsed;
  }

  /**
   * 解析ESLint警告
   */
  parseESLintWarnings(warnings) {
    if (!warnings) return [];
    
    // 简化的解析，实际可能需要更复杂的逻辑
    const lines = warnings.split('\n');
    const parsed = [];
    
    lines.forEach(line => {
      const match = line.match(/(.+?):(\d+):(\d+): (.+?) \[(.+?)\]/);
      if (match) {
        parsed.push({
          file: match[1],
          line: parseInt(match[2]),
          column: parseInt(match[3]),
          message: match[4],
          rule: match[5],
          severity: line.includes('error') ? 'error' : 'warning'
        });
      }
    });
    
    return parsed;
  }
}

module.exports = { IterationCoordinator };
