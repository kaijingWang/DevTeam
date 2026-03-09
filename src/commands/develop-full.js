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
      if (!llmConfig.apiKey || llmConfig.apiKey === 'test-key') {
        console.log('\n❌ 错误：未配置API密钥');
        console.log('请先运行: devteam config set llm.apiKey YOUR_API_KEY\n');
        process.exit(1);
      }

      console.log(`\n需求: ${requirement}`);
      
      const mode = options.step ? 'step' : 
                   options.interactive ? 'interactive' : 'auto';
      
      console.log(`模式: ${mode === 'auto' ? '自动' : mode === 'interactive' ? '交互' : '步进'}`);
      console.log(`工作目录: ${config.get('workspace').root}`);

      const orchestrator = new Orchestrator(mode);
      await orchestrator.develop(requirement, options);

    } catch (error) {
      if (error.message !== '用户退出') {
        console.error('\n❌ 错误:', error.message);
        if (error.message.includes('API')) {
          console.log('\n💡 提示：请检查API密钥是否正确');
          console.log('设置API密钥: devteam config set llm.apiKey YOUR_KEY\n');
        }
      }
      process.exit(1);
    }
  });

module.exports = { developCommand };
