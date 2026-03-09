const { Command } = require('commander');
const { Orchestrator } = require('../orchestrator/Orchestrator');
const { config } = require('../config');
const { Validator } = require('../utils/validator');

const developCommand = new Command('dev')
  .description('开发新功能')
  .argument('<requirement>', '需求描述')
  .option('-i, --interactive', '交互模式（每步询问）')
  .option('-s, --step', '步进模式（每步暂停）')
  .option('-a, --auto', '自动模式（无需确认）', true)
  .action(async (requirement, options) => {
    try {
      // 验证需求
      const validatedRequirement = Validator.validateRequirement(requirement);
      
      // 验证配置
      const llmConfig = config.get('llm');
      Validator.validateConfig({ llm: llmConfig });

      console.log(`\n需求: ${validatedRequirement}`);
      
      const mode = options.step ? 'step' : 
                   options.interactive ? 'interactive' : 'auto';
      
      console.log(`模式: ${mode === 'auto' ? '自动' : mode === 'interactive' ? '交互' : '步进'}`);
      console.log(`工作目录: ${config.get('workspace').root}`);

      const orchestrator = new Orchestrator(mode);
      await orchestrator.develop(validatedRequirement, options);

    } catch (error) {
      if (error.message !== '用户退出') {
        console.error('\n❌ 错误:', error.message);
        
        // 友好的错误提示
        if (error.message.includes('API密钥')) {
          console.log('\n💡 提示：请先配置API密钥');
          console.log('运行: devteam config set llm.apiKey YOUR_KEY\n');
        } else if (error.message.includes('需求')) {
          console.log('\n💡 提示：请提供有效的需求描述');
          console.log('示例: devteam dev "用户登录功能"\n');
        } else if (error.message.includes('超时')) {
          console.log('\n💡 提示：操作超时，请检查网络连接或稍后重试\n');
        }
      }
      process.exit(1);
    }
  });

module.exports = { developCommand };
