const fs = require('fs-extra');
const path = require('path');

class ProjectAnalyzer {
  async analyze(projectPath = '.') {
    const context = {
      path: path.resolve(projectPath),
      isExisting: false,
      type: 'unknown',
      structure: {},
      techStack: {},
      codebase: {},
      packageJson: null
    };

    // 检查是否是现有项目
    context.isExisting = await this.isExistingProject(context.path);

    if (context.isExisting) {
      console.log('  检测到现有项目，正在分析...');
      
      // 读取package.json
      context.packageJson = await this.readPackageJson(context.path);
      
      // 检测项目类型
      context.type = await this.detectProjectType(context);
      console.log(`  项目类型: ${context.type}`);
      
      // 分析目录结构
      context.structure = await this.analyzeStructure(context.path);
      console.log(`  目录结构: ${Object.keys(context.structure).length}个主要目录`);
      
      // 检测技术栈
      context.techStack = await this.detectTechStack(context);
      console.log(`  技术栈: ${Object.keys(context.techStack).join(', ')}`);
      
      // 读取代码库
      context.codebase = await this.readCodebase(context.path);
      console.log(`  代码文件: ${this.countFiles(context.codebase)}个`);
    } else {
      console.log('  新项目模式');
    }

    return context;
  }

  async isExistingProject(projectPath) {
    const indicators = [
      'package.json',
      'src',
      '.git'
    ];

    for (const indicator of indicators) {
      if (await fs.pathExists(path.join(projectPath, indicator))) {
        return true;
      }
    }

    return false;
  }

  async readPackageJson(projectPath) {
    try {
      const pkgPath = path.join(projectPath, 'package.json');
      if (await fs.pathExists(pkgPath)) {
        return await fs.readJSON(pkgPath);
      }
    } catch (error) {
      console.warn('  无法读取package.json:', error.message);
    }
    return null;
  }

  async detectProjectType(context) {
    const { packageJson } = context;
    
    if (!packageJson) return 'unknown';

    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

    if (deps.react) return 'react';
    if (deps.vue) return 'vue';
    if (deps['@angular/core']) return 'angular';
    if (deps.express) return 'express';
    if (deps['@nestjs/core']) return 'nestjs';
    if (deps.koa) return 'koa';
    if (deps.next) return 'nextjs';

    return 'node';
  }

  async analyzeStructure(projectPath) {
    const structure = {
      backend: [],
      frontend: [],
      tests: [],
      docs: [],
      config: []
    };

    try {
      const srcPath = path.join(projectPath, 'src');
      if (await fs.pathExists(srcPath)) {
        const dirs = await this.scanDirectories(srcPath);
        
        for (const dir of dirs) {
          const dirName = path.basename(dir).toLowerCase();
          
          if (dirName.includes('controller') || dirName.includes('service') || 
              dirName.includes('model') || dirName.includes('route')) {
            structure.backend.push(dir);
          } else if (dirName.includes('component') || dirName.includes('page') || 
                     dirName.includes('view')) {
            structure.frontend.push(dir);
          } else if (dirName.includes('test') || dirName.includes('spec')) {
            structure.tests.push(dir);
          }
        }
      }

      // 检查docs目录
      const docsPath = path.join(projectPath, 'docs');
      if (await fs.pathExists(docsPath)) {
        structure.docs.push(docsPath);
      }

      // 检查配置文件
      const configFiles = ['tsconfig.json', 'webpack.config.js', '.env'];
      for (const file of configFiles) {
        if (await fs.pathExists(path.join(projectPath, file))) {
          structure.config.push(file);
        }
      }
    } catch (error) {
      console.warn('  分析目录结构失败:', error.message);
    }

    return structure;
  }

  async scanDirectories(dirPath, depth = 0, maxDepth = 3) {
    if (depth > maxDepth) return [];
    
    const dirs = [];
    
    try {
      const items = await fs.readdir(dirPath);
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stat = await fs.stat(itemPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          dirs.push(itemPath);
          const subDirs = await this.scanDirectories(itemPath, depth + 1, maxDepth);
          dirs.push(...subDirs);
        }
      }
    } catch (error) {
      // 忽略权限错误
    }
    
