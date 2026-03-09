const fs = require('fs-extra');
const path = require('path');

class TemplateManager {
  constructor() {
    this.templatesDir = path.join(__dirname, '../../templates');
    this.userTemplatesDir = path.join(process.env.HOME || process.env.USERPROFILE, '.devteam/templates');
  }

  async list() {
    const templates = [];

    // 内置模板
    if (await fs.pathExists(this.templatesDir)) {
      const builtinTemplates = await fs.readdir(this.templatesDir);
      for (const name of builtinTemplates) {
        const templatePath = path.join(this.templatesDir, name);
        const stat = await fs.stat(templatePath);
        if (stat.isDirectory()) {
          const info = await this.getTemplateInfo(templatePath);
          templates.push({
            name,
            type: 'builtin',
            ...info
          });
        }
      }
    }

    // 用户模板
    if (await fs.pathExists(this.userTemplatesDir)) {
      const userTemplates = await fs.readdir(this.userTemplatesDir);
      for (const name of userTemplates) {
        const templatePath = path.join(this.userTemplatesDir, name);
        const stat = await fs.stat(templatePath);
        if (stat.isDirectory()) {
          const info = await this.getTemplateInfo(templatePath);
          templates.push({
            name,
            type: 'user',
            ...info
          });
        }
      }
    }

    return templates;
  }

  async getTemplateInfo(templatePath) {
    const infoPath = path.join(templatePath, 'template.json');
    
    if (await fs.pathExists(infoPath)) {
      return await fs.readJSON(infoPath);
    }

    return {
      description: '无描述',
      author: 'unknown',
      version: '1.0.0'
    };
  }

  async init(templateName, targetDir = '.', options = {}) {
    // 查找模板
    const template = await this.findTemplate(templateName);
    
    if (!template) {
      throw new Error(`模板 ${templateName} 不存在`);
    }

    console.log(`\n📦 使用模板: ${template.name}`);
    console.log(`   描述: ${template.description}`);
    console.log(`   作者: ${template.author}\n`);

    // 复制模板文件
    await this.copyTemplate(template.path, targetDir, options);

    // 执行模板脚本
    await this.runTemplateScript(template.path, targetDir, options);

    console.log(`\n✅ 项目初始化完成！\n`);
    console.log('下一步:');
    console.log(`  1. cd ${targetDir}`);
    console.log('  2. npm install');
    console.log('  3. npm run dev\n');
  }

  async findTemplate(name) {
    const templates = await this.list();
    return templates.find(t => t.name === name);
  }

  async copyTemplate(templatePath, targetDir, options = {}) {
    const files = await this.getTemplateFiles(templatePath);

    for (const file of files) {
      const sourcePath = path.join(templatePath, file);
      const targetPath = path.join(targetDir, file);

      // 跳过template.json和scripts
      if (file === 'template.json' || file.startsWith('scripts/')) {
        continue;
      }

      await fs.ensureDir(path.dirname(targetPath));

      // 如果是模板文件，进行变量替换
      if (file.endsWith('.template')) {
        const content = await fs.readFile(sourcePath, 'utf-8');
        const processed = this.processTemplate(content, options);
        const finalPath = targetPath.replace('.template', '');
        await fs.writeFile(finalPath, processed);
        console.log(`  ✓ ${file.replace('.template', '')}`);
      } else {
        await fs.copy(sourcePath, targetPath);
        console.log(`  ✓ ${file}`);
      }
    }
  }

  async getTemplateFiles(templatePath) {
    const files = [];

    async function scan(dir, prefix = '') {
      const items = await fs.readdir(dir);

      for (const item of items) {
        if (item.startsWith('.')) continue;

        const itemPath = path.join(dir, item);
        const stat = await fs.stat(itemPath);
        const relativePath = prefix ? path.join(prefix, item) : item;

        if (stat.isDirectory()) {
          await scan(itemPath, relativePath);
        } else {
          files.push(relativePath);
        }
      }
    }

    await scan(templatePath);
    return files;
  }

  processTemplate(content, variables = {}) {
    let processed = content;

    // 替换变量 {{variable}}
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      processed = processed.replace(regex, value);
    }

    return processed;
  }

  async runTemplateScript(templatePath, targetDir, options = {}) {
    const scriptPath = path.join(templatePath, 'scripts/init.js');

    if (await fs.pathExists(scriptPath)) {
      console.log('\n  执行初始化脚本...');
      
      try {
        const script = require(scriptPath);
        if (typeof script === 'function') {
          await script(targetDir, options);
        }
      } catch (error) {
        console.warn(`  ⚠️  脚本执行失败: ${error.message}`);
      }
    }
  }

  async create(name, sourceDir = '.') {
    const targetPath = path.join(this.userTemplatesDir, name);

    if (await fs.pathExists(targetPath)) {
      throw new Error(`模板 ${name} 已存在`);
    }

    console.log(`\n📦 创建模板: ${name}\n`);

    // 复制文件
    await fs.copy(sourceDir, targetPath, {
      filter: (src) => {
        const basename = path.basename(src);
        return !basename.startsWith('.') && 
               basename !== 'node_modules' &&
               basename !== 'dist';
      }
    });

    // 创建template.json
    const templateInfo = {
      name,
      description: '自定义模板',
      author: 'user',
      version: '1.0.0',
      created: new Date().toISOString()
    };

    await fs.writeJSON(
      path.join(targetPath, 'template.json'),
      templateInfo,
      { spaces: 2 }
    );

    console.log(`✅ 模板创建成功: ${targetPath}\n`);
  }

  async remove(name) {
    const template = await this.findTemplate(name);

    if (!template) {
      throw new Error(`模板 ${name} 不存在`);
    }

    if (template.type === 'builtin') {
      throw new Error('不能删除内置模板');
    }

    await fs.remove(template.path);
    console.log(`\n✅ 模板已删除: ${name}\n`);
  }
}

module.exports = { TemplateManager };
