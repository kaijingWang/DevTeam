const { Command } = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const { config } = require('../config');

const configCommand = new Command('config')
  .description('配置DevTeam CLI');

// 交互式配置
configCommand
  .command('setup')
  .description('交互式配置向导')
  .action(async () => {
    console.log(chalk.cyan('\n🎯 DevTeam CLI 配置向导\n'));

    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'provider',
        message: '选择LLM提供商:',
        choices: [
          { name: 'Claude (Anthropic) - 推荐', value: 'claude' },
          { name: 'OpenAI (GPT-4)', value: 'openai' },
          { name: 'Google (Gemini)', value: 'gemini' }
        ],
        default: 'claude'
      },
      {
        type: 'password',
        name: 'apiKey',
        message: '输入API密钥:',
        validate: (input) => input.length > 0 || '请输入API密钥'
      },
      {
        type: 'input',
        name: 'apiUrl',
        message: '输入API地址 (可选，直接回车使用默认):',
        default: (answers) => {
          if (answers.provider === 'claude') return 'https://api.anthropic.com';
          if (answers.provider === 'openai') return 'https://api.openai.com';
          return '';
        }
      },
      {
        type: 'list',
        name: 'model',
        message: '选择默认模型:',
        choices: (answers) => {
          if (answers.provider === 'claude') {
            return [
              { name: 'claude-3-5-sonnet-20241022 (推荐)', value: 'claude-3-5-sonnet-20241022' },
              { name: 'claude-3-opus-20240229', value: 'claude-3-opus-20240229' },
              { name: 'claude-3-haiku-20240307', value: 'claude-3-haiku-20240307' }
            ];
          }
          return [{ name: 'gpt-4', value: 'gpt-4' }];
        }
      },
      {
        type: 'number',
        name: 'maxTokens',
        message: '设置最大Token数:',
        default: 4096
      },
      {
        type: 'confirm',
        name: 'streaming',
        message: '启用流式输出?',
        default: true
      },
      {
        type: 'input',
        name: 'workspace',
        message: '设置工作目录:',
        default: './devteam-workspace'
      }
    ]);

    // 保存配置
    config.set('llm', {
      provider: answers.provider,
      apiKey: answers.apiKey,
      apiUrl: answers.apiUrl,
      model: answers.model,
      maxTokens: answers.maxTokens,
      temperature: 0.7,
      streaming: answers.streaming
    });

    config.set('workspace', {
      root: answers.workspace,
      docsDir: 'docs',
      srcDir: 'src',
      testsDir: 'tests'
    });

    console.log(chalk.green('\n✅ 配置已保存到'), config.getPath());
    console.log(chalk.gray('\n现在可以使用 devteam dev "需求描述" 开始开发\n'));
  });

// 查看配置
configCommand
  .command('list')
  .description('查看当前配置')
  .action(() => {
    const currentConfig = config.getAll();
    
    console.log(chalk.cyan('\n📋 当前配置:\n'));
    console.log(chalk.gray('LLM:'));
    console.log(`  Provider: ${currentConfig.llm.provider}`);
    console.log(`  Model: ${currentConfig.llm.model}`);
    console.log(`  API Key: ${currentConfig.llm.apiKey.slice(0, 10)}...`);
    console.log(`  Max Tokens: ${currentConfig.llm.maxTokens}`);
    console.log(`  Streaming: ${currentConfig.llm.streaming}`);
    
    console.log(chalk.gray('\nWorkspace:'));
    console.log(`  Root: ${currentConfig.workspace.root}`);
    console.log(`  Docs: ${currentConfig.workspace.docsDir}`);
    console.log(`  Source: ${currentConfig.workspace.srcDir}`);
    console.log(`  Tests: ${currentConfig.workspace.testsDir}`);
    
    console.log(chalk.gray('\n配置文件:'), config.getPath());
    console.log();
  });

// 设置单个配置
configCommand
  .command('set <key> <value>')
  .description('设置配置项')
  .action((key, value) => {
    const keys = key.split('.');
    const currentConfig = config.getAll();
    
    let obj = currentConfig;
    for (let i = 0; i < keys.length - 1; i++) {
      obj = obj[keys[i]];
    }
    
    obj[keys[keys.length - 1]] = value;
    config.setAll(currentConfig);
    
    console.log(chalk.green(`✅ ${key} = ${value}`));
  });

// 获取单个配置
configCommand
  .command('get <key>')
  .description('获取配置项')
  .action((key) => {
    const keys = key.split('.');
    const currentConfig = config.getAll();
    
    let value = currentConfig;
    for (const k of keys) {
      value = value[k];
    }
    
    console.log(value);
  });

// 重置配置
configCommand
  .command('reset')
  .description('重置为默认配置')
  .action(async () => {
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: '确定要重置配置吗？',
        default: false
      }
    ]);
    
    if (confirm) {
      config.reset();
      console.log(chalk.green('✅ 配置已重置'));
    }
  });

module.exports = { configCommand };
