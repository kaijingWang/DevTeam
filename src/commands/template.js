const { Command } = require('commander');
const { TemplateManager } = require('../templates/TemplateManager');
const inquirer = require('inquirer');

const templateCommand = new Command('template')
  .description('模板管理')
  .alias('tpl');

templateCommand
  .command('list')
  .description('列出所有模板')
  .action(async () => {
    try {
      const manager = new TemplateManager();
      const templates = await manager.list();
      
      if (templates.length === 0) {
        console.log('\n📦 没有可用模板\n');
        return;
      }

      console.log('\n📦 可用模板:\n');
      console.log('─'.repeat(80));
      
      templates.forEach(t => {
        const typeIcon = t.type === 'builtin' ? '🔧' : '👤';
        console.log(`\n${typeIcon} ${t.name}`);
        console.log(`   描述: ${t.description}`);
        console.log(`   作者: ${t.author}`);
        console.log(`   版本: ${t.version}`);
        if (t.features) {
          console.log(`   特性: ${t.features.join(', ')}`);
        }
      });
      
      console.log('\n' + '─'.repeat(80));
      console.log(`\n总计: ${templates.length}个模板\n`);
    } catch (error) {
      console.error('\n❌ 错误:', error.message, '\n');
    }
  });

templateCommand
  .command('init [template] [dir]')
  .description('使用模板初始化项目')
  .option('-n, --name <name>', '项目名称')
  .option('-d, --description <desc>', '项目描述')
  .action(async (template, dir = '.', options) => {
    try {
      const manager = new TemplateManager();
      
      // 如果没有指定模板，显示选择列表
      if (!template) {
        const templates = await manager.list();
        
        if (templates.length === 0) {
          console.log('\n❌ 没有可用模板\n');
          return;
        }

        const { selectedTemplate } = await inquirer.prompt([
          {
            type: 'list',
            name: 'selectedTemplate',
            message: '选择模板:',
            choices: templates.map(t => ({
              name: `${t.name} - ${t.description}`,
              value: t.name
            }))
          }
        ]);
        
        template = selectedTemplate;
      }

      // 收集变量
      const variables = {
        projectName: options.name || 'my-project',
        description: options.description || 'A new project'
      };

      // 如果没有提供选项，询问用户
      if (!options.name) {
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'projectName',
            message: '项目名称:',
            default: 'my-project'
          },
          {
            type: 'input',
            name: 'description',
            message: '项目描述:',
            default: 'A new project'
          }
        ]);
        
        Object.assign(variables, answers);
      }

      await manager.init(template, dir, variables);
    } catch (error) {
      console.error('\n❌ 错误:', error.message, '\n');
    }
  });

templateCommand
  .command('create <name> [source]')
  .description('创建自定义模板')
  .action(async (name, source = '.') => {
    try {
      const manager = new TemplateManager();
      await manager.create(name, source);
    } catch (error) {
      console.error('\n❌ 错误:', error.message, '\n');
    }
  });

templateCommand
  .command('remove <name>')
  .description('删除模板')
  .action(async (name) => {
    try {
      const manager = new TemplateManager();
      
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: `确定要删除模板 ${name}?`,
          default: false
        }
      ]);
      
      if (confirm) {
        await manager.remove(name);
      }
    } catch (error) {
      console.error('\n❌ 错误:', error.message, '\n');
    }
  });

module.exports = { templateCommand };
