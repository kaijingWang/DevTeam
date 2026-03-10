const { Command } = require('commander');
const chalk = require('chalk');
const { LLMCache } = require('../llm/LLMCache');
const { getConnectionPool } = require('../llm/ConnectionPool');

function createCacheCommand() {
  const cacheCommand = new Command('cache')
    .description('管理LLM响应缓存');

  // 查看缓存统计
  cacheCommand
    .command('stats')
    .description('查看缓存统计信息')
    .action(() => {
      const cache = new LLMCache();
      const stats = cache.getStats();
      const pool = getConnectionPool();
      const connStats = pool.getStats();
      
      console.log('\n📊 缓存统计:\n');
      console.log(`  缓存数量: ${stats.count} 个`);
      console.log(`  缓存大小: ${stats.sizeFormatted}`);
      console.log(`  有效期: 24小时`);
      
      console.log('\n🔌 连接池统计:\n');
      console.log(`  HTTP活跃连接: ${connStats.http.active}`);
      console.log(`  HTTP空闲连接: ${connStats.http.free}`);
      console.log(`  HTTPS活跃连接: ${connStats.https.active}`);
      console.log(`  HTTPS空闲连接: ${connStats.https.free}`);
      console.log();
    });

  // 清空缓存
  cacheCommand
    .command('clear')
    .description('清空所有缓存')
    .action(() => {
      const cache = new LLMCache();
      cache.clear();
    });
    
  return cacheCommand;
}

module.exports = { cacheCommand: createCacheCommand() };

