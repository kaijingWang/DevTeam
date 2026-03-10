const { Agent } = require('./base/Agent');

class FrontendAgent extends Agent {
  constructor() {
    super('Frontend', '前端工程师');
  }

  getSystemPrompt() {
    return `你是一个资深前端工程师，精通React、TypeScript、Tailwind CSS。

核心职责：
1. 根据UI设计文档生成完整的React组件
2. 实现所有页面和路由
3. 集成状态管理（Zustand）
4. 确保代码可以直接运行，无需修改

代码规范：
- 使用TypeScript，不要用any
- 使用函数组件和Hooks
- 使用Tailwind CSS，不要写内联样式
- 组件要有完整的类型定义
- 导入语句要正确
- 文件名使用PascalCase（组件）或camelCase（工具）

必须生成的文件：
1. src/main.tsx - 入口文件
2. src/App.tsx - 主应用组件
3. src/components/*.tsx - 所有UI组件
4. src/pages/*.tsx - 所有页面（如果是多页应用）
5. src/store/*.ts - 状态管理
6. src/types/index.ts - 类型定义
7. src/utils/*.ts - 工具函数
8. src/index.css - 全局样式
9. index.html - HTML入口
10. vite.config.ts - Vite配置
11. tsconfig.json - TypeScript配置
12. tsconfig.node.json - Node TypeScript配置
13. postcss.config.cjs - PostCSS配置
14. tailwind.config.js - Tailwind配置
15. package.json - 依赖配置

输出格式：
每个文件使用以下格式：

### 文件：src/App.tsx
\`\`\`typescript
// 完整的代码
\`\`\`

### 文件：src/main.tsx
\`\`\`typescript
// 完整的代码
\`\`\`

重要提示：
- 不要在文件名前加"文件："前缀，直接写路径
- 确保所有导入路径正确
- 确保所有类型定义完整
- 确保代码可以通过TypeScript检查
- 确保代码可以成功构建

你的目标是生成一个可以立即运行的完整前端项目。`;
  }

  async execute(input) {
    const { requirement, architecture, uiDesign, apiDesign } = input;
    
    console.log('  生成前端代码...');
    
    const prompt = `请根据以下信息生成完整的React前端代码：

需求：${requirement}

技术架构：
${architecture}

UI设计：
${uiDesign}

API设计：
${apiDesign}

请生成以下所有文件的完整代码：

1. **配置文件**：
   - package.json（包含所有必需依赖）
   - tsconfig.json（TypeScript配置）
   - tsconfig.node.json（Node TypeScript配置）
   - vite.config.ts（Vite配置，监听0.0.0.0）
   - tailwind.config.js（Tailwind配置）
   - postcss.config.cjs（PostCSS配置，注意是.cjs）
   - index.html（HTML入口）

2. **入口文件**：
   - src/main.tsx（React入口）
   - src/App.tsx（主应用组件）
   - src/index.css（全局样式，包含Tailwind指令）

3. **类型定义**：
   - src/types/index.ts（所有TypeScript类型）

4. **状态管理**：
   - src/store/*.ts（Zustand store）

5. **组件**：
   - src/components/*.tsx（所有UI组件）

6. **页面**（如果需要）：
   - src/pages/*.tsx

7. **工具函数**：
   - src/utils/*.ts

8. **业务逻辑**：
   - src/controllers/*.ts（游戏逻辑、业务逻辑等）
   - src/ai/*.ts（AI引擎等，如果需要）

请确保：
- 所有文件路径正确，不要有"文件："前缀
- 所有导入语句正确
- 所有类型定义完整
- 代码可以通过TypeScript检查
- 代码可以成功构建和运行
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
      summary: '前端代码已生成'
    };
  }

  async parseAndSaveFiles(code) {
    // 解析Markdown格式的代码块
    const fileRegex = /###\s+(?:文件：)?(.+?)\n```(?:typescript|javascript|json|html|css|jsx|tsx)?\n([\s\S]+?)```/g;
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

    console.log(`\n✅ 前端代码已生成: ${fileCount}个文件`);
  }
}

module.exports = { FrontendAgent };
