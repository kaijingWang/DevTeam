const { Agent } = require('./base/Agent');

class BackendAgent extends Agent {
  constructor() {
    super('Backend', '后端开发工程师');
  }

  getSystemPrompt() {
    return `你是一个资深后端开发工程师，擅长：
1. 根据API文档编写高质量代码
2. 遵循最佳实践和设计模式
3. 编写清晰的注释和文档
4. 考虑错误处理和边界情况

技术栈：
- 语言：TypeScript/Node.js
- 框架：Express
- 数据库：PostgreSQL
- ORM：Prisma

代码要求：
- 使用TypeScript
- 遵循RESTful规范
- 完整的错误处理
- 输入验证
- 清晰的注释

你的目标是生成可直接运行的后端代码。`;
  }

  async execute(input) {
    const { apiDoc, techDoc } = input;
    
    console.log('  生成后端代码...');
    
    const prompt = `基于以下API文档和技术方案，生成后端代码：

API文档：
${apiDoc.substring(0, 2000)}...

技术方案：
${techDoc.substring(0, 1000)}...

请生成以下文件的代码：

1. src/backend/app.ts - Express应用入口
2. src/backend/routes/index.ts - 路由定义
3. src/backend/controllers/user.controller.ts - 用户控制器
4. src/backend/services/user.service.ts - 用户服务
5. src/backend/models/user.model.ts - 用户模型
6. src/backend/middleware/auth.ts - 认证中间件
7. src/backend/utils/response.ts - 响应工具
8. package.json - 依赖配置

每个文件用以下格式输出：

### 文件：src/backend/app.ts
\`\`\`typescript
// 代码内容
\`\`\`

请生成所有文件的代码。`;

    const code = await this.chat(prompt);
    
    // 解析并保存代码文件
    const files = this.parseCodeBlocks(code);
    
    for (const [filename, content] of Object.entries(files)) {
      await this.saveOutput(filename, content);
    }
    
    return {
      files: Object.keys(files),
      summary: `生成了${Object.keys(files).length}个后端文件`
    };
  }

  parseCodeBlocks(text) {
    const files = {};
    const lines = text.split('\n');
    
    let currentFile = null;
    let currentCode = [];
    let inCodeBlock = false;
    
    for (const line of lines) {
      // 检测文件名
      if (line.includes('文件：') || line.includes('File:')) {
        if (currentFile && currentCode.length > 0) {
          files[currentFile] = currentCode.join('\n');
        }
        
        const match = line.match(/[：:]\s*(.+)/);
        if (match) {
          currentFile = match[1].trim();
          currentCode = [];
          inCodeBlock = false;
        }
      }
      // 检测代码块
      else if (line.trim().startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        if (!inCodeBlock && currentFile) {
          // 代码块结束
        }
      }
      // 收集代码
      else if (inCodeBlock && currentFile) {
        currentCode.push(line);
      }
    }
    
    // 保存最后一个文件
    if (currentFile && currentCode.length > 0) {
      files[currentFile] = currentCode.join('\n');
    }
    
    return files;
  }
}

module.exports = { BackendAgent };
