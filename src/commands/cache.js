const { Command } = require('commander');
const { AnalysisCache } = require('../cache/AnalysisCache');

const cacheCommand = new Command('cache')
  .description('管理分析缓存');

cacheCommand
  .command('list')
  .description('列出所有缓存')
  .action(async () => {
    try {
      const cache = new AnalysisCache();
      await cache.list();
    } catch (error) {
      console.error('\n❌ 错误:', error.message, '\n');
    }
  });

cacheCommand
  .command('clear')
  .description('清除所有缓存')
  .action(async () => {
    try {
      const cache = new AnalysisCache();
      await cache.clear();
    } catch (error) {
      console.error('\n❌ 错误:', error.message, '\n');
    }
  });

cacheCommand
  .command('invalidate [path]')
  .description('清除指定项目的缓存')
  .action(async (projectPath = '.') => {
    try {
      const cache = new AnalysisCache();
      await cache.invalidate(projectPath);
    } catch (error) {
      console.error('\n❌ 错误:', error.message, '\n');
    }
  });

cacheCommand
  .command('stats')
  .description('显示缓存统计')
  .action(async () => {
    try {
      const cache = new AnalysisCache();
      const stats = await cache.getStats();
      
      console.log('\n📊 缓存统计:\n');
      console.log(`  总数: ${stats.total}个`);
      console.log(`  有效: ${stats.valid}个`);
      console.log(`  过期: ${stats.expired}个`);
      console.log(`  大小: ${(stats.size / 1024).toFixed(2)} KB\n`);
    } catch (error) {
      console.error('\n❌ 错误:', error.message, '\n');
    }
  });

module.exports = { cacheCommand };
