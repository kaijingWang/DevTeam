const crypto = require('crypto');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');

/**
 * LLM响应缓存管理器
 * 缓存API响应，减少重复调用
 */
class LLMCache {
  constructor() {
    this.cacheDir = path.join(os.homedir(), '.devteam', 'cache', 'llm');
    this.maxAge = 24 * 60 * 60 * 1000; // 24小时
    this.maxSize = 100 * 1024 * 1024; // 100MB
    
    fs.ensureDirSync(this.cacheDir);
  }

  /**
   * 生成缓存key
   */
  generateKey(model, messages, options = {}) {
    const content = JSON.stringify({
      model,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      temperature: options.temperature,
      maxTokens: options.maxTokens
    });
    
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * 获取缓存
   */
  get(key) {
    try {
      const cachePath = path.join(this.cacheDir, `${key}.json`);
      
      if (!fs.existsSync(cachePath)) {
        return null;
      }
      
      const cache = fs.readJsonSync(cachePath);
      
      // 检查是否过期
      if (Date.now() - cache.timestamp > this.maxAge) {
        fs.removeSync(cachePath);
        return null;
      }
      
      console.log('✅ 使用缓存响应');
      return cache.response;
      
    } catch (error) {
      console.error('读取缓存失败:', error.message);
      return null;
    }
  }

  /**
   * 设置缓存
   */
  set(key, response) {
    try {
      const cachePath = path.join(this.cacheDir, `${key}.json`);
      
      fs.writeJsonSync(cachePath, {
        timestamp: Date.now(),
        response: response
      });
      
      // 清理过期缓存
      this.cleanup();
      
    } catch (error) {
      console.error('写入缓存失败:', error.message);
    }
  }

  /**
   * 清理过期缓存
   */
  cleanup() {
    try {
      const files = fs.readdirSync(this.cacheDir);
      let totalSize = 0;
      const fileStats = [];
      
      // 收集文件信息
      for (const file of files) {
        const filePath = path.join(this.cacheDir, file);
        const stats = fs.statSync(filePath);
        
        // 删除过期文件
        if (Date.now() - stats.mtimeMs > this.maxAge) {
          fs.removeSync(filePath);
          continue;
        }
        
        totalSize += stats.size;
        fileStats.push({
          path: filePath,
          size: stats.size,
          mtime: stats.mtimeMs
        });
      }
      
      // 如果超过最大大小，删除最旧的文件
      if (totalSize > this.maxSize) {
        fileStats.sort((a, b) => a.mtime - b.mtime);
        
        for (const file of fileStats) {
          if (totalSize <= this.maxSize * 0.8) break;
          
          fs.removeSync(file.path);
          totalSize -= file.size;
        }
      }
      
    } catch (error) {
      console.error('清理缓存失败:', error.message);
    }
  }

  /**
   * 清空所有缓存
   */
  clear() {
    try {
      fs.emptyDirSync(this.cacheDir);
      console.log('✅ 缓存已清空');
    } catch (error) {
      console.error('清空缓存失败:', error.message);
    }
  }

  /**
   * 获取缓存统计
   */
  getStats() {
    try {
      const files = fs.readdirSync(this.cacheDir);
      let totalSize = 0;
      let validCount = 0;
      
      for (const file of files) {
        const filePath = path.join(this.cacheDir, file);
        const stats = fs.statSync(filePath);
        
        if (Date.now() - stats.mtimeMs <= this.maxAge) {
          totalSize += stats.size;
          validCount++;
        }
      }
      
      return {
        count: validCount,
        size: totalSize,
        sizeFormatted: this.formatSize(totalSize)
      };
      
    } catch (error) {
      return { count: 0, size: 0, sizeFormatted: '0 B' };
    }
  }

  /**
   * 格式化文件大小
   */
  formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}

module.exports = { LLMCache };
