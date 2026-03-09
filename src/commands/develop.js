const { Command } = require('commander');
const chalk = require('chalk');
const { logger } = require('../utils/logger');

const developCommand = new Command('dev')
  .description('开发新功能')
  .argument('<requirement>', '需求描述')
  .option('-i, --interactive', '交互模式（每步询问）')
  .option('-s, --step', '步进模式（每步暂停）')
  .option('-a, --auto', '自动模式（无需确认）', true)
  .option('--agent <agent>', '只运行指定Agent')
  .action(async (requirement, options) => {
    try {
      logger.box(
        `需求: ${requirement}\n模式: ${options.step ? '步进' : options.interactive ? '交互' : '自动'}`,
        '🚀 DevTeam CLI'
      );

      // TODO: 实现Orchestrator
      logger.info('Orchestrator开发中...');
      logger.warn('当前版本仅支持配置功能');
      logger.info('请先运行: devteam config setup');

    } catch (error) {
      logger.error(`错误: ${error.message}`);
      process.exit(1);
    }
  });

module.exports = { developCommand };
