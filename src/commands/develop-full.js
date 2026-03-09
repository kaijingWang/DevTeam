const { Command } = require('commander');
const { Orchestrator } = require('../orchestrator/Orchestrator');
const { config } = require('../config');

const developCommand = new Command('dev')
  .description('开发新功能')
  .argument('<requirement>', '需求描述')
  .option('-i, --interactive', '交互模式（每步询问）')
  .option('-s, --step', '步进模式（每步暂停）')
  .option('-a, --auto', '自动模式（无需确认）', true)
  .action(async (requirement, options) => {
    try {
      // 检查配置
      const llmConfig = config.get('llm');
      if (!llmConfig.apiKey) {
        console.log('\n❌ 错误：未配置API密钥');
        console.log('请先运行: node src/cli-simple.js config set llm.apiKey YOUR_API_KEY\n');
        process.exit(1);
      }

      console.log('\n╔═══════════════════════════════════════════════════════════╗');
      console.log('║            🚀 DevTeam CLI 开始工作...                     ║');
      console.log('╚═══════════════════════════════════════════════════════════╝');
      console.log(`\n需求: ${requirement}`);
      console.log(`模式: ${options.step ? '步进' : options.interactive ? '交互' : '自动'}`);
      console.log(`工作目录: ${config.get('workspace').root}`);

      const orchestrator = new Orchestrator();
      await orchestrator.develop(requirement, options);

    } catch (error) {
      console.error('\n❌ 错误:', error.message);
      if (error.message.includes('API')) {
        console.log('\n💡 提示：请检查API密钥是否正确');
        console.log('设置API密钥: node src/cli-simple.js config set llm.apiKey YOUR_KEY\n');
      }
      process.exit(1);
    }
  });

module.exports = { developCommand };
