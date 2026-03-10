const { PMAgent } = require('../agents/PMAgent');
const { ArchitectAgent } = require('../agents/ArchitectAgent');
const { UIDesignerAgent } = require('../agents/UIDesignerAgent');
const { APIDesignerAgent } = require('../agents/APIDesignerAgent');
const { BackendAgent } = require('../agents/BackendAgent');
const { FrontendAgent } = require('../agents/FrontendAgent');
const { QAAgent } = require('../agents/QAAgent');
const { GitAgent } = require('../agents/GitAgent');
const { ParallelExecutor } = require('./ParallelExecutor');
const { InteractiveController } = require('../interactive/InteractiveController');
const { MemoryStore } = require('../memory/MemoryStore');
const { WorkflowStateManager } = require('../state/WorkflowStateManager');

class OrchestratorV3 {
  constructor(mode = 'auto', options = {}) {
    this.mode = mode;
    this.sessionId = this.generateSessionId();
    this.interactive = new InteractiveController();
    this.memory = new MemoryStore(this.sessionId);
    this.stateManager = null;
    this.parallelExecutor = new ParallelExecutor();
    this.enableParallel = options.parallel !== false; // 默认启用并行
    
    this.agents = {
      pm: new PMAgent(),
      architect: new ArchitectAgent(),
      ui: new UIDesignerAgent(),
      api: new APIDesignerAgent(),
      backend: new BackendAgent(),
      frontend: new FrontendAgent(),
      qa: new QAAgent(),
      git: new GitAgent()
    };
    
    // Agent名称映射
    this.agentNames = {
      pm: 'PM Agent',
      architect: 'Architect Agent',
      ui: 'UI Designer Agent',
      api: 'API Designer Agent',
      backend: 'Backend Agent',
      frontend: 'Frontend Agent',
      qa: 'QA Agent',
      git: 'Git Agent'
    };
  }

  async develop(requirement, options = {}) {
    this.stateManager = new WorkflowStateManager(this.sessionId, requirement);
    
    const startTime = Date.now();
    const results = {};

    try {
      console.log('\n╔═══════════════════════════════════════════════════════════╗');
      console.log('║            DevTeam CLI v3.0 - 并行执行模式               ║');
      console.log('╚═══════════════════════════════════════════════════════════╝\n');
      
      if (this.enableParallel) {
        console.log('🚀 并行执行模式已启用\n');
        await this.developParallel(requirement, results);
      } else {
        console.log('🔄 顺序执行模式\n');
        await this.developSequential(requirement, results);
      }
      
      // 完成
      this.stateManager.updateStatus('completed');
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      this.printSummary(results, duration);

      return results;

    } catch (error) {
      this.stateManager.updateStatus('failed');
      console.error('\n❌ 错误:', error.message);
      throw error;
    }
  }

