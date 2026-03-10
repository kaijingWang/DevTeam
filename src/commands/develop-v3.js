const { Command } = require('commander');
const { Orchestrator } = require('../orchestrator/Orchestrator');
const { CodeFixer } = require('../utils/CodeFixer');
const { CodeValidator } = require('../utils/CodeValidator');
const path = require('path');

function createDevelopCommand() {
  const developCommand = new Command('dev')
    .description('开发新功能（增强版）')
    .argument('<requirement>', '需求描述')
    .option('-a, --auto', '自动模式（无需确认）', true)
    .option('--fix', '生成后自动修复常见问题', true)
    .option('--validate', '生成后自动验证代码', true)
    .option('--no-fix', '不自动修复')
    .option('--no-validate', '不自动验证')
    .action(async (requirement, options) => {
      console.log('\n🚀 DevTeam CLI v3.0 - 增强版\n');
      
      const orchestrator = new Orchestrator();
      const workspacePath = path.join(process.cwd(), 'devteam-workspace');
      
      try {
        // 1. 生成代码
        console.log('📝 Step 1/3: 生成代码\n');
        await orchestrator.run({
          requirement,
          mode: 'auto',
          projectPath: process.cwd()
        });
        
        // 2. 自动修复
        if (options.fix) {
          console.log('\n🔧 Step 2/3: 自动修复\n');
          const fixer = new CodeFixer(workspacePath);
          await fixer.fixAll();
        } else {
          console.log('\n⏭️  Step 2/3: 跳过自动修复\n');
        }
        
        // 3. 代码验证
        if (options.validate) {
          console.log('\n✅ Step 3/3: 代码验证\n');
          const validator = new CodeValidator(workspacePath);
          const result = await validator.validateAll();
          
          if (!result.success) {
            console.log('\n⚠️  代码验证失败，但项目已生成。');
            console.log('💡 提示：运行以下命令手动修复：');
            console.log('   cd devteam-workspace');
            console.log('   npm install');
            console.log('   npm run build');
            process.exit(1);
          }
        } else {
          console.log('\n⏭️  Step 3/3: 跳过代码验证\n');
        }
        
        // 成功提示
        console.log('\n' + '='.repeat(60));
        console.log('🎉 项目生成成功！');
        console.log('='.repeat(60));
        console.log('\n📂 项目位置：devteam-workspace/');
        console.log('\n🚀 快速开始：');
        console.log('   cd devteam-workspace');
        console.log('   npm install  # 如果还没安装依赖');
        console.log('   npm run dev  # 启动开发服务器');
        console.log('\n📦 构建生产版本：');
        console.log('   npm run build');
        console.log('   npm run preview');
        console.log('\n📚 查看文档：');
        console.log('   docs/PRD.md           - 产品需求文档');
        console.log('   docs/ARCHITECTURE.md  - 技术架构文档');
        console.log('   docs/API.md           - API文档');
        console.log('   design/DESIGN.md      - UI设计文档');
        console.log('\n');
        
      } catch (error) {
        console.error('\n❌ 错误：', error.message);
        console.error('\n💡 提示：');
        console.error('   1. 检查API配置是否正确');
        console.error('   2. 检查网络连接');
        console.error('   3. 查看详细日志');
        process.exit(1);
      }
    });
    
  return developCommand;
}

module.exports = { developCommand: createDevelopCommand() };
