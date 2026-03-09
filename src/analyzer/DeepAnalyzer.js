const fs = require('fs-extra');
const path = require('path');

class DeepAnalyzer {
  async analyze(projectPath) {
    const analysis = {
      basic: null,
      progress: null,
      quality: null,
      issues: [],
      missing: [],
      suggestions: []
    };

    // 基础分析
    analysis.basic = await this.analyzeBasic(projectPath);
    
    // 开发进度
    analysis.progress = await this.analyzeProgress(projectPath);
    
    // 代码质量
    analysis.quality = await this.analyzeQuality(projectPath);
    
    // 潜在问题
    analysis.issues = await this.detectIssues(projectPath, analysis);
    
    // 缺失功能
    analysis.missing = await this.detectMissing(projectPath);
    
    // 生成建议
    analysis.suggestions = this.generateSuggestions(analysis);

    return analysis;
  }

  async analyzeBasic(projectPath) {
    const basic = {
      type: 'unknown',
      techStack: {},
      fileCount: 0,
      lineCount: 0,
      size: 0
    };

    try {
      // 读取package.json
      const pkgPath = path.join(projectPath, 'package.json');
      if (await fs.pathExists(pkgPath)) {
        const pkg = await fs.readJSON(pkgPath);
        
        // 检测技术栈
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };
        
        if (deps.express) basic.type = 'express';
        if (deps.react) basic.techStack.frontend = 'React';
        if (deps.typescript) basic.techStack.language = 'TypeScript';
        
        basic.techStack = this.detectTechStack(deps);
      }

      // 统计文件
      const stats = await this.countFiles(projectPath);
      basic.fileCount = stats.fileCount;
      basic.lineCount = stats.lineCount;
      basic.size = stats.size;

    } catch (error) {
      console.warn('基础分析失败:', error.message);
    }

