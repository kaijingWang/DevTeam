const { Agent } = require('./base/Agent');

class BackendAgent extends Agent {
  constructor() {
    super('Backend', '后端工程师');
  }

  getSystemPrompt() {
    return `你是一个资深后端工程师，精通Node.js、TypeScript、数据库设计。

核心能力：
1. 设计RESTful API
2. 实现业务逻辑
3. 数据库设计和优化
4. 性能优化和安全防护

代码规范：
- 使用TypeScript，不要用any
- 使用async/await处理异步
- 使用Express或Fastify框架
- 使用Prisma或TypeORM操作数据库
- 完整的错误处理
- 完整的输入验证
- 完整的日志记录

必须生成的文件：
1. src/server.ts - 服务器入口
2. src/routes/*.ts - 路由定义
3. src/controllers/*.ts - 控制器
4. src/services/*.ts - 业务逻辑
5. src/models/*.ts - 数据模型
6. src/middleware/*.ts - 中间件
7. src/utils/*.ts - 工具函数
8. src/types/index.ts - 类型定义
9. .env.example - 环境变量示例
10. package.json - 依赖配置
11. tsconfig.json - TypeScript配置

输出格式：
每个文件使用以下格式：

### src/server.ts
\`\`\`typescript
// 完整的代码
\`\`\`

重要提示：
- 确保所有导入路径正确
- 确保所有类型定义完整
- 确保代码可以通过TypeScript检查
- 确保有完整的错误处理
- 确保有输入验证

你的目标是生成一个可以立即运行的完整后端项目。`;
  }

  async execute(input) {
    const { requirement, architecture, apiDesign } = input;
    
    console.log('  生成后端代码...');
    
    const prompt = `请根据以下信息生成完整的后端代码：

需求：${requirement}

技术架构：
${architecture}

API设计：
${apiDesign}

请生成以下所有文件的完整代码：

1. **配置文件**：
   - package.json（包含所有必需依赖）
   - tsconfig.json（TypeScript配置）
   - .env.example（环境变量示例）
   - .gitignore

2. **服务器入口**：
   - src/server.ts（Express服务器）
   - src/app.ts（应用配置）

3. **路由**：
   - src/routes/index.ts（路由汇总）
   - src/routes/*.ts（各模块路由）

4. **控制器**：
   - src/controllers/*.ts（处理HTTP请求）

5. **服务层**：
   - src/services/*.ts（业务逻辑）

6. **数据模型**：
   - src/models/*.ts（数据模型定义）

7. **中间件**：
   - src/middleware/errorHandler.ts（错误处理）
   - src/middleware/validator.ts（输入验证）
   - src/middleware/auth.ts（认证，如果需要）

8. **工具函数**：
   - src/utils/*.ts

9. **类型定义**：
   - src/types/index.ts

请确保：
- 所有文件路径正确
- 所有导入语句正确
- 所有类型定义完整
- 代码可以通过TypeScript检查
- 有完整的错误处理
- 有输入验证
- package.json包含所有必需的依赖

现在开始生成完整的代码：`;

    // 使用流式输出
    let code = '';
    await this.chat(prompt, null, {
      stream: true,
      onChunk: (chunk) => {
        process.stdout.write(chunk);
        code += chunk;
      }
    });
    
    console.log('\n');
    
    // 解析生成的代码并保存文件
    await this.parseAndSaveFiles(code);
    
    return {
      code,
      summary: '后端代码已生成'
    };
  }

  async parseAndSaveFiles(code) {
    // 解析Markdown格式的代码块
    const fileRegex = /###\s+(.+?)\n```(?:typescript|javascript|json|env)?\n([\s\S]+?)```/g;
    let match;
    let fileCount = 0;

    while ((match = fileRegex.exec(code)) !== null) {
      const filePath = match[1].trim();
      const fileContent = match[2].trim();
      
      try {
        await this.saveOutput(filePath, fileContent);
        fileCount++;
        console.log(`  ✓ 已保存: ${filePath}`);
      } catch (error) {
        console.error(`  ✗ 保存失败: ${filePath}`, error.message);
      }
    }

    console.log(`\n✅ 后端代码已生成: ${fileCount}个文件`);
  }
}

module.exports = { BackendAgent };
