const { Command } = require('commander');
const { logger } = require('../utils/logger');

const resumeCommand = new Command('resume')
  .description('恢复暂停的会话')
  .option('-s, --session <id>', '指定会话ID')
  .action(async (options) => {
    logger.info('Resume功能开发中...');
  });

module.exports = { resumeCommand };
