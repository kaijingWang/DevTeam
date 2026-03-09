const { Command } = require('commander');
const { logger } = require('../utils/logger');

const sessionsCommand = new Command('sessions')
  .description('管理会话')
  .action(async () => {
    logger.info('Sessions功能开发中...');
  });

sessionsCommand
  .command('clean')
  .description('清理已完成的会话')
  .action(async () => {
    logger.info('Clean功能开发中...');
  });

sessionsCommand
  .command('delete <sessionId>')
  .description('删除指定会话')
  .action(async (sessionId) => {
    logger.info(`Delete session ${sessionId} 功能开发中...`);
  });

module.exports = { sessionsCommand };
