const { PMAgent } = require('../agents/PMAgent');
const { ArchitectAgent } = require('../agents/ArchitectAgent');
const { UIDesignerAgent } = require('../agents/UIDesignerAgent');
const { APIDesignerAgent } = require('../agents/APIDesignerAgent');
const { BackendAgent } = require('../agents/BackendAgent');
const { FrontendAgent } = require('../agents/FrontendAgent');
const { QAAgent } = require('../agents/QAAgent');
const { GitAgent } = require('../agents/GitAgent');
const { InteractiveController } = require('../interactive/InteractiveController');
const { MemoryStore } = require('../memory/MemoryStore');
const { WorkflowStateManager } = require('../state/WorkflowStateManager');
const { ProjectAnalyzer } = require('../analyzer/ProjectAnalyzer');
const { DeepAnalyzer } = require('../analyzer/DeepAnalyzer');

class Orchestrator {
  constructor(mode = 'auto', options = {}) {
    this.mode = mode;
    this.sessionId = this.generateSessionId();
    this.interactive = new InteractiveController();
    this.memory = new MemoryStore(this.sessionId);
    this.stateManager = null;
    this.isIncremental = options.incremental || false;
    this.projectContext = null;
    
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
  }

  async develop(requirement, options = {}) {
    this.stateManager = new WorkflowStateManager(this.sessionId, requirement);
    
    const startTime = Date.now();
    const results = {};

    try {
      // 分析项目（增量模式）
      if (this.isIncremental || options.incremental) {
        console.log('\n🔍 分析现有项目...\n');
        const analyzer = new ProjectAnalyzer();
        this.projectContext = await analyzer.analyze(options.projectPath || '.');
        
        if (this.projectContext.isExisting) {
          console.log('\n' + analyzer.formatContext(this.projectContext) + '\n');
          
          // 设置所有Agent为增量模式
          Object.values(this.agents).forEach(agent => {
            if (agent.setIncrementalMode) {
              agent.setIncrementalMode(this.projectContext);
            }
          });
        } else {
          console.log('⚠️  未检测到现有项目，切换到新项目模式\n');
          this.isIncremental = false;
        }
      }
      
      // 检查是否可以恢复
      if (this.stateManager.canResume()) {
        const shouldResume = await this.askToResume();
        if (shouldResume) {
          return await this.resume();
        }
      }

      // Step 1: PM
      await this.runStep('pm', 'PM', '产品经理分析需求', async () => {
        results.pm = await this.agents.pm.execute({ requirement });
        this.memory.add({
          type: 'agent',
          agent: 'pm',
          content: results.pm
        });
        return results.pm;
      }, results);

      // Step 2: Architect
      await this.runStep('architect', 'Architect', '架构师设计技术方案', async () => {
        results.architect = await this.agents.architect.execute({
          prd: results.pm.prd
        });
        this.memory.add({
          type: 'agent',
          agent: 'architect',
          content: results.architect
        });
        return results.architect;
      }, results);

      // Step 3: UI Designer
      await this.runStep('ui', 'UIDesigner', 'UI设计师设计界面', async () => {
        results.ui = await this.agents.ui.execute({
          prd: results.pm.prd
        });
        this.memory.add({
          type: 'agent',
          agent: 'ui',
          content: results.ui
        });
        return results.ui;
      }, results);

      // Step 4: API Designer
      await this.runStep('api', 'APIDesigner', '接口设计师设计API', async () => {
        results.api = await this.agents.api.execute({
          techDoc: results.architect.techDoc
        });
        this.memory.add({
          type: 'agent',
          agent: 'api',
          content: results.api
        });
        return results.api;
      }, results);

      // Step 5-6: Backend & Frontend (并行)
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('👨‍💻 Step 5-6/8: 开发团队编写代码（并行）');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      console.log('  后端工程师开发中...');
      console.log('  前端工程师开发中...');
      
      const [backendResult, frontendResult] = await Promise.all([
        this.agents.backend.execute({
          apiDoc: results.api.apiDoc,
          techDoc: results.architect.techDoc
        }),
        this.agents.frontend.execute({
          apiDoc: results.api.apiDoc
        })
      ]);
      
      results.backend = backendResult;
      results.frontend = frontendResult;
      
      this.memory.add({ type: 'agent', agent: 'backend', content: results.backend });
      this.memory.add({ type: 'agent', agent: 'frontend', content: results.frontend });
      
      console.log(`✅ 后端代码已生成: ${results.backend.files.length}个文件`);
      console.log(`✅ 前端代码已生成: ${results.frontend.files.length}个文件\n`);

      if (this.mode === 'interactive') {
        const action = await this.interactive.askToContinue({
          preview: `后端: ${results.backend.files.length}个文件\n前端: ${results.frontend.files.length}个文件`
        });
        if (action === 'quit') {
          this.pause();
          return;
        }
      }

      // Step 7: QA
      await this.runStep('qa', 'QA', '测试工程师编写测试', async () => {
        results.qa = await this.agents.qa.execute({
          apiDoc: results.api.apiDoc
        });
        this.memory.add({
          type: 'agent',
          agent: 'qa',
          content: results.qa
        });
        return results.qa;
      }, results);

      // Step 8: Git
      await this.runStep('git', 'Git', 'Git管理代码', async () => {
        results.git = await this.agents.git.execute({
          requirement
        });
        this.memory.add({
          type: 'agent',
          agent: 'git',
          content: results.git
        });
        return results.git;
      }, results);

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

  async runStep(agentKey, agentName, stepName, executor, results) {
    this.interactive.step++;
    this.stateManager.nextStep(agentName);
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📋 Step ${this.interactive.step}/${this.interactive.totalSteps}: ${stepName}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // 创建检查点
    const checkpointId = this.stateManager.createCheckpoint(agentName, results);
    
    // 执行
    const result = await executor();
    
    // 保存输出
    this.stateManager.saveOutput(agentName, agentName, result);
    
    console.log(`✅ ${stepName}完成\n`);
    
    // 交互式模式
    if (this.mode === 'interactive') {
      const action = await this.interactive.askToContinue({
        preview: result.summary || '已完成'
      });
      
      if (action === 'quit') {
        this.pause();
        throw new Error('用户退出');
      } else if (action === 'regenerate') {
        return await this.runStep(agentKey, agentName, stepName, executor, results);
      }
    }
    
    return result;
  }

  async askToResume() {
    const state = this.stateManager.getState();
    
    console.log('\n⚠️  发现未完成的会话\n');
    console.log(`需求: ${state.requirement}`);
    console.log(`进度: ${state.currentStep}/${state.totalSteps}`);
    console.log(`当前Agent: ${state.currentAgent}\n`);
    
    return await this.interactive.confirmAction('是否继续之前的会话？');
  }

  async resume() {
    console.log('\n🔄 恢复会话...\n');
    
    const state = this.stateManager.getState();
    this.stateManager.updateStatus('running');
    
    console.log('✅ 已完成的步骤：\n');
    Object.entries(state.outputs).forEach(([step, output]) => {
      console.log(`  ${step}: ${output.agent}`);
    });
    console.log();
    
    // 从当前步骤继续
    // TODO: 实现恢复逻辑
    console.log('恢复功能开发中...');
  }

  pause() {
    this.stateManager.updateStatus('paused');
    console.log('\n⏸️  工作流已暂停');
    console.log(`会话ID: ${this.sessionId}`);
    console.log('使用 devteam resume 继续\n');
  }

  printSummary(results, duration) {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 开发完成！');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📊 生成文件：\n');
    console.log('  📄 文档：');
    console.log('    - docs/PRD.md (需求文档)');
    console.log('    - docs/TECH.md (技术方案)');
    console.log('    - docs/API.md (API文档)');
    console.log('    - design/DESIGN.md (设计文档)');
    
    console.log('\n  💻 代码：');
    console.log(`    - 后端：${results.backend.files.length}个文件`);
    console.log(`    - 前端：${results.frontend.files.length}个文件`);
    console.log(`    - 测试：${results.qa.files.length}个文件`);
    
    console.log(`\n  📦 版本管理：`);
    console.log(`    - Git仓库已初始化`);
    console.log(`    - 提交信息：${results.git.commitMessage}`);
    
    console.log(`\n⏱️  总耗时：${duration}秒`);
    console.log(`📈 预计测试覆盖率：${results.qa.coverage}`);
    console.log(`💾 会话ID：${this.sessionId}\n`);
    
    console.log('💡 下一步：');
    console.log('  1. cd devteam-workspace');
    console.log('  2. npm install');
    console.log('  3. npm run dev');
    console.log();
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  displayAnalysisReport(analysis) {
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║                    项目分析报告                           ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');
    
    // 基础信息
    if (analysis.basic) {
      console.log('📊 基础信息:');
      console.log(`  项目类型: ${analysis.basic.type}`);
      const techStack = Object.values(analysis.basic.techStack).join(', ');
      if (techStack) {
        console.log(`  技术栈: ${techStack}`);
      }
      console.log(`  代码规模: ${analysis.basic.fileCount}个文件, ${analysis.basic.lineCount}行代码\n`);
    }
    
    // 开发进度
    if (analysis.progress) {
      console.log('📈 开发进度:');
      console.log(`  完成度: ${analysis.progress.completionRate}%`);
      console.log(`  已完成: ${analysis.progress.completedModules.length}个模块`);
      if (analysis.progress.todoModules.length > 0) {
        console.log(`  待开发: ${analysis.progress.todoModules.length}个TODO\n`);
      } else {
        console.log();
      }
    }
    
    // 代码质量
    if (analysis.quality) {
      console.log('✨ 代码质量:');
      console.log(`  质量分数: ${analysis.quality.score}/100`);
      if (analysis.quality.lintIssues.length > 0) {
        console.log(`  ⚠️  代码规范: ${analysis.quality.lintIssues.length}个问题`);
      }
      if (analysis.quality.securityIssues.length > 0) {
        console.log(`  ⚠️  安全问题: ${analysis.quality.securityIssues.length}个`);
      }
      console.log();
    }
    
    // 潜在问题
    if (analysis.issues && analysis.issues.length > 0) {
      console.log('🐛 潜在问题:');
      const critical = analysis.issues.filter(i => i.severity === 'critical');
      const high = analysis.issues.filter(i => i.severity === 'high');
      const medium = analysis.issues.filter(i => i.severity === 'medium');
      
      if (critical.length > 0) {
        console.log(`  🔴 严重: ${critical.length}个`);
        critical.slice(0, 3).forEach(i => {
          console.log(`     - ${i.message}`);
        });
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
    if (analysis.missing && analysis.missing.length > 0) {
      console.log('📋 缺失内容:');
      analysis.missing.slice(0, 5).forEach(m => {
        const icon = m.severity === 'high' ? '🔴' : 
                     m.severity === 'medium' ? '🟡' : '⚪';
        console.log(`  ${icon} ${m.name}`);
      });
      console.log();
    }
    
    // 建议
    if (analysis.suggestions && analysis.suggestions.length > 0) {
      console.log('💡 建议:');
      analysis.suggestions.slice(0, 5).forEach((s, i) => {
        const icon = s.priority === 'critical' ? '🔴' : 
                     s.priority === 'high' ? '🟠' : '🟡';
        console.log(`  ${i + 1}. ${icon} ${s.message}`);
      });
      console.log();
    }
  }
}

module.exports = { Orchestrator };
