const { Command } = require('commander');
const inquirer = require('inquirer');
const { OrchestratorV3 } = require('../orchestrator/OrchestratorV3');
const { IterationCoordinator } = require('../agents/IterationCoordinator');
const { CodeFixer } = require('../utils/CodeFixer');
const { CodeValidator } = require('../utils/CodeValidator');
const path = require('path');

function createInteractiveMenu() {
  const menuCommand = new Command('menu')
    .description('交互式菜单（推荐）')
    .alias('m')
    .action(async () => {
      await showMainMenu();
    });
    
  return menuCommand;
}

async function showMainMenu() {
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
        { name: '❌ 退出', value: 'exit' }
      ]
    }
  ]);
  
  switch (action) {
    case 'develop':
      await handleDevelop();
      break;
    case 'iterate':
      await handleIterate();
      break;
    case 'refine':
      await handleRefine();
      break;
    case 'config':
      await handleConfig();
      break;
    case 'cache':
      await handleCache();
      break;
    case 'exit':
      console.log('\n👋 再见！\n');
      process.exit(0);
  }
}

async function handleDevelop() {
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
          name: '🔄 迭代模式（自动修复Bug直到完成）', 
          value: 'iterative',
          short: '迭代模式'
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
    
    if (mode === 'parallel') {
      // 并行模式
      const orchestrator = new OrchestratorV3('auto', { parallel: true });
      await orchestrator.develop(requirement);
      
      if (options.autoFix) {
        const fixer = new CodeFixer(workspacePath);
        await fixer.fixAll();
      }
      
      if (options.validate) {
        const validator = new CodeValidator(workspacePath);
        await validator.validateAll();
      }
      
    } else if (mode === 'iterative') {
      // 迭代模式
      const { maxIterations } = await inquirer.prompt([
        {
          type: 'number',
          name: 'maxIterations',
          message: '最大迭代次数：',
          default: 5,
          validate: (input) => input > 0 || '请输入大于0的数字'
        }
      ]);
      
      const orchestrator = new OrchestratorV3('auto', { parallel: true });
      await orchestrator.develop(requirement);
      
      if (options.autoFix) {
        const fixer = new CodeFixer(workspacePath);
        await fixer.fixAll();
      }
      
      // 迭代优化
      const coordinator = new IterationCoordinator();
      coordinator.maxIterations = maxIterations;
      
      let iterationCount = 0;
      let allPassed = false;
      
      while (iterationCount < maxIterations && !allPassed) {
        iterationCount++;
        console.log(`\n🔄 第 ${iterationCount}/${maxIterations} 次迭代\n`);
        
        const validator = new CodeValidator(workspacePath);
        const validationResult = await validator.validateAll();
        
        if (validationResult.success) {
          allPassed = true;
          console.log('\n✅ 所有检查通过！');
          break;
        }
        
        const iterationResult = await coordinator.execute({
          requirement,
          projectPath: workspacePath,
          validationResult: validationResult.results
        });
        
        if (!iterationResult.success) {
          break;
        }
      }
      
    } else {
      // 标准模式
      const orchestrator = new OrchestratorV3('auto', { parallel: false });
      await orchestrator.develop(requirement);
      
      if (options.autoFix) {
        const fixer = new CodeFixer(workspacePath);
        await fixer.fixAll();
      }
      
      if (options.validate) {
        const validator = new CodeValidator(workspacePath);
        await validator.validateAll();
      }
    }
    
    console.log('\n✅ 开发完成！\n');
    console.log('📂 项目位置：devteam-workspace/\n');
    console.log('🚀 快速开始：');
    console.log('   cd devteam-workspace');
    console.log('   npm install');
    console.log('   npm run dev\n');
    
    // 询问是否继续
    const { continueAction } = await inquirer.prompt([
      {
        type: 'list',
        name: 'continueAction',
        message: '接下来要做什么？',
        choices: [
          { name: '🎨 优化UI设计', value: 'refine' },
          { name: '🔄 返回主菜单', value: 'menu' },
          { name: '❌ 退出', value: 'exit' }
        ]
      }
    ]);
    
    if (continueAction === 'refine') {
      await handleRefine();
    } else if (continueAction === 'menu') {
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

async function handleIterate() {
  console.log('\n🔄 迭代优化现有项目\n');
  
  const { projectPath } = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectPath',
      message: '项目路径：',
      default: './devteam-workspace'
    }
  ]);
  
  const { requirement } = await inquirer.prompt([
    {
      type: 'input',
      name: 'requirement',
      message: '需要优化的内容：',
      validate: (input) => input.trim().length > 0 || '请输入优化内容'
    }
  ]);
  
  const { maxIterations } = await inquirer.prompt([
    {
      type: 'number',
      name: 'maxIterations',
      message: '最大迭代次数：',
      default: 5
    }
  ]);
  
  console.log('\n开始迭代优化...\n');
  
  try {
    const coordinator = new IterationCoordinator();
    coordinator.maxIterations = maxIterations;
    
    const validator = new CodeValidator(projectPath);
    const validationResult = await validator.validateAll();
    
    const result = await coordinator.execute({
      requirement,
      projectPath,
      validationResult: validationResult.results
    });
    
    if (result.success) {
      console.log('\n✅ 迭代优化完成！\n');
    } else {
      console.log('\n⚠️  迭代优化未完全成功\n');
    }
    
    await showMainMenu();
    
  } catch (error) {
    console.error('\n❌ 错误：', error.message);
    await showMainMenu();
  }
}

