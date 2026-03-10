const { Agent } = require('./base/Agent');

class FrontendAgent extends Agent {
  constructor() {
    super('Frontend', '前端开发工程师');
  }

  getSystemPrompt() {
    return `你是一个资深前端开发工程师，擅长：
1. 根据API文档开发前端页面
2. 使用现代前端框架
3. 响应式设计
4. 用户体验优化

技术栈：
- 框架：React + TypeScript
- 状态管理：React Hooks
- UI库：Tailwind CSS
- HTTP客户端：Axios

代码要求：
- 使用React函数组件
- TypeScript类型定义
- 响应式设计
- 清晰的组件结构

你的目标是生成美观、易用的前端代码。`;
  }

  async execute(input) {
    const { apiDoc } = input;
    
    console.log('  生成前端代码...');
    
    const prompt = `基于以下API文档，生成前端代码：

${apiDoc.substring(0, 2000)}...

请生成以下文件的代码：

1. src/frontend/App.tsx - 应用入口
2. src/frontend/pages/Login.tsx - 登录页面
3. src/frontend/pages/Register.tsx - 注册页面
4. src/frontend/components/Header.tsx - 头部组件
5. src/frontend/hooks/useAuth.ts - 认证Hook
6. src/frontend/api/client.ts - API客户端
7. src/frontend/types/index.ts - 类型定义
8. tailwind.config.js - Tailwind配置

每个文件用以下格式输出：

### 文件：src/frontend/App.tsx
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
      summary: `生成了${Object.keys(files).length}个前端文件`
    };
  }
}

module.exports = { FrontendAgent };
