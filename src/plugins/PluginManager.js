const fs = require('fs-extra');
const path = require('path');
const { EventEmitter } = require('events');

class PluginManager extends EventEmitter {
  constructor() {
    super();
    this.plugins = new Map();
    this.pluginsDir = path.join(process.env.HOME || process.env.USERPROFILE, '.devteam/plugins');
    this.hooks = new Map();
  }

  async init() {
    await fs.ensureDir(this.pluginsDir);
    await this.loadPlugins();
  }

  async loadPlugins() {
    try {
      const pluginDirs = await fs.readdir(this.pluginsDir);

      for (const dir of pluginDirs) {
        const pluginPath = path.join(this.pluginsDir, dir);
        const stat = await fs.stat(pluginPath);

        if (stat.isDirectory()) {
          await this.loadPlugin(pluginPath);
        }
      }

      console.log(`✓ 已加载 ${this.plugins.size} 个插件`);
    } catch (error) {
      console.warn('加载插件失败:', error.message);
    }
  }

  async loadPlugin(pluginPath) {
    try {
      const packagePath = path.join(pluginPath, 'package.json');
      
      if (!await fs.pathExists(packagePath)) {
        return;
      }

      const pkg = await fs.readJSON(packagePath);
      const entryPath = path.join(pluginPath, pkg.main || 'index.js');

      if (!await fs.pathExists(entryPath)) {
        return;
      }

      // 加载插件
      const plugin = require(entryPath);

      // 验证插件
      if (!plugin.name || !plugin.version) {
        throw new Error('插件缺少必需字段');
      }

      // 初始化插件
      if (plugin.init) {
        await plugin.init(this.createPluginAPI());
      }

      this.plugins.set(plugin.name, {
        ...plugin,
        path: pluginPath,
        enabled: true
      });

      console.log(`  ✓ ${plugin.name}@${plugin.version}`);
    } catch (error) {
      console.warn(`  ✗ 加载插件失败: ${error.message}`);
    }
  }

  createPluginAPI() {
    return {
      // 注册钩子
      registerHook: (name, handler) => {
        if (!this.hooks.has(name)) {
          this.hooks.set(name, []);
        }
        this.hooks.get(name).push(handler);
      },

      // 注册命令
      registerCommand: (name, handler) => {
        this.emit('command:register', { name, handler });
      },

      // 注册Agent
      registerAgent: (name, agent) => {
        this.emit('agent:register', { name, agent });
      },

      // 注册模板
      registerTemplate: (name, template) => {
        this.emit('template:register', { name, template });
      },

      // 日志
      log: (...args) => console.log('[Plugin]', ...args),
      warn: (...args) => console.warn('[Plugin]', ...args),
      error: (...args) => console.error('[Plugin]', ...args)
    };
  }

  async executeHook(name, ...args) {
    const handlers = this.hooks.get(name) || [];
    
    for (const handler of handlers) {
      try {
        await handler(...args);
      } catch (error) {
        console.warn(`钩子 ${name} 执行失败:`, error.message);
      }
    }
  }

  async install(pluginName) {
    console.log(`\n📦 安装插件: ${pluginName}\n`);

    try {
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);

      // 安装到插件目录
      const targetDir = path.join(this.pluginsDir, pluginName);
      await fs.ensureDir(targetDir);

      // 使用npm安装
      await execAsync(`npm install ${pluginName}`, {
        cwd: targetDir
      });

      console.log('  ✓ 安装完成\n');

      // 加载插件
      await this.loadPlugin(targetDir);
    } catch (error) {
      console.error('  ✗ 安装失败:', error.message, '\n');
    }
  }

  async uninstall(pluginName) {
    console.log(`\n🗑️  卸载插件: ${pluginName}\n`);

    try {
      const plugin = this.plugins.get(pluginName);
      
      if (!plugin) {
        console.log('  ⚠️  插件不存在\n');
        return;
      }

      // 调用插件的卸载钩子
      if (plugin.destroy) {
        await plugin.destroy();
      }

      // 删除插件目录
      await fs.remove(plugin.path);

      // 从内存中移除
      this.plugins.delete(pluginName);

      console.log('  ✓ 卸载完成\n');
    } catch (error) {
      console.error('  ✗ 卸载失败:', error.message, '\n');
    }
  }

  list() {
    console.log('\n📦 已安装的插件:\n');
    console.log('─'.repeat(80));

    if (this.plugins.size === 0) {
      console.log('\n  没有安装任何插件\n');
      return;
    }

    for (const [name, plugin] of this.plugins) {
      const status = plugin.enabled ? '✅' : '❌';
      console.log(`\n${status} ${name}@${plugin.version}`);
      if (plugin.description) {
        console.log(`   ${plugin.description}`);
      }
      if (plugin.author) {
        console.log(`   作者: ${plugin.author}`);
      }
    }

    console.log('\n' + '─'.repeat(80));
    console.log(`\n总计: ${this.plugins.size}个插件\n`);
  }

  async enable(pluginName) {
    const plugin = this.plugins.get(pluginName);
    
    if (!plugin) {
      console.log(`\n⚠️  插件 ${pluginName} 不存在\n`);
      return;
    }

    plugin.enabled = true;
    console.log(`\n✅ 已启用插件: ${pluginName}\n`);
  }

  async disable(pluginName) {
    const plugin = this.plugins.get(pluginName);
    
    if (!plugin) {
      console.log(`\n⚠️  插件 ${pluginName} 不存在\n`);
      return;
    }

    plugin.enabled = false;
    console.log(`\n❌ 已禁用插件: ${pluginName}\n`);
  }
}

// 全局插件管理器实例
let pluginManager = null;

function getPluginManager() {
  if (!pluginManager) {
    pluginManager = new PluginManager();
  }
  return pluginManager;
}

module.exports = { PluginManager, getPluginManager };