  /**
   * 并行执行模式
   */
  async developParallel(requirement, results) {
    // 获取执行分组
    const groups = this.parallelExecutor.getExecutionGroups();
    
    console.log('📊 执行计划：\n');
    groups.forEach((group, index) => {
      const agentNames = group.map(key => this.agentNames[key]).join(', ');
      console.log(`  第${index + 1}组: ${agentNames}`);
    });
    console.log();
    
    // 逐组执行
    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      
      console.log('━'.repeat(60));
      console.log(`📋 第${i + 1}/${groups.length}组: ${group.map(k => this.agentNames[k]).join(', ')}`);
      console.log('━'.repeat(60));
      
      // 并行执行当前组
      await this.parallelExecutor.executeGroup(
        group,
        this.agents,
        (agentKey, prevResults) => this.getInputForAgent(agentKey, prevResults, requirement)
      );
      
      // 保存结果
      group.forEach(agentKey => {
        results[agentKey] = this.parallelExecutor.results[agentKey];
        this.memory.add({
          type: 'agent',
          agent: agentKey,
          content: results[agentKey]
        });
      });
      
      // 显示进度
      const stats = this.parallelExecutor.getStats();
      console.log(`\n📈 进度: ${stats.completed}/${stats.total} 完成\n`);
      
      // 交互式确认
      if (this.mode === 'interactive' && i < groups.length - 1) {
        const shouldContinue = await this.interactive.confirmAction('继续下一组？');
        if (!shouldContinue) {
          throw new Error('用户取消');
        }
      }
    }
  }

  /**
   * 顺序执行模式（兼容旧版）
   */
  async developSequential(requirement, results) {
    const steps = [
      { key: 'pm', name: 'PM Agent', desc: '产品经理分析需求' },
      { key: 'architect', name: 'Architect Agent', desc: '架构师设计技术方案' },
      { key: 'ui', name: 'UI Designer Agent', desc: 'UI设计师设计界面' },
      { key: 'api', name: 'API Designer Agent', desc: '接口设计师设计API' },
      { key: 'backend', name: 'Backend Agent', desc: '后端工程师开发' },
      { key: 'frontend', name: 'Frontend Agent', desc: '前端工程师开发' },
      { key: 'qa', name: 'QA Agent', desc: '测试工程师编写测试' },
      { key: 'git', name: 'Git Agent', desc: 'Git管理代码' }
    ];
    
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      
      console.log('━'.repeat(60));
      console.log(`📋 Step ${i + 1}/${steps.length}: ${step.desc}`);
      console.log('━'.repeat(60) + '\n');
      
      const input = this.getInputForAgent(step.key, results, requirement);
      results[step.key] = await this.agents[step.key].execute(input);
      
      this.memory.add({
        type: 'agent',
        agent: step.key,
        content: results[step.key]
      });
      
      console.log(`\n✅ ${step.desc}完成\n`);
    }
  }

  /**
   * 获取Agent输入
   */
  getInputForAgent(agentKey, results, requirement) {
    switch (agentKey) {
      case 'pm':
        return { requirement };
      
      case 'architect':
        return {
          requirement,
          prd: results.pm?.prd || ''
        };
      
      case 'ui':
        return {
          requirement,
          prd: results.pm?.prd || ''
        };
      
      case 'api':
        return {
          requirement,
          techDoc: results.architect?.techDoc || '',
          architecture: results.architect?.architecture || ''
        };
      
      case 'backend':
        return {
          requirement,
          apiDoc: results.api?.apiDoc || '',
          techDoc: results.architect?.techDoc || '',
          architecture: results.architect?.architecture || ''
        };
      
      case 'frontend':
        return {
          requirement,
          apiDoc: results.api?.apiDoc || '',
          design: results.ui?.design || '',
          uiDesign: results.ui?.uiDesign || ''
        };
      
      case 'qa':
        return {
          requirement,
          apiDoc: results.api?.apiDoc || '',
          architecture: results.architect?.architecture || '',
          code: {
            backend: results.backend?.code || '',
            frontend: results.frontend?.code || ''
          }
        };
      
      case 'git':
        return {
          requirement,
          allResults: results
        };
      
      default:
        return { requirement };
    }
  }

  printSummary(results, duration) {
    console.log('\n' + '═'.repeat(60));
    console.log('🎉 开发完成！');
    console.log('═'.repeat(60) + '\n');

    console.log('📊 执行统计：\n');
    
    const stats = this.parallelExecutor.getStats();
    console.log(`  总Agent数: ${stats.total}`);
    console.log(`  成功: ${stats.completed}`);
    console.log(`  失败: ${stats.failed}`);
    console.log(`  总耗时: ${duration}秒`);
    
    if (this.enableParallel) {
      const groups = this.parallelExecutor.getExecutionGroups();
      console.log(`  并行组数: ${groups.length}`);
      console.log(`  理论加速: ${(stats.total / groups.length).toFixed(1)}x`);
    }

    console.log('\n📄 生成文件：\n');
    console.log('  文档：');
    console.log('    - docs/PRD.md (需求文档)');
    console.log('    - docs/ARCHITECTURE.md (技术方案)');
    console.log('    - docs/API.md (API文档)');
    console.log('    - design/UI-DESIGN.md (设计文档)');
    
    if (results.backend?.files) {
      console.log('\n  后端代码：');
      console.log(`    - ${results.backend.files.length}个文件`);
    }
    
    if (results.frontend?.files) {
      console.log('\n  前端代码：');
      console.log(`    - ${results.frontend.files.length}个文件`);
    }
    
    if (results.qa?.files) {
      console.log('\n  测试代码：');
      console.log(`    - ${results.qa.files.length}个文件`);
    }
    
    console.log('\n💡 下一步：');
    console.log('  1. cd devteam-workspace');
    console.log('  2. npm install');
    console.log('  3. npm run dev');
    console.log();
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = { OrchestratorV3 };
