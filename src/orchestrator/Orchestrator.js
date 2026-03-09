const { PMAgent } = require('../agents/PMAgent');
const { ArchitectAgent } = require('../agents/ArchitectAgent');
const { APIDesignerAgent } = require('../agents/APIDesignerAgent');
const { BackendAgent } = require('../agents/BackendAgent');
const { FrontendAgent } = require('../agents/FrontendAgent');

class Orchestrator {
  constructor() {
    this.agents = {
      pm: new PMAgent(),
      architect: new ArchitectAgent(),
      api: new APIDesignerAgent(),
      backend: new BackendAgent(),
      frontend: new FrontendAgent()
    };
  }

  async develop(requirement, options = {}) {
    const startTime = Date.now();
    const results = {};

    try {
      // Step 1: PM分析需求
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📋 Step 1/5: 产品经理分析需求');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      results.pm = await this.agents.pm.execute({ requirement });
      console.log('✅ 需求文档已生成: docs/PRD.md\n');

      // Step 2: 架构师设计方案
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🏗️  Step 2/5: 架构师设计技术方案');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      results.architect = await this.agents.architect.execute({
        prd: results.pm.prd
      });
      console.log('✅ 技术方案已生成: docs/TECH.md\n');

      // Step 3: API设计
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📡 Step 3/5: 接口设计师设计API');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      results.api = await this.agents.api.execute({
        techDoc: results.architect.techDoc
      });
      console.log('✅ API文档已生成: docs/API.md\n');

      // Step 4: 后端开发
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('👨‍💻 Step 4/5: 后端工程师开发代码');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      results.backend = await this.agents.backend.execute({
        apiDoc: results.api.apiDoc,
        techDoc: results.architect.techDoc
      });
      console.log(`✅ 后端代码已生成: ${results.backend.files.length}个文件\n`);

      // Step 5: 前端开发
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🎨 Step 5/5: 前端工程师开发界面');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      results.frontend = await this.agents.frontend.execute({
        apiDoc: results.api.apiDoc
      });
      console.log(`✅ 前端代码已生成: ${results.frontend.files.length}个文件\n`);

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
    console.log('    - docs/PRD.md');
    console.log('    - docs/TECH.md');
    console.log('    - docs/API.md');
    
    console.log('\n  💻 代码：');
    console.log(`    - 后端：${results.backend.files.length}个文件`);
    console.log(`    - 前端：${results.frontend.files.length}个文件`);
    
    console.log(`\n⏱️  总耗时：${duration}秒\n`);
    
    console.log('💡 下一步：');
    console.log('  1. 查看生成的文档和代码');
    console.log('  2. 安装依赖：npm install');
    console.log('  3. 启动开发服务器');
    console.log();
  }
}

module.exports = { Orchestrator };
