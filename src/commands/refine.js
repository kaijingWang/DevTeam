const { Command } = require('commander');
const { UIDesignerAgent } = require('../agents/UIDesignerAgent-v2');
const { FrontendAgent } = require('../agents/FrontendAgent-v2');
const inquirer = require('inquirer');
const path = require('path');

function createRefineCommand() {
  const refineCommand = new Command('refine')
    .description('优化UI设计和代码（交互式反馈）')
    .option('-p, --project-path <path>', '项目路径', './devteam-workspace')
    .option('--ui', '只优化UI设计')
    .option('--code', '只优化代码实现')
    .action(async (options) => {
      console.log('\n🎨 DevTeam CLI - UI优化模式\n');
      
      const projectPath = path.resolve(options.projectPath);
      
      try {
        let continueRefining = true;
        let iterationCount = 0;
        const maxIterations = 10;
        
        while (continueRefining && iterationCount < maxIterations) {
          iterationCount++;
          console.log(`\n${'='.repeat(60)}`);
          console.log(`🔄 第 ${iterationCount} 次优化`);
          console.log('='.repeat(60) + '\n');
          
          // 询问用户反馈
          const feedback = await inquirer.prompt([
            {
              type: 'list',
              name: 'category',
              message: '请选择要优化的类别：',
              choices: [
                { name: '🎨 UI设计（颜色、布局、样式）', value: 'ui' },
                { name: '💻 代码实现（组件、逻辑）', value: 'code' },
                { name: '🐛 Bug修复', value: 'bug' },
                { name: '✅ 完成优化', value: 'done' }
              ]
            }
          ]);
          
          if (feedback.category === 'done') {
            console.log('\n✅ 优化完成！');
            break;
          }
          
          // 获取详细反馈
          const details = await inquirer.prompt([
            {
              type: 'input',
              name: 'description',
              message: '请描述需要优化的内容：',
              validate: (input) => input.trim().length > 0 || '请输入描述'
            },
            {
              type: 'input',
              name: 'files',
              message: '涉及的文件（可选，多个文件用逗号分隔）：',
              default: ''
            }
          ]);
          
          // 根据类别选择Agent
          let agent;
          if (feedback.category === 'ui') {
            console.log('\n🎨 UI Designer Agent 开始优化...\n');
            agent = new UIDesignerAgent();
          } else {
            console.log('\n💻 Frontend Agent 开始优化...\n');
            agent = new FrontendAgent();
          }
          
          // 执行优化
          const result = await agent.execute({
            mode: 'refine',
            feedback: details.description,
            files: details.files.split(',').map(f => f.trim()).filter(f => f),
            projectPath
          });
          
          if (result.success) {
            console.log('\n✅ 优化完成！');
            
            // 询问是否继续
            const continueAnswer = await inquirer.prompt([
              {
                type: 'confirm',
                name: 'continue',
                message: '是否继续优化？',
                default: true
              }
            ]);
            
            continueRefining = continueAnswer.continue;
          } else {
            console.log('\n❌ 优化失败：', result.error);
            
            const retryAnswer = await inquirer.prompt([
              {
                type: 'confirm',
                name: 'retry',
                message: '是否重试？',
                default: true
              }
            ]);
            
            continueRefining = retryAnswer.retry;
          }
        }
        
        if (iterationCount >= maxIterations) {
          console.log(`\n⚠️  已达到最大优化次数 (${maxIterations})`);
        }
        
        console.log('\n📊 优化总结：');
        console.log(`   总优化次数: ${iterationCount}`);
        console.log('\n🚀 查看效果：');
        console.log(`   cd ${options.projectPath}`);
        console.log('   npm run dev\n');
        
      } catch (error) {
        console.error('\n❌ 错误：', error.message);
        process.exit(1);
      }
    });
    
  return refineCommand;
}

module.exports = { refineCommand: createRefineCommand() };
