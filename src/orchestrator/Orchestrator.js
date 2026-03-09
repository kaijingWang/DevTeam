const { PMAgent } = require('../agents/PMAgent');
const { ArchitectAgent } = require('../agents/ArchitectAgent');
const { UIDesignerAgent } = require('../agents/UIDesignerAgent');
const { APIDesignerAgent } = require('../agents/APIDesignerAgent');
const { BackendAgent } = require('../agents/BackendAgent');
const { FrontendAgent } = require('../agents/FrontendAgent');
const { QAAgent } = require('../agents/QAAgent');
const { GitAgent } = require('../agents/GitAgent');

class Orchestrator {
  constructor() {
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
    const startTime = Date.now();
    const results = {};

    try {
      // Step 1: PM分析需求
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📋 Step 1/8: 产品经理分析需求');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      results.pm = await this.agents.pm.execute({ requirement });
      console.log('✅ 需求文档已生成: docs/PRD.md\n');

      // Step 2: 架构师设计方案
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🏗️  Step 2/8: 架构师设计技术方案');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      results.architect = await this.agents.architect.execute({
        prd: results.pm.prd
      });
      console.log('✅ 技术方案已生成: docs/TECH.md\n');

      // Step 3: UI设计
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🎨 Step 3/8: UI设计师设计界面');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      results.ui = await this.agents.ui.execute({
        prd: results.pm.prd
      });
      console.log('✅ 设计文档已生成: design/DESIGN.md\n');

      // Step 4: API设计
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📡 Step 4/8: 接口设计师设计API');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      results.api = await this.agents.api.execute({
        techDoc: results.architect.techDoc
      });
      console.log('✅ API文档已生成: docs/API.md\n');

      // Step 5 & 6: 并行开发后端和前端
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
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
      
      console.log(`✅ 后端代码已生成: ${results.backend.files.length}个文件`);
      console.log(`✅ 前端代码已生成: ${results.frontend.files.length}个文件\n`);

      // Step 7: 测试
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🧪 Step 7/8: 测试工程师编写测试');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      results.qa = await this.agents.qa.execute({
        apiDoc: results.api.apiDoc
      });
      console.log(`✅ 测试代码已生成: ${results.qa.files.length}个文件`);
      console.log(`   ${results.qa.coverage}\n`);

      // Step 8: Git管理
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📦 Step 8/8: Git管理代码');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      results.git = await this.agents.git.execute({
        requirement
      });
      console.log(`✅ ${results.git.summary}\n`);

      // 总结
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      this.printSummary(results, duration);

      return results;

    } catch (error) {
      console.error('\n❌ 错误:', error.message);
      throw error;
    }
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
    console.log(`📈 预计测试覆盖率：${results.qa.coverage}\n`);
    
    console.log('💡 下一步：');
    console.log('  1. cd devteam-workspace');
    console.log('  2. npm install');
    console.log('  3. npm run dev');
    console.log();
  }
}

module.exports = { Orchestrator };
