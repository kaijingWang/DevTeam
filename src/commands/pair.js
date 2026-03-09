const { Command } = require('commander');
const { PairProgrammingAgent } = require('../agents/PairProgrammingAgent');

const pairCommand = new Command('pair')
  .description('AI Pair Programming - 实时编程助手')
  .option('-p, --path <path>', '项目路径', '.')
  .action(async (options) => {
    try {
      const agent = new PairProgrammingAgent();

      // 处理退出信号
      process.on('SIGINT', () => {
        agent.stop();
        process.exit(0);
      });

      await agent.start(options.path);
    } catch (error) {
      console.error('\n❌ 错误:', error.message, '\n');
    }
  });

module.exports = { pairCommand };
