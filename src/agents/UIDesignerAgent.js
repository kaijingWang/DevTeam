const { Agent } = require('./base/Agent');

class UIDesignerAgent extends Agent {
  constructor() {
    super('UIDesigner', 'UI/UX设计师');
  }

  getSystemPrompt() {
    return `你是一个资深UI/UX设计师，擅长：
1. 现代化的界面设计
2. 用户体验优化
3. 响应式设计
4. 设计系统构建

输出格式要求：
- 使用Markdown格式
- 包含设计规范（颜色、字体、间距）
- 提供Tailwind CSS配置
- 考虑无障碍性

你的目标是设计出美观、易用的界面。`;
  }

  async execute(input) {
    const { prd } = input;
    
    console.log('  设计UI界面...');
    
    const prompt = `基于以下PRD文档，设计UI界面：

${prd.substring(0, 2000)}...

设计文档应包含：

# UI设计文档

## 1. 设计系统

### 色彩系统
\`\`\`
主色：#3B82F6 (蓝色)
辅助色：#10B981 (绿色)
警告色：#F59E0B (橙色)
错误色：#EF4444 (红色)
中性色：#6B7280 (灰色)
\`\`\`

### 字体系统
\`\`\`
字体族：Inter, system-ui, sans-serif
标题：font-bold
正文：font-normal
小字：text-sm
\`\`\`

### 间距系统
\`\`\`
xs: 0.25rem (4px)
sm: 0.5rem (8px)
md: 1rem (16px)
lg: 1.5rem (24px)
xl: 2rem (32px)
\`\`\`

## 2. Tailwind配置

\`\`\`javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#10B981'
      }
    }
  }
}
\`\`\`

## 3. 组件设计

### Button组件
\`\`\`tsx
<button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600">
  按钮
</button>
\`\`\`

### Input组件
\`\`\`tsx
<input className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" />
\`\`\`

## 4. 页面布局

### 登录页面
\`\`\`
┌─────────────────────────────────┐
│         Logo                    │
│                                 │
│    ┌─────────────────────┐     │
│    │  用户名              │     │
│    └─────────────────────┘     │
│    ┌─────────────────────┐     │
│    │  密码                │     │
│    └─────────────────────┘     │
│    ┌─────────────────────┐     │
│    │      登录            │     │
│    └─────────────────────┘     │
└─────────────────────────────────┘
\`\`\`

请生成完整的设计文档。`;

    let designDoc = "";
    await this.chat(prompt, null, {
      stream: true,
      onChunk: (chunk) => {
        process.stdout.write(chunk);
        designDoc += chunk;
      }
    });
    console.log("\n");
    
    // 保存设计文档
    await this.saveOutput('design/DESIGN.md', designDoc);
    
    // 生成Tailwind配置
    const tailwindConfig = this.extractTailwindConfig(designDoc);
    if (tailwindConfig) {
      await this.saveOutput('design/tailwind.config.js', tailwindConfig);
    }
    
    return {
      designDoc,
      summary: '设计系统和组件规范已生成'
    };
  }

  extractTailwindConfig(designDoc) {
    const match = designDoc.match(/```(?:javascript|js)\s*(module\.exports\s*=\s*\{[\s\S]*?\})\s*```/);
    return match ? match[1] : null;
  }
}

module.exports = { UIDesignerAgent };
