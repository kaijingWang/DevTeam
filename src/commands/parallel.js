const { Command } = require('commander');
const { OrchestratorV3 } = require('../orchestrator/OrchestratorV3');
const { CodeFixer } = require('../utils/CodeFixer');
const { CodeValidator } = require('../utils/CodeValidator');
const path = require('path');

function createParallelCommand() {
  const parallelCommand = new Command('parallel')
    .description('并行开发（多Agent同时执行）')
    .argument('<requirement>', '需求描述')
    .option('--no-parallel', '禁用并行（顺序执行）')
    .option('--fix', '生成后自动修复', true)
    .option('--validate', '生成后自动验证', true)
    .option('--no-fix', '不自动修复')
    .option('--no-validate', '不自动验证')
    .action(async (requirement, options) => {
      console.log('\n🚀 DevTeam CLI v3.0 - 并行执行模式\n');
      
      const orchestrator = new OrchestratorV3('auto', {
        parallel: options.parallel
      });
      const workspacePath = path.join(process.cwd(), 'devteam-workspace');
      
      const startTime = Date.now();
      
      try {
        // 1. 并行生成代码
        console.log('📝 Step 1/3: 并行生成代码\n');
        await orchestrator.develop(requirement);
        
        const generateTime = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`⏱️  代码生成耗时: ${generateTime}秒\n`);
        
        // 2. 自动修复
        if (options.fix) {
          console.log('🔧 Step 2/3: 自动修复\n');
          const fixStartTime = Date.now();
          
          const fixer = new CodeFixer(workspacePath);
          await fixer.fixAll();
          
          const fixTime = ((Date.now() - fixStartTime) / 1000).toFixed(1);
          console.log(`⏱️  修复耗时: ${fixTime}秒\n`);
        } else {
          console.log('⏭️  Step 2/3: 跳过自动修复\n');
        }
        
        // 3. 代码验证
        if (options.validate) {
          console.log('✅ Step 3/3: 代码验证\n');
          const validateStartTime = Date.now();
          
          const validator = new CodeValidator(workspacePath);
          const result = await validator.validateAll();
          
          const validateTime = ((Date.now() - validateStartTime) / 1000).toFixed(1);
          console.log(`⏱️  验证耗时: ${validateTime}秒\n`);
          
          if (!result.success) {
            console.log('⚠️  代码验证失败，但项目已生成。');
            console.log('💡 提示：运行以下命令手动修复：');
            console.log('   cd devteam-workspace');
            console.log('   npm install');
            console.log('   npm run build');
          }
        } else {
          console.log('⏭️  Step 3/3: 跳过代码验证\n');
        }
        
        // 总结
        const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
        
        console.log('\n' + '='.repeat(60));
        console.log('🎉 项目生成成功！');
        console.log('='.repeat(60));
        console.log(`\n⏱️  总耗时: ${totalTime}秒`);
        
        if (options.parallel) {
          console.log('🚀 并行执行模式已启用');
          console.log('💡 提示：并行执行可以显著提升速度');
        }
        
        console.log('\n📂 项目位置：devteam-workspace/');
        console.log('\n🚀 快速开始：');
        console.log('   cd devteam-workspace');
        console.log('   npm install');
        console.log('   npm run dev');
        console.log('\n📦 构建生产版本：');
        console.log('   npm run build');
        console.log('   npm run preview');
        console.log('\n📚 查看文档：');
        console.log('   docs/PRD.md           - 产品需求文档');
        console.log('   docs/ARCHITECTURE.md  - 技术架构文档');
        console.log('   docs/API.md           - API文档');
        console.log('   design/UI-DESIGN.md   - UI设计文档');
        console.log('\n');
        
      } catch (error) {
        console.error('\n❌ 错误：', error.message);
        console.error('\n💡 提示：');
        console.error('   1. 检查API配置是否正确');
        console.error('   2. 检查网络连接');
        console.error('   3. 查看详细日志');
        console.error('   4. 尝试使用 --no-parallel 禁用并行');
        process.exit(1);
      }
    });
    
  return parallelCommand;
}

module.exports = { parallelCommand: createParallelCommand() };
