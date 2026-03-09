const fs = require('fs-extra');
const path = require('path');

class MemoryStore {
  constructor(sessionId) {
    this.sessionId = sessionId;
    this.storePath = `.devteam/sessions/${sessionId}`;
    this.memories = new Map();
    this.load();
  }

  add(memory) {
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
    
    this.memories.get(key).push(fullMemory);
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

  async save() {
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
  }

  async load() {
    try {
      const filepath = path.join(this.storePath, 'memory.json');
      if (await fs.pathExists(filepath)) {
        const data = await fs.readJSON(filepath);
        this.memories = new Map(data.memories);
      }
    } catch (error) {
      this.memories = new Map();
    }
  }

  generateId() {
    return `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = { MemoryStore };
