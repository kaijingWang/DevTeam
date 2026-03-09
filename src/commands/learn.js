const { Command } = require('commander');
const { getLearningEngine } = require('../learning/LearningEngine');

const learnCommand = new Command('learn')
  .description('学习模式 - 个性化体验');

learnCommand
  .command('analyze')
  .description('分析当前项目的编码风格')
  .option('-p, --path <path>', '项目路径', '.')
  .action(async (options) => {
    try {
      const engine = getLearningEngine();
      await engine.init();
      await engine.learnFromCode(options.path);
    } catch (error) {
      console.error('\n❌ 错误:', error.message, '\n');
    }
  });

learnCommand
  .command('profile')
  .description('查看学习到的配置')
  .action(async () => {
    try {
      const engine = getLearningEngine();
      await engine.init();
      
      const profile = engine.getProfile();
      
      console.log('\n👤 用户配置:\n');
      console.log('─'.repeat(80));
      
      console.log('\n📝 编码风格:');
      console.log(`  缩进: ${profile.codingStyle.indentation} (${profile.codingStyle.indentSize})`);
      console.log(`  引号: ${profile.codingStyle.quotes}`);
      console.log(`  分号: ${profile.codingStyle.semicolons ? '使用' : '不使用'}`);
      console.log(`  尾逗号: ${profile.codingStyle.trailingComma}`);
      
      console.log('\n📊 使用统计:');
      console.log(`  总命令数: ${profile.stats.totalCommands}`);
      console.log(`  总项目数: ${profile.stats.totalProjects}`);
      
      if (Object.keys(profile.stats.favoriteCommands).length > 0) {
        console.log('\n⭐ 常用命令:');
        const sorted = Object.entries(profile.stats.favoriteCommands)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);
        
        for (const [cmd, count] of sorted) {
          console.log(`  ${cmd}: ${count}次`);
        }
      }
      
      if (profile.stats.recentProjects.length > 0) {
        console.log('\n📁 最近项目:');
        for (const proj of profile.stats.recentProjects.slice(0, 5)) {
          console.log(`  ${proj}`);
        }
      }
      
      console.log('\n' + '─'.repeat(80) + '\n');
    } catch (error) {
      console.error('\n❌ 错误:', error.message, '\n');
    }
  });

learnCommand
  .command('recommend')
  .description('获取个性化推荐')
  .action(async () => {
    try {
      const engine = getLearningEngine();
      await engine.init();
      
      const recommendations = engine.getRecommendations();
      
      console.log('\n💡 个性化推荐:\n');
      console.log('─'.repeat(80));
      
      if (recommendations.length === 0) {
        console.log('\n  暂无推荐，使用更多功能后会有个性化推荐\n');
      } else {
        for (const rec of recommendations) {
          console.log(`\n${rec.title}:`);
          for (const item of rec.items) {
            console.log(`  • ${item}`);
          }
        }
      }
      
      console.log('\n' + '─'.repeat(80) + '\n');
    } catch (error) {
      console.error('\n❌ 错误:', error.message, '\n');
    }
  });

module.exports = { learnCommand };
