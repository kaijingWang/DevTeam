const { Command } = require('commander');
const fs = require('fs-extra');
const path = require('path');

const sessionsCommand = new Command('sessions')
  .description('管理会话')
  .action(async () => {
    try {
      const sessionsDir = '.devteam/sessions';
      
      if (!fs.existsSync(sessionsDir)) {
        console.log('\n📋 没有找到会话\n');
        return;
      }
      
      const sessions = fs.readdirSync(sessionsDir);
      
      if (sessions.length === 0) {
        console.log('\n📋 没有找到会话\n');
        return;
      }
      
      console.log('\n📋 会话列表：\n');
      console.log('─'.repeat(80));
      
      for (const sessionId of sessions) {
        const statePath = path.join(sessionsDir, sessionId, 'state.json');
        
        if (fs.existsSync(statePath)) {
          const state = fs.readJSONSync(statePath);
          
          const statusIcon = {
            'running': '🔄',
            'paused': '⏸️',
            'completed': '✅',
            'failed': '❌'
          }[state.status] || '❓';
          
          console.log(`${statusIcon} ${sessionId}`);
          console.log(`   需求: ${state.requirement}`);
          console.log(`   状态: ${state.status}`);
          console.log(`   进度: ${state.currentStep}/${state.totalSteps}`);
          console.log(`   时间: ${new Date(state.startTime).toLocaleString()}`);
          console.log('─'.repeat(80));
        }
      }
      
      console.log();
      
    } catch (error) {
      console.error('\n❌ 错误:', error.message, '\n');
    }
  });

sessionsCommand
  .command('clean')
  .description('清理已完成的会话')
  .action(async () => {
    try {
      const sessionsDir = '.devteam/sessions';
      
      if (!fs.existsSync(sessionsDir)) {
        console.log('\n📋 没有找到会话\n');
        return;
      }
      
      const sessions = fs.readdirSync(sessionsDir);
      let cleaned = 0;
      
      for (const sessionId of sessions) {
        const statePath = path.join(sessionsDir, sessionId, 'state.json');
        
        if (fs.existsSync(statePath)) {
          const state = fs.readJSONSync(statePath);
          
          if (state.status === 'completed') {
            await fs.remove(path.join(sessionsDir, sessionId));
            cleaned++;
            console.log(`✓ 已清理: ${sessionId}`);
          }
        }
      }
      
      console.log(`\n✅ 清理了 ${cleaned} 个已完成的会话\n`);
      
    } catch (error) {
      console.error('\n❌ 错误:', error.message, '\n');
    }
  });

sessionsCommand
  .command('delete <sessionId>')
  .description('删除指定会话')
  .action(async (sessionId) => {
    try {
      const sessionPath = path.join('.devteam/sessions', sessionId);
      
      if (!fs.existsSync(sessionPath)) {
        console.log(`\n❌ 会话 ${sessionId} 不存在\n`);
        return;
      }
      
      await fs.remove(sessionPath);
      console.log(`\n✅ 已删除会话: ${sessionId}\n`);
      
    } catch (error) {
      console.error('\n❌ 错误:', error.message, '\n');
    }
  });

module.exports = { sessionsCommand };
