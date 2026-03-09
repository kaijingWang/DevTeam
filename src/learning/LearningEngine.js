const fs = require('fs-extra');
const path = require('path');

class LearningEngine {
  constructor() {
    this.profilePath = path.join(
      process.env.HOME || process.env.USERPROFILE,
      '.devteam/profile.json'
    );
    this.profile = null;
  }

  async init() {
    await this.loadProfile();
  }

  async loadProfile() {
    try {
      if (await fs.pathExists(this.profilePath)) {
        this.profile = await fs.readJSON(this.profilePath);
      } else {
        this.profile = this.createDefaultProfile();
        await this.saveProfile();
      }
    } catch (error) {
      this.profile = this.createDefaultProfile();
    }
  }

  createDefaultProfile() {
    return {
      version: '1.0',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      
      // 编码风格
      codingStyle: {
        indentation: 'spaces', // spaces | tabs
        indentSize: 2,
        quotes: 'single', // single | double
        semicolons: true,
        trailingComma: 'es5', // none | es5 | all
        arrowParens: 'avoid' // avoid | always
      },

      // 技术栈偏好
      techStack: {
        frontend: [],
        backend: [],
        database: [],
        tools: []
      },

      // 命名习惯
      namingConventions: {
        variables: 'camelCase', // camelCase | snake_case
        functions: 'camelCase',
        classes: 'PascalCase',
        constants: 'UPPER_CASE',
        files: 'kebab-case' // kebab-case | camelCase | PascalCase
      },

      // 架构偏好
      architecture: {
        pattern: 'mvc', // mvc | mvvm | clean | layered
        folderStructure: 'feature', // feature | type
        testLocation: 'alongside' // alongside | separate
      },

      // 使用统计
      stats: {
        totalCommands: 0,
        totalProjects: 0,
        favoriteCommands: {},
        recentProjects: []
      }
    };
  }

  async learnFromCode(projectPath) {
    console.log('\n🧠 分析代码风格...\n');

    try {
      // 分析代码文件
      const files = await this.findCodeFiles(projectPath);
      
      if (files.length === 0) {
        console.log('  ⚠️  未找到代码文件\n');
        return;
      }

      const analysis = {
        indentation: {},
        quotes: {},
        semicolons: { yes: 0, no: 0 },
        naming: {}
      };

      for (const file of files.slice(0, 20)) {
        const content = await fs.readFile(file, 'utf-8');
        this.analyzeCodeStyle(content, analysis);
      }

      // 更新配置
      this.updateStyleFromAnalysis(analysis);
      
      await this.saveProfile();

      console.log('  ✓ 学习完成\n');
      this.displayLearnedStyle();
    } catch (error) {
      console.error('  ✗ 学习失败:', error.message, '\n');
    }
  }

  analyzeCodeStyle(content, analysis) {
    // 分析缩进
    const lines = content.split('\n');
    for (const line of lines) {
      if (line.startsWith('  ')) {
        analysis.indentation.spaces = (analysis.indentation.spaces || 0) + 1;
      } else if (line.startsWith('\t')) {
        analysis.indentation.tabs = (analysis.indentation.tabs || 0) + 1;
      }
    }

    // 分析引号
    const singleQuotes = (content.match(/'/g) || []).length;
    const doubleQuotes = (content.match(/"/g) || []).length;
    analysis.quotes.single = (analysis.quotes.single || 0) + singleQuotes;
    analysis.quotes.double = (analysis.quotes.double || 0) + doubleQuotes;

    // 分析分号
    const withSemicolon = (content.match(/;$/gm) || []).length;
    const withoutSemicolon = (content.match(/[^;]$/gm) || []).length;
    analysis.semicolons.yes += withSemicolon;
    analysis.semicolons.no += withoutSemicolon;
  }

  updateStyleFromAnalysis(analysis) {
    // 更新缩进
    if (analysis.indentation.spaces > analysis.indentation.tabs) {
      this.profile.codingStyle.indentation = 'spaces';
    } else if (analysis.indentation.tabs > 0) {
      this.profile.codingStyle.indentation = 'tabs';
    }

    // 更新引号
    if (analysis.quotes.single > analysis.quotes.double) {
      this.profile.codingStyle.quotes = 'single';
    } else if (analysis.quotes.double > 0) {
      this.profile.codingStyle.quotes = 'double';
    }

    // 更新分号
    this.profile.codingStyle.semicolons = analysis.semicolons.yes > analysis.semicolons.no;

    this.profile.updatedAt = Date.now();
  }

  displayLearnedStyle() {
    console.log('📊 学习到的编码风格:\n');
    console.log(`  缩进: ${this.profile.codingStyle.indentation} (${this.profile.codingStyle.indentSize})`);
    console.log(`  引号: ${this.profile.codingStyle.quotes}`);
    console.log(`  分号: ${this.profile.codingStyle.semicolons ? '使用' : '不使用'}`);
    console.log();
  }

  async findCodeFiles(dir) {
    const files = [];
    const extensions = ['.js', '.ts', '.jsx', '.tsx'];

    async function scan(currentDir) {
      if (!await fs.pathExists(currentDir)) return;

      const items = await fs.readdir(currentDir);

      for (const item of items) {
        if (item === 'node_modules' || item.startsWith('.')) continue;

        const itemPath = path.join(currentDir, item);
        const stat = await fs.stat(itemPath);

        if (stat.isDirectory()) {
          await scan(itemPath);
        } else if (extensions.some(ext => item.endsWith(ext))) {
          files.push(itemPath);
        }
      }
    }

    await scan(dir);
    return files;
  }

  async recordCommand(command) {
    this.profile.stats.totalCommands++;
    this.profile.stats.favoriteCommands[command] = 
      (this.profile.stats.favoriteCommands[command] || 0) + 1;
    this.profile.updatedAt = Date.now();
    await this.saveProfile();
  }

  async recordProject(projectPath) {
    this.profile.stats.totalProjects++;
    
    // 添加到最近项目
    const recent = this.profile.stats.recentProjects;
    const index = recent.indexOf(projectPath);
    
    if (index > -1) {
      recent.splice(index, 1);
    }
    
    recent.unshift(projectPath);
    
    // 只保留最近10个
    if (recent.length > 10) {
      recent.pop();
    }

    this.profile.updatedAt = Date.now();
    await this.saveProfile();
  }

  getRecommendations() {
    const recommendations = [];

    // 基于使用频率推荐
    const commands = Object.entries(this.profile.stats.favoriteCommands)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    if (commands.length > 0) {
      recommendations.push({
        type: 'command',
        title: '常用命令',
        items: commands.map(([cmd, count]) => `${cmd} (使用${count}次)`)
      });
    }

    // 基于最近项目推荐
    if (this.profile.stats.recentProjects.length > 0) {
      recommendations.push({
        type: 'project',
        title: '最近项目',
        items: this.profile.stats.recentProjects.slice(0, 5)
      });
    }

    return recommendations;
  }

  async saveProfile() {
    await fs.ensureDir(path.dirname(this.profilePath));
    await fs.writeJSON(this.profilePath, this.profile, { spaces: 2 });
  }

  getProfile() {
    return this.profile;
  }
}

// 全局实例
let learningEngine = null;

function getLearningEngine() {
  if (!learningEngine) {
    learningEngine = new LearningEngine();
  }
  return learningEngine;
}

module.exports = { LearningEngine, getLearningEngine };
