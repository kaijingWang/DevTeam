const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const { defaultConfig } = require('../types/config');

class ConfigManager {
  constructor() {
    this.configDir = path.join(os.homedir(), '.devteam');
    this.configFile = path.join(this.configDir, 'config.json');
    this.store = this.load();
  }

  load() {
    try {
      fs.ensureDirSync(this.configDir);
      
      if (fs.existsSync(this.configFile)) {
        const config = fs.readJsonSync(this.configFile);
        
        // 确保数字类型正确
        if (config.llm) {
          if (config.llm.maxTokens) {
            config.llm.maxTokens = Number(config.llm.maxTokens);
          }
          if (config.llm.temperature) {
            config.llm.temperature = Number(config.llm.temperature);
          }
        }
        
        return config;
      }
      
      // 使用默认配置
      return JSON.parse(JSON.stringify(defaultConfig));
    } catch (error) {
      console.error('加载配置失败:', error.message);
      return JSON.parse(JSON.stringify(defaultConfig));
    }
  }

  save() {
    try {
      fs.ensureDirSync(this.configDir);
      fs.writeJsonSync(this.configFile, this.store, { spaces: 2 });
    } catch (error) {
      console.error('保存配置失败:', error.message);
    }
  }

  get(key) {
    const keys = key.split('.');
    let value = this.store;
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return undefined;
      }
    }
    
    return value;
  }

  set(key, value) {
    const keys = key.split('.');
    let obj = this.store;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!obj[k] || typeof obj[k] !== 'object') {
        obj[k] = {};
      }
      obj = obj[k];
    }
    
    // 类型转换：确保数字类型正确
    let finalValue = value;
    if (key === 'llm.maxTokens' || key === 'llm.temperature') {
      finalValue = Number(value);
    }
    
    obj[keys[keys.length - 1]] = finalValue;
    this.save();
  }

  getAll() {
    return this.store;
  }

  setAll(config) {
    Object.entries(config).forEach(([key, value]) => {
      this.set(key, value);
    });
  }

  reset() {
    this.store = JSON.parse(JSON.stringify(defaultConfig));
    this.save();
  }

  getPath() {
    return this.configFile;
  }
}

const config = new ConfigManager();

module.exports = { config };
