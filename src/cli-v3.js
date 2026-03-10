#!/usr/bin/env node

const { Command } = require('commander');
const { configCommand } = require('./commands/config-simple');
const { cacheCommand } = require('./commands/cache');
const { templateCommand } = require('./commands/template');
const { reviewCommand } = require('./commands/review');
const { fixCommand } = require('./commands/fix');
const { docsCommand } = require('./commands/docs');
const { pluginCommand } = require('./commands/plugin');
const { pairCommand } = require('./commands/pair');
const { learnCommand } = require('./commands/learn');
const { chatCommand } = require('./commands/chat');
const { interactiveMenuCommand } = require('./commands/interactive-menu');

// 导入v3增强命令
const { developCommand: developV3 } = require('./commands/develop-v3');
const { iterativeCommand } = require('./commands/iterate');
const { refineCommand } = require('./commands/refine');
const { parallelCommand } = require('./commands/parallel');

const program = new Command();

console.log(`
╔═══════════════════════════════════════════════════════════╗
║            DevTeam CLI - v3.0                             ║
║            AI-Powered Development Team                    ║
║                                                           ║
║  🎯 PM  🏗️ Architect  🎨 UI  📡 API                      ║
║  👨💻 Backend  🎨 Frontend  🧪 QA  📦 Git                  ║
║  🔌 Plugins  🤖 Multi-LLM  🤝 AI Pair  🧠 Learning       ║
║                                                           ║
║  ✨ v3.0 新特性：                                         ║
║  • 更专业的Agent提示词                                    ║
║  • 自动代码修复                                           ║
║  • 自动代码验证                                           ║
║  • 迭代优化（自动修复Bug）                                ║
║  • UI交互式优化                                           ║
║  • 智能并行执行（3-5x加速）                               ║
║  • 生成可直接运行的代码                                   ║
╚═══════════════════════════════════════════════════════════╝
`);

program
  .name('devteam')
  .description('AI-powered development team in your terminal')
  .version('3.0.0')
  .action(async () => {
    // 如果没有参数，显示交互式菜单
    const { interactiveMenuCommand } = require('./commands/interactive-menu');
    const { showMainMenu } = require('./commands/interactive-menu');
    
    // 直接调用菜单函数
    const inquirer = require('inquirer');
    const { OrchestratorV3 } = require('./orchestrator/OrchestratorV3');
    const { IterationCoordinator } = require('./agents/IterationCoordinator');
    const { CodeFixer } = require('./utils/CodeFixer');
    const { CodeValidator } = require('./utils/CodeValidator');
    const path = require('path');
    
    // 显示主菜单
    await showMainMenu();
  });