    return dirs;
  }

  async detectTechStack(context) {
    const { packageJson } = context;
    const techStack = {};

    if (!packageJson) return techStack;

    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

    // 后端框架
    if (deps.express) techStack.backend = 'Express';
    if (deps['@nestjs/core']) techStack.backend = 'NestJS';
    if (deps.koa) techStack.backend = 'Koa';

    // 前端框架
    if (deps.react) techStack.frontend = 'React';
    if (deps.vue) techStack.frontend = 'Vue';
    if (deps['@angular/core']) techStack.frontend = 'Angular';

    // 数据库
    if (deps.mongoose) techStack.database = 'MongoDB';
    if (deps.pg || deps['pg-promise']) techStack.database = 'PostgreSQL';
    if (deps.mysql || deps.mysql2) techStack.database = 'MySQL';
    if (deps.prisma) techStack.orm = 'Prisma';
    if (deps.typeorm) techStack.orm = 'TypeORM';

    // 语言
    if (deps.typescript || packageJson.devDependencies?.typescript) {
      techStack.language = 'TypeScript';
    } else {
      techStack.language = 'JavaScript';
    }

    // UI库
    if (deps['@mui/material']) techStack.ui = 'Material-UI';
    if (deps['antd']) techStack.ui = 'Ant Design';
    if (deps['tailwindcss']) techStack.ui = 'Tailwind CSS';

    return techStack;
  }

  async readCodebase(projectPath) {
    const codebase = {
      routes: [],
      controllers: [],
      services: [],
      models: [],
      components: [],
      pages: []
    };

    try {
      const srcPath = path.join(projectPath, 'src');
      if (await fs.pathExists(srcPath)) {
        const files = await this.findKeyFiles(srcPath);
        
        for (const file of files) {
          const content = await fs.readFile(file, 'utf-8');
          const type = this.classifyFile(file);
          const relativePath = path.relative(projectPath, file);
          
          if (type && codebase[type]) {
            codebase[type].push({
              path: relativePath,
              content: content.substring(0, 500) // 只读取前500字符
            });
          }
        }
      }
    } catch (error) {
      console.warn('  读取代码库失败:', error.message);
    }

    return codebase;
  }

  async findKeyFiles(dirPath, maxFiles = 20) {
    const files = [];
    const extensions = ['.js', '.ts', '.jsx', '.tsx'];

    try {
      const items = await fs.readdir(dirPath);
      
      for (const item of items) {
        if (files.length >= maxFiles) break;
        
        const itemPath = path.join(dirPath, item);
        const stat = await fs.stat(itemPath);
        
        if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
          files.push(itemPath);
        } else if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          const subFiles = await this.findKeyFiles(itemPath, maxFiles - files.length);
          files.push(...subFiles);
        }
      }
    } catch (error) {
      // 忽略错误
    }

    return files;
  }

  classifyFile(filePath) {
    const fileName = path.basename(filePath).toLowerCase();
    
    if (fileName.includes('route')) return 'routes';
    if (fileName.includes('controller')) return 'controllers';
    if (fileName.includes('service')) return 'services';
    if (fileName.includes('model')) return 'models';
    if (fileName.includes('component')) return 'components';
    if (fileName.includes('page')) return 'pages';
    
    return null;
  }

  countFiles(codebase) {
    return Object.values(codebase).reduce((sum, files) => sum + files.length, 0);
  }

  formatContext(context) {
    return `
项目信息：
- 路径: ${context.path}
- 类型: ${context.type}
- 是否现有项目: ${context.isExisting ? '是' : '否'}

${context.isExisting ? `
技术栈:
${Object.entries(context.techStack).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

目录结构:
- 后端: ${context.structure.backend.length}个目录
- 前端: ${context.structure.frontend.length}个目录
- 测试: ${context.structure.tests.length}个目录
- 文档: ${context.structure.docs.length}个目录

代码库:
- 路由: ${context.codebase.routes.length}个
- 控制器: ${context.codebase.controllers.length}个
- 服务: ${context.codebase.services.length}个
- 模型: ${context.codebase.models.length}个
- 组件: ${context.codebase.components.length}个
` : ''}
`.trim();
  }
}

module.exports = { ProjectAnalyzer };
