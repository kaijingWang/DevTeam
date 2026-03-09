const { Command } = require('commander');
const fs = require('fs-extra');
const path = require('path');

const resumeCommand = new Command('resume')
  .description('恢复暂停的会话')
  .option('-s, --session <id>', '指定会话ID')
  .action(async (options) => {
    try {
      const sessionsDir = '.devteam/sessions';
      
      if (!fs.existsSync(sessionsDir)) {
        console.log('\n❌ 没有找到会话\n');
        return;
      }
      
      let sessionId = options.session;
      
      // 如果没有指定会话ID，找最近的
      if (!sessionId) {
        const sessions = fs.readdirSync(sessionsDir);
        if (sessions.length === 0) {
          console.log('\n❌ 没有找到会话\n');
          return;
        }
        
        // 找最新的会话
        let latestTime = 0;
        for (const sid of sessions) {
          const statePath = path.join(sessionsDir, sid, 'state.json');
          if (fs.existsSync(statePath)) {
            const state = fs.readJSONSync(statePath);
            if (state.startTime > latestTime) {
              latestTime = state.startTime;
              sessionId = sid;
            }
          }
        }
      }
      
      if (!sessionId) {
        console.log('\n❌ 没有找到可恢复的会话\n');
        return;
      }
      
      // 加载会话状态
      const statePath = path.join(sessionsDir, sessionId, 'state.json');
      if (!fs.existsSync(statePath)) {
        console.log(`\n❌ 会话 ${sessionId} 不存在\n`);
        return;
      }
      
      const state = fs.readJSONSync(statePath);
      
      console.log('\n🔄 恢复会话...\n');
      console.log(`会话ID: ${sessionId}`);
      console.log(`需求: ${state.requirement}`);
      console.log(`进度: ${state.currentStep}/${state.totalSteps}`);
      console.log(`状态: ${state.status}\n`);
      
      if (state.status === 'completed') {
        console.log('✅ 该会话已完成\n');
        return;
      }
      
      console.log('已完成的步骤：');
      Object.entries(state.outputs).forEach(([step, output]) => {
        console.log(`  ✓ ${step}`);
      });
      console.log();
      
      console.log('💡 恢复功能开发中，请使用新会话重新开发\n');
      
    } catch (error) {
      console.error('\n❌ 错误:', error.message, '\n');
    }
  });

module.exports = { resumeCommand };
