const { ClaudeProvider } = require('../llm/ClaudeProvider');
const fs = require('fs-extra');
const path = require('path');

class DocsGenerator {
  constructor() {
    this.llm = new ClaudeProvider();
  }

  async generateReadme(projectPath = '.') {
    console.log('\n📝 生成README.md...\n');

    // 分析项目
    const analysis = await this.analyzeProject(projectPath);
    
    const prompt = `基于以下项目信息生成README.md：

项目名称: ${analysis.name}
项目类型: ${analysis.type}
技术栈: ${analysis.techStack.join(', ')}
依赖: ${analysis.dependencies.slice(0, 10).join(', ')}

请生成一个完整的README.md，包括:
1. 项目标题和描述
2. 功能特性
3. 技术栈
4. 安装步骤
5. 使用方法
6. 配置说明
7. 开发指南
8. 贡献指南
9. 许可证

使用Markdown格式，专业且易读。`;

    const content = await this.llm.chat([
      {
        role: 'system',
        content: '你是一个技术文档专家，擅长编写清晰、专业的项目文档。'
      },
      {
        role: 'user',
        content: prompt
      }
    ]);

    await fs.writeFile(path.join(projectPath, 'README.md'), content, 'utf-8');
    console.log('  ✓ README.md 已生成\n');

    return content;
  }

  async generateApiDocs(projectPath = '.') {
    console.log('\n📝 生成API文档...\n');

    // 扫描API路由
    const routes = await this.scanRoutes(projectPath);

    const prompt = `基于以下API路由生成API文档：

${routes.map(r => `- ${r.method} ${r.path}`).join('\n')}

请生成完整的API文档，包括:
1. API概述
2. 认证方式
3. 每个端点的详细说明
4. 请求参数
5. 响应格式
6. 错误码
7. 示例代码

使用Markdown格式。`;

    const content = await this.llm.chat([
      {
        role: 'system',
        content: '你是一个API文档专家，擅长编写清晰的API文档。'
      },
      {
        role: 'user',
        content: prompt
      }
    ]);

    await fs.writeFile(path.join(projectPath, 'docs/API.md'), content, 'utf-8');
    console.log('  ✓ API.md 已生成\n');

    return content;
  }

  async generateDeployDocs(projectPath = '.') {
    console.log('\n📝 生成部署文档...\n');

    const analysis = await this.analyzeProject(projectPath);

    const prompt = `为以下项目生成部署文档：

项目类型: ${analysis.type}
技术栈: ${analysis.techStack.join(', ')}

请生成部署文档，包括:
1. 环境要求
2. 依赖安装
3. 配置说明
4. 构建步骤
5. 部署到各平台的指南 (Vercel, Netlify, Docker等)
6. 常见问题
7. 故障排查

使用Markdown格式。`;

    const content = await this.llm.chat([
      {
        role: 'system',
        content: '你是一个DevOps专家，擅长编写部署文档。'
      },
      {
        role: 'user',
        content: prompt
      }
    ]);

    await fs.ensureDir(path.join(projectPath, 'docs'));
    await fs.writeFile(path.join(projectPath, 'docs/DEPLOY.md'), content, 'utf-8');
    console.log('  ✓ DEPLOY.md 已生成\n');

    return content;
  }

  async analyzeProject(projectPath) {
    const analysis = {
      name: 'my-project',
      type: 'unknown',
      techStack: [],
      dependencies: []
    };

    try {
      const pkgPath = path.join(projectPath, 'package.json');
      if (await fs.pathExists(pkgPath)) {
        const pkg = await fs.readJSON(pkgPath);
        analysis.name = pkg.name || 'my-project';
        
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };
        analysis.dependencies = Object.keys(deps);

        // 检测技术栈
        if (deps.react) analysis.techStack.push('React');
        if (deps.vue) analysis.techStack.push('Vue');
        if (deps.express) analysis.techStack.push('Express');
        if (deps.next) analysis.techStack.push('Next.js');
        if (deps.typescript) analysis.techStack.push('TypeScript');
      }
    } catch (error) {
      // 忽略错误
    }

    return analysis;
  }

  async scanRoutes(projectPath) {
    const routes = [];
    
    // 简单实现：扫描routes目录
    const routesDir = path.join(projectPath, 'src/routes');
    
    if (await fs.pathExists(routesDir)) {
      const files = await fs.readdir(routesDir);
      
      for (const file of files) {
        const content = await fs.readFile(path.join(routesDir, file), 'utf-8');
        
        // 简单提取路由（实际应该更复杂）
        const getMatches = content.match(/router\.get\(['"]([^'"]+)['"]/g);
        const postMatches = content.match(/router\.post\(['"]([^'"]+)['"]/g);
        
        if (getMatches) {
          getMatches.forEach(m => {
            const path = m.match(/['"]([^'"]+)['"]/)[1];
            routes.push({ method: 'GET', path });
          });
        }
        
        if (postMatches) {
          postMatches.forEach(m => {
            const path = m.match(/['"]([^'"]+)['"]/)[1];
            routes.push({ method: 'POST', path });
          });
        }
      }
    }

    return routes;
  }
}

module.exports = { DocsGenerator };