    return basic;
  }

  async analyzeProgress(projectPath) {
    const progress = {
      completedModules: [],
      inProgressModules: [],
      todoModules: [],
      completionRate: 0
    };

    try {
      // 1. 查找TODO注释
      const todos = await this.findTODOComments(projectPath);
      progress.todoModules = todos;

      // 2. 分析路由（已实现的功能）
      const routes = await this.analyzeRoutes(projectPath);
      progress.completedModules = routes;

      // 3. 计算完成度
      const total = progress.completedModules.length + progress.todoModules.length;
      if (total > 0) {
        progress.completionRate = Math.round(
          (progress.completedModules.length / total) * 100
        );
      }

    } catch (error) {
      console.warn('进度分析失败:', error.message);
    }

    return progress;
  }

  async analyzeQuality(projectPath) {
    const quality = {
      syntaxErrors: [],
      typeErrors: [],
      lintIssues: [],
      securityIssues: [],
      score: 100
    };

    try {
      // 1. 检查package.json中的问题
      const pkgIssues = await this.checkPackageJson(projectPath);
      quality.lintIssues.push(...pkgIssues);

      // 2. 检查是否有TypeScript错误
      if (await this.hasTypeScript(projectPath)) {
        const tsIssues = await this.checkTypeScriptConfig(projectPath);
        quality.typeErrors.push(...tsIssues);
      }

      // 3. 检查依赖安全性
      const secIssues = await this.checkDependencySecurity(projectPath);
      quality.securityIssues.push(...secIssues);

      // 4. 计算质量分数
      quality.score = this.calculateQualityScore(quality);

    } catch (error) {
      console.warn('质量分析失败:', error.message);
    }

    return quality;
  }

  async detectIssues(projectPath, analysis) {
    const issues = [];

    try {
      // 1. 检查依赖问题
      const depIssues = await this.checkDependencies(projectPath);
      issues.push(...depIssues);

      // 2. 检查配置问题
      const configIssues = await this.checkConfig(projectPath);
      issues.push(...configIssues);

      // 3. 检查代码问题
      if (analysis.quality.syntaxErrors.length > 0) {
        issues.push({
          type: 'syntax',
          severity: 'critical',
          message: `发现${analysis.quality.syntaxErrors.length}个语法错误`,
          count: analysis.quality.syntaxErrors.length
        });
      }

      if (analysis.quality.securityIssues.length > 0) {
        issues.push({
          type: 'security',
          severity: 'critical',
          message: `发现${analysis.quality.securityIssues.length}个安全问题`,
          count: analysis.quality.securityIssues.length
        });
      }

    } catch (error) {
      console.warn('问题检测失败:', error.message);
    }

    return issues;
  }

  async detectMissing(projectPath) {
    const missing = [];

    try {
      // 检查核心文件
      const requiredFiles = {
        'README.md': { severity: 'high', name: 'README文档' },
        '.gitignore': { severity: 'medium', name: 'Git忽略配置' },
        'LICENSE': { severity: 'low', name: '开源协议' }
      };

      for (const [file, info] of Object.entries(requiredFiles)) {
        if (!await fs.pathExists(path.join(projectPath, file))) {
          missing.push({
            type: 'file',
            name: info.name,
            severity: info.severity,
            file
          });
        }
      }

      // 检查目录
      const requiredDirs = {
        'tests': { severity: 'high', name: '测试' },
        'docs': { severity: 'medium', name: '文档' }
      };

      for (const [dir, info] of Object.entries(requiredDirs)) {
        if (!await fs.pathExists(path.join(projectPath, dir))) {
          missing.push({
            type: 'directory',
            name: info.name,
            severity: info.severity,
            dir
          });
        }
      }

    } catch (error) {
      console.warn('缺失检测失败:', error.message);
    }

    return missing;
  }

  generateSuggestions(analysis) {
    const suggestions = [];

    // 基于进度
    if (analysis.progress.completionRate < 50) {
      suggestions.push({
        type: 'progress',
        priority: 'high',
        message: `项目完成度${analysis.progress.completionRate}%，建议优先完成核心功能`
      });
    }

    // 基于质量
    if (analysis.quality.score < 60) {
      suggestions.push({
        type: 'quality',
        priority: 'high',
        message: `代码质量分数${analysis.quality.score}，建议进行代码重构`
      });
    }

    if (analysis.quality.securityIssues.length > 0) {
      suggestions.push({
        type: 'security',
        priority: 'critical',
        message: `发现${analysis.quality.securityIssues.length}个安全问题，建议立即修复`
      });
    }

    // 基于缺失
    const missingTests = analysis.missing.find(m => m.name === '测试');
    if (missingTests) {
      suggestions.push({
        type: 'missing',
        priority: 'high',
        message: '项目缺少测试，建议添加单元测试和集成测试'
      });
    }

    const missingDocs = analysis.missing.find(m => m.name === 'README文档');
    if (missingDocs) {
      suggestions.push({
        type: 'missing',
        priority: 'medium',
        message: '项目缺少README文档，建议添加项目说明'
      });
    }

    return suggestions;
  }

  // 辅助方法

  detectTechStack(deps) {
    const stack = {};

    // 后端
    if (deps.express) stack.backend = 'Express';
    if (deps['@nestjs/core']) stack.backend = 'NestJS';
    if (deps.koa) stack.backend = 'Koa';

    // 前端
    if (deps.react) stack.frontend = 'React';
    if (deps.vue) stack.frontend = 'Vue';
    if (deps['@angular/core']) stack.frontend = 'Angular';

    // 数据库
    if (deps.mongoose) stack.database = 'MongoDB';
    if (deps.pg) stack.database = 'PostgreSQL';
    if (deps.mysql2) stack.database = 'MySQL';

    // 语言
    if (deps.typescript) stack.language = 'TypeScript';
    else stack.language = 'JavaScript';

    return stack;
  }

  async countFiles(projectPath) {
    let fileCount = 0;
    let lineCount = 0;
    let size = 0;

    const extensions = ['.js', '.ts', '.jsx', '.tsx', '.json'];

    async function scan(dir) {
      try {
        const items = await fs.readdir(dir);

        for (const item of items) {
          if (item === 'node_modules' || item.startsWith('.')) continue;

          const itemPath = path.join(dir, item);
          const stat = await fs.stat(itemPath);

          if (stat.isDirectory()) {
            await scan(itemPath);
          } else if (extensions.some(ext => item.endsWith(ext))) {
            fileCount++;
            size += stat.size;

            const content = await fs.readFile(itemPath, 'utf-8');
            lineCount += content.split('\n').length;
          }
        }
      } catch (error) {
        // 忽略错误
      }
    }

    await scan(projectPath);

    return { fileCount, lineCount, size };
  }

  async findTODOComments(projectPath) {
    const todos = [];
    const extensions = ['.js', '.ts', '.jsx', '.tsx'];

    async function scan(dir, depth = 0) {
      if (depth > 3) return;

      try {
        const items = await fs.readdir(dir);

        for (const item of items) {
          if (item === 'node_modules' || item.startsWith('.')) continue;

          const itemPath = path.join(dir, item);
          const stat = await fs.stat(itemPath);

          if (stat.isDirectory()) {
            await scan(itemPath, depth + 1);
          } else if (extensions.some(ext => item.endsWith(ext))) {
            const content = await fs.readFile(itemPath, 'utf-8');
            const lines = content.split('\n');

            lines.forEach((line, index) => {
              if (line.includes('TODO') || line.includes('FIXME')) {
                todos.push({
                  file: path.relative(projectPath, itemPath),
                  line: index + 1,
                  text: line.trim()
                });
              }
            });
          }
        }
      } catch (error) {
        // 忽略错误
      }
    }

    await scan(projectPath);
    return todos.slice(0, 20); // 最多返回20个
  }

  async analyzeRoutes(projectPath) {
    const routes = [];

    // 简单实现：查找路由文件
    const routeFiles = ['routes', 'router', 'api'];

    for (const routeDir of routeFiles) {
      const routePath = path.join(projectPath, 'src', routeDir);
      if (await fs.pathExists(routePath)) {
        const files = await fs.readdir(routePath);
        routes.push(...files.map(f => ({ name: f, implemented: true })));
      }
    }

    return routes;
  }

  async checkPackageJson(projectPath) {
    const issues = [];

    try {
      const pkgPath = path.join(projectPath, 'package.json');
      if (await fs.pathExists(pkgPath)) {
        const pkg = await fs.readJSON(pkgPath);

        if (!pkg.name) {
          issues.push({ type: 'package', message: '缺少项目名称' });
        }

        if (!pkg.version) {
          issues.push({ type: 'package', message: '缺少版本号' });
        }

        if (!pkg.description) {
          issues.push({ type: 'package', message: '缺少项目描述' });
        }
      }
    } catch (error) {
      // 忽略
    }

    return issues;
  }

  async hasTypeScript(projectPath) {
    return await fs.pathExists(path.join(projectPath, 'tsconfig.json'));
  }

  async checkTypeScriptConfig(projectPath) {
    const issues = [];

    try {
      const tsconfigPath = path.join(projectPath, 'tsconfig.json');
      if (await fs.pathExists(tsconfigPath)) {
        const tsconfig = await fs.readJSON(tsconfigPath);

        if (!tsconfig.compilerOptions) {
          issues.push({ type: 'typescript', message: '缺少编译选项' });
        }
      }
    } catch (error) {
      issues.push({ type: 'typescript', message: 'tsconfig.json格式错误' });
    }

    return issues;
  }

  async checkDependencySecurity(projectPath) {
    const issues = [];

    // 简单实现：检查是否有package-lock.json
    const lockPath = path.join(projectPath, 'package-lock.json');
    if (!await fs.pathExists(lockPath)) {
      issues.push({
        type: 'security',
        message: '缺少package-lock.json，依赖版本不固定'
      });
    }

    return issues;
  }

  async checkDependencies(projectPath) {
    const issues = [];

    try {
      const pkgPath = path.join(projectPath, 'package.json');
      if (await fs.pathExists(pkgPath)) {
        const pkg = await fs.readJSON(pkgPath);

        // 检查是否安装了依赖
        const nodeModulesPath = path.join(projectPath, 'node_modules');
        if (!await fs.pathExists(nodeModulesPath)) {
          issues.push({
            type: 'dependency',
            severity: 'high',
            message: '依赖未安装，请运行 npm install'
          });
        }
      }
    } catch (error) {
      // 忽略
    }

    return issues;
  }

  async checkConfig(projectPath) {
    const issues = [];

    // 检查.env文件
    const envPath = path.join(projectPath, '.env');
    const envExamplePath = path.join(projectPath, '.env.example');

    if (!await fs.pathExists(envPath) && await fs.pathExists(envExamplePath)) {
      issues.push({
        type: 'config',
        severity: 'medium',
        message: '缺少.env文件，请复制.env.example并配置'
      });
    }

    return issues;
  }

  calculateQualityScore(quality) {
    let score = 100;

    // 扣分规则
    score -= quality.syntaxErrors.length * 10;
    score -= quality.typeErrors.length * 5;
    score -= quality.lintIssues.length * 2;
    score -= quality.securityIssues.length * 15;

    return Math.max(0, score);
  }
}

module.exports = { DeepAnalyzer };