async function showMainMenu() {
  const inquirer = require('inquirer');
  
  console.clear();
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║            DevTeam CLI v3.0                               ║
║            AI-Powered Development Team                    ║
╚═══════════════════════════════════════════════════════════╝
  `);
  
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: '请选择操作：',
      choices: [
        { name: '🚀 开发新项目', value: 'develop' },
        { name: '🔄 迭代优化现有项目', value: 'iterate' },
        { name: '🎨 优化UI设计', value: 'refine' },
        { name: '⚙️  配置管理', value: 'config' },
        { name: '📊 查看缓存统计', value: 'cache' },
        { name: '📚 查看帮助', value: 'help' },
        { name: '❌ 退出', value: 'exit' }
      ]
    }
  ]);
  
  switch (action) {
    case 'develop':
      await handleDevelop();
      break;
    case 'help':
      program.help();
      break;
    case 'exit':
      console.log('\n👋 再见！\n');
      process.exit(0);
      break;
    default:
      console.log('\n功能开发中...\n');
      await showMainMenu();
  }
}

async function handleDevelop() {
  const inquirer = require('inquirer');
  const { OrchestratorV3 } = require('./orchestrator/OrchestratorV3');
  const { CodeFixer } = require('./utils/CodeFixer');
  const { CodeValidator } = require('./utils/CodeValidator');
  const path = require('path');
  
  console.log('\n🚀 开发新项目\n');
  
  // 1. 输入需求
  const { requirement } = await inquirer.prompt([
    {
      type: 'input',
      name: 'requirement',
      message: '请描述你的项目需求：',
      validate: (input) => input.trim().length > 0 || '请输入需求描述'
    }
  ]);
  
  // 2. 选择开发模式
  const { mode } = await inquirer.prompt([
    {
      type: 'list',
      name: 'mode',
      message: '选择开发模式：',
      choices: [
        { 
          name: '⚡ 快速模式（并行执行，3-5x加速）', 
          value: 'parallel',
          short: '快速模式'
        },
        { 
          name: '📝 标准模式（顺序执行，更稳定）', 
          value: 'standard',
          short: '标准模式'
        }
      ]
    }
  ]);
  
  // 3. 选择选项
  const options = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'autoFix',
      message: '是否自动修复常见问题？',
      default: true
    },
    {
      type: 'confirm',
      name: 'validate',
      message: '是否验证代码质量？',
      default: true
    }
  ]);
  
  // 4. 执行开发
  console.log('\n开始开发...\n');
  
  try {
    const workspacePath = path.join(process.cwd(), 'devteam-workspace');
    const orchestrator = new OrchestratorV3('auto', { parallel: mode === 'parallel' });
    
    await orchestrator.develop(requirement);
    
    if (options.autoFix) {
      console.log('\n🔧 自动修复...\n');
      const fixer = new CodeFixer(workspacePath);
      await fixer.fixAll();
    }
    
    if (options.validate) {
      console.log('\n✅ 验证代码...\n');
      const validator = new CodeValidator(workspacePath);
      await validator.validateAll();
    }
    
    console.log('\n✅ 开发完成！\n');
    console.log('📂 项目位置：devteam-workspace/\n');
    console.log('🚀 快速开始：');
    console.log('   cd devteam-workspace');
    console.log('   npm install');
    console.log('   npm run dev\n');
    
    const { continueAction } = await inquirer.prompt([
      {
        type: 'list',
        name: 'continueAction',
        message: '接下来要做什么？',
        choices: [
          { name: '🔄 返回主菜单', value: 'menu' },
          { name: '❌ 退出', value: 'exit' }
        ]
      }
    ]);
    
    if (continueAction === 'menu') {
      await showMainMenu();
    } else {
      console.log('\n👋 再见！\n');
      process.exit(0);
    }
    
  } catch (error) {
    console.error('\n❌ 错误：', error.message);
    
    const { retry } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'retry',
        message: '是否重试？',
        default: false
      }
    ]);
    
    if (retry) {
      await handleDevelop();
    } else {
      await showMainMenu();
    }
  }
}

// 添加所有命令
program.addCommand(interactiveMenuCommand);  // 交互式菜单
program.addCommand(chatCommand);
program.addCommand(configCommand);
program.addCommand(developV3);  // 使用v3增强命令
program.addCommand(parallelCommand);  // 并行执行
program.addCommand(iterativeCommand);  // 迭代开发
program.addCommand(refineCommand);  // UI优化
program.addCommand(cacheCommand);
program.addCommand(templateCommand);
program.addCommand(reviewCommand);
program.addCommand(fixCommand);
program.addCommand(docsCommand);
program.addCommand(pluginCommand);
program.addCommand(pairCommand);
program.addCommand(learnCommand);

// 添加快捷命令
program
  .command('quick <requirement>')
  .description('快速开发（并行+自动修复+验证）')
  .action(async (requirement) => {
    const { OrchestratorV3 } = require('./orchestrator/OrchestratorV3');
    const { CodeFixer } = require('./utils/CodeFixer');
    const { CodeValidator } = require('./utils/CodeValidator');
    const path = require('path');
    
    console.log('\n🚀 快速开发模式（并行执行）\n');
    
    const orchestrator = new OrchestratorV3('auto', { parallel: true });
    const workspacePath = path.join(process.cwd(), 'devteam-workspace');
    
    try {
      // 并行生成代码
      await orchestrator.develop(requirement);
      
      // 自动修复
      const fixer = new CodeFixer(workspacePath);
      await fixer.fixAll();
      
      // 自动验证
      const validator = new CodeValidator(workspacePath);
      await validator.validateAll();
      
      console.log('\n✅ 快速开发完成！');
      console.log('\n🚀 运行项目：');
      console.log('   cd devteam-workspace && npm run dev\n');
      
    } catch (error) {
      console.error('\n❌ 错误：', error.message);
      process.exit(1);
    }
  });

// 添加帮助信息
program.on('--help', () => {
  console.log('');
  console.log('快速开始：');
  console.log('  $ devteam              # 交互式菜单（推荐）');
  console.log('  $ devteam menu         # 交互式菜单');
  console.log('  $ devteam parallel "开发一个待办事项应用"');
  console.log('  $ devteam quick "开发一个计算器"');
  console.log('');
  console.log('示例：');
  console.log('  $ devteam parallel "开发一个待办事项应用"');
  console.log('  $ devteam parallel "开发一个计算器" --no-parallel');
  console.log('  $ devteam iterate "开发一个五子棋游戏" --max-iterations 10');
  console.log('  $ devteam refine --project-path ./my-project');
  console.log('  $ devteam quick "开发一个博客系统"');
  console.log('  $ devteam config set llm.apiKey YOUR_API_KEY');
  console.log('  $ devteam cache stats');
  console.log('');
  console.log('v3.0 核心功能：');
  console.log('  • parallel - 并行开发（3-5x加速）');
  console.log('  • iterate  - 迭代开发（自动修复Bug直到完成）');
  console.log('  • refine   - UI优化（交互式反馈优化）');
  console.log('  • dev      - 标准开发（生成+修复+验证）');
  console.log('  • quick    - 快速开发（并行+一键完成）');
  console.log('');
  console.log('并行执行优势：');
  console.log('  第1组: PM Agent（必须先执行）');
  console.log('  第2组: Architect + UI Designer + API Designer（并行）');
  console.log('  第3组: Backend + Frontend（并行）');
  console.log('  第4组: QA + Git（并行）');
  console.log('  理论加速: 8个Agent / 4组 = 2x');
  console.log('  实际加速: 3-5x（取决于API响应时间）');
  console.log('');
  console.log('工作流程：');
  console.log('  1. 需求分析 → PM Agent');
  console.log('  2. 架构设计 → Architect Agent');
  console.log('  3. UI设计 → UI Designer Agent');
  console.log('  4. 代码生成 → Frontend/Backend Agent');
  console.log('  5. 测试生成 → QA Agent');
  console.log('  6. 自动修复 → Code Fixer');
  console.log('  7. 代码验证 → Code Validator');
  console.log('  8. 迭代优化 → Iteration Coordinator');
  console.log('');
  console.log('文档：https://github.com/your-repo/devteam-cli');
  console.log('');
});

program.parse(process.argv);
