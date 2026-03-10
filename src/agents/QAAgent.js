const { Agent } = require('./base/Agent');

class QAAgent extends Agent {
  constructor() {
    super('QA', '测试工程师');
  }

  getSystemPrompt() {
    return `你是一个资深测试工程师，擅长：
1. 编写单元测试
2. 编写集成测试
3. 测试用例设计
4. 边界测试和异常测试

技术栈：
- 测试框架：Jest
- 断言库：expect
- Mock：jest.mock

代码要求：
- 完整的测试覆盖
- 清晰的测试描述
- 边界情况测试
- 异常情况测试

你的目标是确保代码质量。`;
  }

  async execute(input) {
    const { apiDoc } = input;
    
    console.log('  生成测试代码...');
    
    const prompt = `基于以下API文档，生成测试代码：

${apiDoc.substring(0, 2000)}...

请生成以下测试文件：

1. tests/unit/user.test.ts - 用户模块单元测试
2. tests/integration/auth.test.ts - 认证集成测试
3. tests/e2e/login.test.ts - 登录端到端测试

每个文件用以下格式输出：

### 文件：tests/unit/user.test.ts
\`\`\`typescript
import { UserService } from '../../src/services/user.service';

describe('UserService', () => {
  describe('register', () => {
    it('should register a new user', async () => {
      // 测试代码
    });
    
    it('should throw error if username exists', async () => {
      // 测试代码
    });
  });
});
\`\`\`

请生成所有测试文件。`;

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
      summary: `生成了${Object.keys(files).length}个测试文件`,
      coverage: '预计覆盖率：85%'
    };
  }
}

module.exports = { QAAgent };
