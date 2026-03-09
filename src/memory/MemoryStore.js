const fs = require('fs-extra');
const path = require('path');
const { MEMORY } = require('../config/constants').default || require('../config/constants');

class MemoryStore {
  constructor(sessionId, options = {}) {
    this.sessionId = sessionId;
    this.storePath = `.devteam/sessions/${sessionId}`;
    this.memories = new Map();
    
    // 配置
    this.maxMemories = options.maxMemories || (MEMORY && MEMORY.MAX_MEMORIES) || 1000;
    this.maxAge = options.maxAge || (MEMORY && MEMORY.MAX_AGE) || 7 * 24 * 60 * 60 * 1000;
    
    // 加载现有记忆
    this.load();
    
    // 定期清理
    this.startCleanupTimer();
  }

  add(memory) {
    // 清理过期记忆
    this.cleanup();
    
    const id = this.generateId();
    const fullMemory = {
      ...memory,
      id,
      timestamp: Date.now()
    };
    
    const key = memory.type || 'default';
    if (!this.memories.has(key)) {
      this.memories.set(key, []);
    }
    
    const memories = this.memories.get(key);
    
    // 限制数量
    if (memories.length >= this.maxMemories) {
      memories.shift(); // 移除最旧的
    }
    
    memories.push(fullMemory);
    this.save();
    
    return id;
  }

  get(type, filter = {}) {
    const memories = this.memories.get(type) || [];
    
    if (Object.keys(filter).length === 0) {
      return memories;
    }
    
    return memories.filter(m => {
      for (const [key, value] of Object.entries(filter)) {
        if (m[key] !== value) return false;
      }
      return true;
    });
  }

  search(query) {
    const allMemories = [];
    this.memories.forEach(memories => allMemories.push(...memories));
    
    return allMemories.filter(m => 
      JSON.stringify(m.content).toLowerCase().includes(query.toLowerCase())
    );
  }

  getContext() {
    const context = {};
    this.memories.forEach((memories, type) => {
      context[type] = memories;
    });
    return context;
  }

  cleanup() {
    const now = Date.now();
    let cleaned = 0;
    
    this.memories.forEach((memories, type) => {
      const before = memories.length;
      const filtered = memories.filter(m => now - m.timestamp < this.maxAge);
      this.memories.set(type, filtered);
      cleaned += before - filtered.length;
    });
    
    if (cleaned > 0) {
      this.save();
    }
    
    return cleaned;
  }

  startCleanupTimer() {
    // 每小时清理一次
    this.cleanupTimer = setInterval(() => {
      const cleaned = this.cleanup();
      if (cleaned > 0) {
        console.log(`清理了 ${cleaned} 条过期记忆`);
      }
    }, 60 * 60 * 1000);
  }

  stopCleanupTimer() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
  }

  async save() {
    try {
      const data = {
        sessionId: this.sessionId,
        timestamp: Date.now(),
        memories: Array.from(this.memories.entries())
      };
      
      await fs.ensureDir(this.storePath);
      await fs.writeJSON(
        path.join(this.storePath, 'memory.json'),
        data,
        { spaces: 2 }
      );
    } catch (error) {
      console.error('保存记忆失败:', error.message);
    }
  }

  async load() {
    try {
      const filepath = path.join(this.storePath, 'memory.json');
      if (await fs.pathExists(filepath)) {
        const data = await fs.readJSON(filepath);
        this.memories = new Map(data.memories);
        
        // 加载后立即清理
        this.cleanup();
      }
    } catch (error) {
      console.error('加载记忆失败:', error.message);
      this.memories = new Map();
    }
  }

  generateId() {
    return `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 获取统计信息
  getStats() {
    let total = 0;
    const byType = {};
    
    this.memories.forEach((memories, type) => {
      byType[type] = memories.length;
      total += memories.length;
    });
    
    return {
      total,
      byType,
      maxMemories: this.maxMemories,
      maxAge: this.maxAge
    };
  }
}

module.exports = { MemoryStore };
