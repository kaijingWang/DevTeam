const { Agent } = require('./base/Agent');

class UIDesignerAgent extends Agent {
  constructor() {
    super('UIDesigner', 'UI/UX设计师');
  }

  getSystemPrompt() {
    return `你是一个资深UI/UX设计师，精通现代Web设计和Tailwind CSS。

核心能力：
1. 设计美观、易用的用户界面
2. 制定完整的设计系统（色彩、字体、间距）
3. 设计响应式布局
4. 提供Tailwind CSS实现方案

设计原则：
- 简洁优先：去除不必要的元素
- 一致性：统一的视觉语言
- 可访问性：符合WCAG标准
- 响应式：适配所有设备
- 性能：优化加载速度

Tailwind CSS规范：
- 使用语义化的类名组合
- 使用Tailwind的设计系统（spacing、colors等）
- 使用响应式前缀（sm:、md:、lg:）
- 使用状态前缀（hover:、focus:、active:）
- 避免自定义CSS，优先使用Tailwind

输出要求：
- 完整的设计系统定义
- 详细的组件设计规范
- 页面布局设计
- Tailwind配置
- 响应式设计方案
- 无障碍设计方案

你的目标是提供一份开发团队可以直接实现的UI设计文档。`;
  }

  async execute(input) {
    const { requirement, prd, architecture } = input;
    
    console.log('  设计UI界面...');
    
    const prompt = `请根据以下信息设计完整的UI界面：

需求：${requirement}

PRD文档：
${prd}

技术架构：
${architecture}

请按照以下结构生成UI设计文档：

# UI/UX设计文档

## 1. 设计系统

### 1.1 色彩系统

\`\`\`css
/* 主色调 */
--primary: #[颜色]        /* 主要交互元素 */
--primary-hover: #[颜色]  /* 悬停态 */
--primary-light: #[颜色]  /* 浅色背景 */

/* 功能色 */
--success: #[颜色]        /* 成功状态 */
--warning: #[颜色]        /* 警告状态 */
--error: #[颜色]          /* 错误状态 */
--info: #[颜色]           /* 信息提示 */

/* 中性色 */
--gray-50: #[颜色]
--gray-100: #[颜色]
...
--gray-900: #[颜色]

/* 背景色 */
--bg-primary: #[颜色]
--bg-secondary: #[颜色]
\`\`\`

### 1.2 字体系统

\`\`\`css
/* 字体族 */
font-family: 'Inter', -apple-system, sans-serif;

/* 字号 */
--text-xs: 0.75rem    /* 12px */
--text-sm: 0.875rem   /* 14px */
--text-base: 1rem     /* 16px */
--text-lg: 1.125rem   /* 18px */
--text-xl: 1.25rem    /* 20px */
--text-2xl: 1.5rem    /* 24px */

/* 字重 */
--font-normal: 400
--font-medium: 500
--font-semibold: 600
--font-bold: 700
\`\`\`

### 1.3 间距系统

\`\`\`css
--spacing-1: 0.25rem   /* 4px */
--spacing-2: 0.5rem    /* 8px */
--spacing-4: 1rem      /* 16px */
--spacing-6: 1.5rem    /* 24px */
--spacing-8: 2rem      /* 32px */
\`\`\`

### 1.4 圆角系统

\`\`\`css
--radius-sm: 0.25rem   /* 4px */
--radius-md: 0.5rem    /* 8px */
--radius-lg: 0.75rem   /* 12px */
--radius-xl: 1rem      /* 16px */
\`\`\`

## 2. Tailwind CSS配置

\`\`\`javascript
// tailwind.config.js
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#[颜色]',
          hover: '#[颜色]',
          light: '#[颜色]',
        },
        // 其他颜色
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
\`\`\`

## 3. 组件设计规范

### 3.1 Button组件

**主要按钮**：
\`\`\`tsx
<button className="
  px-6 py-3 
  bg-primary hover:bg-primary-hover 
  text-white font-medium 
  rounded-lg 
  shadow-md hover:shadow-lg 
  transition-all duration-200 
  active:scale-95
  disabled:opacity-50 disabled:cursor-not-allowed
">
  按钮文字
</button>
\`\`\`

**次要按钮**：
\`\`\`tsx
<button className="
  px-6 py-3 
  bg-white hover:bg-gray-50 
  text-gray-700 font-medium 
  border border-gray-300 
  rounded-lg 
  shadow-sm hover:shadow-md 
  transition-all duration-200
">
  按钮文字
</button>
\`\`\`

[为每个组件提供详细的Tailwind类名]

### 3.2 Input组件

[详细的输入框设计]

### 3.3 Card组件

[详细的卡片设计]

## 4. 页面布局设计

### 4.1 整体布局

\`\`\`
┌─────────────────────────────────────┐
│            Header                   │
├─────────────────────────────────────┤
│                                     │
│  ┌──────────┐    ┌──────────────┐  │
│  │ Sidebar  │    │   Main       │  │
│  │          │    │   Content    │  │
│  └──────────┘    └──────────────┘  │
│                                     │
└─────────────────────────────────────┘
\`\`\`

### 4.2 主页面设计

\`\`\`tsx
<div className="min-h-screen bg-gray-50">
  {/* Header */}
  <header className="bg-white shadow-sm">
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-gray-900">
        [页面标题]
      </h1>
    </div>
  </header>

  {/* Main Content */}
  <main className="max-w-7xl mx-auto px-4 py-8">
    [主要内容]
  </main>
</div>
\`\`\`

[为每个页面提供完整的布局代码]

## 5. 响应式设计

### 5.1 断点系统

\`\`\`css
sm: 640px   /* 手机 */
md: 768px   /* 平板 */
lg: 1024px  /* 笔记本 */
xl: 1280px  /* 桌面 */
\`\`\`

### 5.2 响应式示例

\`\`\`tsx
<div className="
  grid 
  grid-cols-1 
  md:grid-cols-2 
  lg:grid-cols-3 
  gap-4
">
  [内容]
</div>
\`\`\`

## 6. 无障碍设计

### 6.1 键盘导航

- 所有交互元素可通过Tab键访问
- 使用tabIndex控制顺序
- 提供键盘快捷键

### 6.2 ARIA属性

\`\`\`tsx
<button
  aria-label="关闭对话框"
  aria-pressed="false"
>
  ×
</button>
\`\`\`

### 6.3 颜色对比度

- 文字对比度 ≥ 4.5:1（WCAG AA）
- 大文字对比度 ≥ 3:1

## 7. 动画与过渡

### 7.1 过渡效果

\`\`\`css
transition-all duration-200 ease-in-out
\`\`\`

### 7.2 动画示例

\`\`\`tsx
<div className="
  animate-fade-in
  hover:scale-105
  active:scale-95
">
  [内容]
</div>
\`\`\`

## 8. 设计资源

### 8.1 图标库

推荐使用：Heroicons、Lucide Icons

### 8.2 字体

推荐使用：Inter、Roboto

---

**文档版本**：v1.0  
**创建日期**：${new Date().toISOString().split('T')[0]}  
**负责人**：设计团队

请生成完整、专业、可实现的UI设计文档。`;

    // 使用流式输出
    let design = '';
    await this.chat(prompt, null, {
      stream: true,
      onChunk: (chunk) => {
        process.stdout.write(chunk);
        design += chunk;
      }
    });
    
    console.log('\n');
    
    // 保存设计文档
    await this.saveOutput('design/UI-DESIGN.md', design);
    
    return {
      design,
      summary: 'UI设计完成'
    };
  }
}

module.exports = { UIDesignerAgent };
