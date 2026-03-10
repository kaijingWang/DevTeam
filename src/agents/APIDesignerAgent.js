const { Agent } = require('./base/Agent');

class APIDesignerAgent extends Agent {
  constructor() {
    super('APIDesigner', 'API设计师');
  }

  getSystemPrompt() {
    return `你是一个API设计专家，擅长：
1. RESTful API设计
2. 请求/响应格式定义
3. 错误码设计
4. API文档编写

输出格式要求：
- 使用Markdown格式
- 遵循RESTful规范
- 包含完整的请求/响应示例
- 定义清晰的错误码

你的目标是设计出清晰、易用的API接口。`;
  }

  async execute(input) {
    const { techDoc } = input;
    
    console.log('  设计API接口...');
    
    const prompt = `基于以下技术方案，设计API接口：

${techDoc}

API文档应包含：

# API接口文档

## 1. 接口规范

### 基础URL
\`\`\`
http://localhost:3000/api/v1
\`\`\`

### 通用响应格式
\`\`\`json
{
  "code": 200,
  "message": "success",
  "data": {}
}
\`\`\`

### 错误码定义
- 200: 成功
- 400: 请求参数错误
- 401: 未授权
- 403: 禁止访问
- 404: 资源不存在
- 500: 服务器错误

## 2. 接口列表

### 2.1 用户模块

#### 用户注册
- 接口：POST /users/register
- 请求参数：
\`\`\`json
{
  "username": "string",
  "password": "string",
  "email": "string"
}
\`\`\`
- 响应：
\`\`\`json
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "userId": 1,
    "token": "xxx"
  }
}
\`\`\`

#### 用户登录
...

### 2.2 其他模块
...

## 3. 数据模型

### User
\`\`\`typescript
interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string;
}
\`\`\`

请生成完整的API文档。`;

    let apiDoc = "";
    await this.chat(prompt, null, {
      stream: true,
      onChunk: (chunk) => {
        process.stdout.write(chunk);
        apiDoc += chunk;
      }
    });
    console.log("\n");
    
    // 保存API文档
    await this.saveOutput('docs/API.md', apiDoc);
    
    return {
      apiDoc,
      summary: this.extractAPISummary(apiDoc)
    };
  }

  extractAPISummary(apiDoc) {
    const lines = apiDoc.split('\n');
    const apis = [];
    
    for (const line of lines) {
      if (line.includes('POST') || line.includes('GET') || line.includes('PUT') || line.includes('DELETE')) {
        apis.push(line.trim());
        if (apis.length >= 5) break;
      }
    }
    
    return apis.join('\n');
  }
}

module.exports = { APIDesignerAgent };
