const { Command } = require('commander');
const { getPluginManager } = require('../plugins/PluginManager');

const pluginCommand = new Command('plugin')
  .description('插件管理');

pluginCommand
  .command('list')
  .description('列出已安装的插件')
  .action(async () => {
    try {
      const manager = getPluginManager();
      await manager.init();
      manager.list();
    } catch (error) {
      console.error('\n❌ 错误:', error.message, '\n');
    }
  });

pluginCommand
  .command('install <name>')
  .description('安装插件')
  .action(async (name) => {
    try {
      const manager = getPluginManager();
      await manager.init();
      await manager.install(name);
    } catch (error) {
      console.error('\n❌ 错误:', error.message, '\n');
    }
  });

pluginCommand
  .command('uninstall <name>')
  .description('卸载插件')
  .action(async (name) => {
    try {
      const manager = getPluginManager();
      await manager.init();
      await manager.uninstall(name);
    } catch (error) {
      console.error('\n❌ 错误:', error.message, '\n');
    }
  });

pluginCommand
  .command('enable <name>')
  .description('启用插件')
  .action(async (name) => {
    try {
      const manager = getPluginManager();
      await manager.init();
      await manager.enable(name);
    } catch (error) {
      console.error('\n❌ 错误:', error.message, '\n');
    }
  });

pluginCommand
  .command('disable <name>')
  .description('禁用插件')
  .action(async (name) => {
    try {
      const manager = getPluginManager();
      await manager.init();
      await manager.disable(name);
    } catch (error) {
      console.error('\n❌ 错误:', error.message, '\n');
    }
  });

module.exports = { pluginCommand };
