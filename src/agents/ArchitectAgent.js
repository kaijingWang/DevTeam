const { Agent } = require('./base/Agent');

class ArchitectAgent extends Agent {
  constructor() {
    super('Architect', '架构师');
  }

  getSystemPrompt() {
    return `你是一个资深架构师，擅长：
1. 技术选型（考虑项目规模和复杂度）
2. 系统架构设计（前后端分离/单体/微服务）
3. 模块划分和接口设计
4. 数据库设计
5. 技术难点分析和解决方案

输出格式要求：
- 使用Markdown格式
- 包含架构图（使用文字描述）
- 技术栈选择要有理由
- 考虑可扩展性和可维护性

你的目标是设计出清晰、可行的技术方案。`;
  }

  async execute(input) {
    const { prd } = input;
    
    console.log('  设计技术方案...');
    
    const prompt = `基于以下PRD文档，设计技术方案：

${prd}

技术方案文档应包含：

# 技术方案文档

## 1. 技术栈选型

### 后端
- 语言：（推荐TypeScript/Node.js或Python）
- 框架：（Express/Fastify/FastAPI等）
- 数据库：（PostgreSQL/MySQL/MongoDB）
- 缓存：（Redis）
- 其他：

### 前端
- 框架：（React/Vue/Next.js）
- 状态管理：
- UI库：
- 构建工具：

### 基础设施
- 部署：
- CI/CD：
- 监控：

## 2. 系统架构

\`\`\`
[用文字描述架构图]
前端 <-> API网关 <-> 后端服务 <-> 数据库
                  <-> 缓存
\`\`\`

## 3. 模块设计

### 3.1 用户模块
- 功能：
- 接口：
- 数据表：

### 3.2 其他模块
...

## 4. 数据库设计

### 表结构
\`\`\`sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  ...
);
\`\`\`

## 5. 技术难点和解决方案

### 难点1：...
解决方案：...

## 6. 性能优化方案

## 7. 安全方案

请生成完整的技术方案文档。`;

    let techDoc = "";
    await this.chat(prompt, null, {
      stream: true,
      onChunk: (chunk) => {
        process.stdout.write(chunk);
        techDoc += chunk;
      }
    });
    console.log("\n");
    
    // 保存技术方案
    await this.saveOutput('docs/TECH.md', techDoc);
    
    return {
      techDoc,
      summary: this.extractTechStack(techDoc)
    };
  }

  extractTechStack(techDoc) {
    const lines = techDoc.split('\n');
    const techStack = [];
    
    let inTechStack = false;
    for (const line of lines) {
      if (line.includes('技术栈') || line.includes('Technology Stack')) {
        inTechStack = true;
      }
      if (inTechStack && line.trim().startsWith('-')) {
        techStack.push(line.trim());
        if (techStack.length >= 5) break;
      }
    }
    
    return techStack.join('\n');
  }
}

module.exports = { ArchitectAgent };
