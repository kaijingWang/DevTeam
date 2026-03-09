const { Command } = require('commander');
const { ChatMode } = require('../chat/ChatMode');

const chatCommand = new Command('chat')
  .description('进入交互式对话模式')
  .action(async () => {
    try {
      const chat = new ChatMode();
      await chat.start();
    } catch (error) {
      console.error('\n❌ 错误:', error.message, '\n');
    }
  });

module.exports = { chatCommand };
