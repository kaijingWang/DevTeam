const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');

class AnalysisCache {
  constructor() {
    this.cacheDir = '.devteam/cache';
    this.cacheFile = path.join(this.cacheDir, 'analysis.json');
    this.maxAge = 24 * 60 * 60 * 1000; // 24小时
  }

  async get(projectPath) {
    try {
      // 确保使用绝对路径
      const absPath = path.resolve(projectPath);
      const projectHash = this.hashPath(absPath);

      // 读取缓存
      if (await fs.pathExists(this.cacheFile)) {
        const cache = await fs.readJSON(this.cacheFile);
        const entry = cache[projectHash];

        if (entry) {
          // 检查是否过期
          const age = Date.now() - entry.timestamp;
          if (age < this.maxAge) {
            // 检查项目是否有变化
            const currentSignature = await this.getProjectSignature(absPath);
            if (currentSignature === entry.signature) {
              console.log('  ✓ 使用缓存的分析结果\n');
              return entry.analysis;
            } else {
              console.log('  ⚠️  项目已变化，重新分析\n');
            }
          } else {
            console.log('  ⚠️  缓存已过期，重新分析\n');
          }
        }
      }
    } catch (error) {
      console.warn('读取缓存失败:', error.message);
    }

    return null;
  }

  async set(projectPath, analysis) {
    try {
      const absPath = path.resolve(projectPath);
      const projectHash = this.hashPath(absPath);
      const signature = await this.getProjectSignature(absPath);

      // 确保缓存目录存在
      await fs.ensureDir(this.cacheDir);

      // 读取现有缓存
      let cache = {};
      if (await fs.pathExists(this.cacheFile)) {
        cache = await fs.readJSON(this.cacheFile);
      }

      // 更新缓存
      cache[projectHash] = {
        path: absPath,
        timestamp: Date.now(),
        signature,
        analysis
      };

      // 清理过期缓存
      cache = this.cleanExpired(cache);

      // 保存缓存
      await fs.writeJSON(this.cacheFile, cache, { spaces: 2 });

      console.log('  ✓ 分析结果已缓存\n');
    } catch (error) {
      console.warn('保存缓存失败:', error.message);
    }
  }

  async invalidate(projectPath) {
    try {
      const absPath = path.resolve(projectPath);
      const projectHash = this.hashPath(absPath);

      if (await fs.pathExists(this.cacheFile)) {
        const cache = await fs.readJSON(this.cacheFile);
        delete cache[projectHash];
        await fs.writeJSON(this.cacheFile, cache, { spaces: 2 });
        console.log('  ✓ 缓存已清除\n');
      }
    } catch (error) {
      console.warn('清除缓存失败:', error.message);
    }
  }

  async clear() {
    try {
      if (await fs.pathExists(this.cacheFile)) {
        await fs.remove(this.cacheFile);
        console.log('  ✓ 所有缓存已清除\n');
      }
    } catch (error) {
      console.warn('清除所有缓存失败:', error.message);
    }
  }

  async list() {
    try {
      if (await fs.pathExists(this.cacheFile)) {
        const cache = await fs.readJSON(this.cacheFile);
        const entries = Object.values(cache);

        console.log('\n📋 缓存列表:\n');
        console.log('─'.repeat(80));

        for (const entry of entries) {
          const age = Date.now() - entry.timestamp;
          const ageStr = this.formatAge(age);
          const expired = age > this.maxAge ? '(已过期)' : '';

          console.log(`📁 ${entry.path}`);
          console.log(`   时间: ${new Date(entry.timestamp).toLocaleString()} ${ageStr} ${expired}`);
          console.log(`   类型: ${entry.analysis.basic?.type || 'unknown'}`);
          console.log('─'.repeat(80));
        }

        console.log(`\n总计: ${entries.length}个缓存\n`);
      } else {
        console.log('\n📋 没有缓存\n');
      }
    } catch (error) {
      console.warn('列出缓存失败:', error.message);
    }
  }

  hashPath(projectPath) {
    return crypto.createHash('md5').update(projectPath).digest('hex');
  }

  async getProjectSignature(projectPath) {
    // 生成项目签名（基于关键文件的修改时间）
    const keyFiles = [
      'package.json',
      'package-lock.json',
      'tsconfig.json',
      '.gitignore'
    ];

    const signatures = [];

    for (const file of keyFiles) {
      const filePath = path.join(projectPath, file);
      if (await fs.pathExists(filePath)) {
        const stat = await fs.stat(filePath);
        signatures.push(`${file}:${stat.mtimeMs}`);
      }
    }

    // 添加src目录的文件数量
    const srcPath = path.join(projectPath, 'src');
    if (await fs.pathExists(srcPath)) {
      const fileCount = await this.countFiles(srcPath);
      signatures.push(`src:${fileCount}`);
    }

    return crypto.createHash('md5').update(signatures.join('|')).digest('hex');
  }

  async countFiles(dir) {
    let count = 0;

    try {
      const items = await fs.readdir(dir);

      for (const item of items) {
        if (item === 'node_modules' || item.startsWith('.')) continue;

        const itemPath = path.join(dir, item);
        const stat = await fs.stat(itemPath);

        if (stat.isDirectory()) {
          count += await this.countFiles(itemPath);
        } else {
          count++;
        }
      }
    } catch (error) {
      // 忽略错误
    }

    return count;
  }

  cleanExpired(cache) {
    const now = Date.now();
    const cleaned = {};

    for (const [hash, entry] of Object.entries(cache)) {
      const age = now - entry.timestamp;
      if (age < this.maxAge) {
        cleaned[hash] = entry;
      }
    }

    return cleaned;
  }

  formatAge(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}天前`;
    if (hours > 0) return `${hours}小时前`;
    if (minutes > 0) return `${minutes}分钟前`;
    return `${seconds}秒前`;
  }

  async getStats() {
    try {
      if (await fs.pathExists(this.cacheFile)) {
        const cache = await fs.readJSON(this.cacheFile);
        const entries = Object.values(cache);
        const now = Date.now();

        const stats = {
          total: entries.length,
          valid: entries.filter(e => now - e.timestamp < this.maxAge).length,
          expired: entries.filter(e => now - e.timestamp >= this.maxAge).length,
          size: 0
        };

        const stat = await fs.stat(this.cacheFile);
        stats.size = stat.size;

        return stats;
      }
    } catch (error) {
      // 忽略错误
    }

    return { total: 0, valid: 0, expired: 0, size: 0 };
  }
}

module.exports = { AnalysisCache };