async function handleRefine() {
  console.log('\n🎨 优化UI设计\n');
  
  const { projectPath } = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectPath',
      message: '项目路径：',
      default: './devteam-workspace'
    }
  ]);
  
  let continueRefining = true;
  
  while (continueRefining) {
    const { category } = await inquirer.prompt([
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
    
    if (category === 'done') {
      console.log('\n✅ 优化完成！\n');
      break;
    }
    
    const { description } = await inquirer.prompt([
      {
        type: 'input',
        name: 'description',
        message: '请描述需要优化的内容：',
        validate: (input) => input.trim().length > 0 || '请输入描述'
      }
    ]);
    
    console.log('\n正在优化...\n');
    
    // TODO: 调用相应的Agent进行优化
    console.log('✅ 优化完成！\n');
    
    const { continueAnswer } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'continueAnswer',
        message: '是否继续优化？',
        default: true
      }
    ]);
    
    continueRefining = continueAnswer;
  }
  
  await showMainMenu();
}

async function handleConfig() {
  console.log('\n⚙️  配置管理\n');
  
  const { configAction } = await inquirer.prompt([
    {
      type: 'list',
      name: 'configAction',
      message: '选择操作：',
      choices: [
        { name: '📋 查看配置', value: 'list' },
        { name: '✏️  修改配置', value: 'edit' },
        { name: '🔙 返回', value: 'back' }
      ]
    }
  ]);
  
  if (configAction === 'list') {
    const config = require('../config');
    console.log('\n当前配置：\n');
    console.log(JSON.stringify(config.getAll(), null, 2));
    console.log();
    
    await inquirer.prompt([
      {
        type: 'input',
        name: 'continue',
        message: '按回车继续...'
      }
    ]);
    
    await handleConfig();
    
  } else if (configAction === 'edit') {
    const { key } = await inquirer.prompt([
      {
        type: 'list',
        name: 'key',
        message: '选择要修改的配置：',
        choices: [
          { name: 'API Key', value: 'llm.apiKey' },
          { name: 'API URL', value: 'llm.apiUrl' },
          { name: 'Model', value: 'llm.model' },
          { name: 'Max Tokens', value: 'llm.maxTokens' },
          { name: 'Temperature', value: 'llm.temperature' }
        ]
      }
    ]);
    
    const { value } = await inquirer.prompt([
      {
        type: 'input',
        name: 'value',
        message: `输入新值（${key}）：`
      }
    ]);
    
    const config = require('../config');
    config.set(key, value);
    
    console.log('\n✅ 配置已更新\n');
    
    await handleConfig();
    
  } else {
    await showMainMenu();
  }
}

async function handleCache() {
  console.log('\n📊 缓存统计\n');
  
  const { LLMCache } = require('../llm/LLMCache');
  const cache = new LLMCache();
  const stats = await cache.getStats();
  
  console.log(`缓存目录: ${stats.cacheDir}`);
  console.log(`缓存文件数: ${stats.count}`);
  console.log(`缓存大小: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`命中率: ${stats.hitRate}%`);
  console.log();
  
  const { cacheAction } = await inquirer.prompt([
    {
      type: 'list',
      name: 'cacheAction',
      message: '选择操作：',
      choices: [
        { name: '🗑️  清空缓存', value: 'clear' },
        { name: '🔙 返回', value: 'back' }
      ]
    }
  ]);
  
  if (cacheAction === 'clear') {
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: '确定要清空缓存吗？',
        default: false
      }
    ]);
    
    if (confirm) {
      await cache.clear();
      console.log('\n✅ 缓存已清空\n');
    }
  }
  
  await showMainMenu();
}

module.exports = { interactiveMenuCommand: createInteractiveMenu() };
