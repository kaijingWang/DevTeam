const { Command } = require('commander');
const { config } = require('../config/index');

const configCommand = new Command('config')
  .description('配置DevTeam CLI');

configCommand
  .command('list')
  .description('查看当前配置')
  .action(() => {
    const currentConfig = config.getAll();
    
    console.log('\n📋 当前配置:\n');
    console.log('LLM:');
    console.log(`  Provider: ${currentConfig.llm.provider}`);
    console.log(`  Model: ${currentConfig.llm.model}`);
    console.log(`  API Key: ${currentConfig.llm.apiKey ? currentConfig.llm.apiKey.slice(0, 10) + '...' : '未设置'}`);
    console.log(`  Max Tokens: ${currentConfig.llm.maxTokens}`);
    
    console.log('\nWorkspace:');
    console.log(`  Root: ${currentConfig.workspace.root}`);
    
    console.log('\n配置文件:', config.getPath());
    console.log();
  });

configCommand
  .command('set <key> <value>')
  .description('设置配置项 (例如: llm.apiKey sk-ant-xxx)')
  .action((key, value) => {
    const keys = key.split('.');
    const currentConfig = config.getAll();
    
    let obj = currentConfig;
    for (let i = 0; i < keys.length - 1; i++) {
      obj = obj[keys[i]];
    }
    
    obj[keys[keys.length - 1]] = value;
    config.setAll(currentConfig);
    
    console.log(`✅ ${key} = ${value}`);
  });

module.exports = { configCommand };
