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
- 使用TypeScript严格模式
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

    let code = "";
    await this.chat(prompt, null, {
      stream: true,
      onChunk: (chunk) => {
        process.stdout.write(chunk);
        code += chunk;
      }
    });
    console.log("\n");
    
    // 使用统一的代码解析器
    const files = this.parseCodeBlocks(code);
    
    for (const [filename, content] of Object.entries(files)) {
      await this.saveOutput(filename, content);
    }
    
    return {
      files: Object.keys(files),
      summary: `生成了${Object.keys(files).length}个后端文件`
    };
  }
}

module.exports = { BackendAgent };
