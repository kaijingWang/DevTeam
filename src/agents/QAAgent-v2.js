const { Agent } = require('./base/Agent');

class QAAgent extends Agent {
  constructor() {
    super('QA', '测试工程师');
  }

  getSystemPrompt() {
    return `你是一个资深测试工程师，精通自动化测试和质量保证。

核心能力：
1. 编写完整的测试用例
2. 实现自动化测试
3. 性能测试和压力测试
4. 安全测试

测试框架：
- 单元测试：Vitest / Jest
- 组件测试：React Testing Library
- E2E测试：Playwright / Cypress
- API测试：Supertest

测试原则：
- 测试覆盖率 ≥ 80%
- 测试要独立、可重复
- 测试要快速执行
- 测试要易于维护

输出要求：
- 完整的测试文件
- 可以直接运行
- 包含所有边界情况
- 包含错误处理测试
- 包含性能测试

你的目标是生成可以立即运行的高质量测试代码。`;
  }

  async execute(input) {
    const { requirement, architecture, code } = input;
    
    console.log('  生成测试代码...');
    
    const prompt = `请根据以下信息生成完整的测试代码：

需求：${requirement}

技术架构：
${architecture}

请生成以下测试文件：

## 1. 单元测试

### tests/unit/utils.test.ts
\`\`\`typescript
import { describe, it, expect } from 'vitest';
import { [函数名] } from '@/utils/[文件名]';

describe('[模块名]', () => {
  describe('[函数名]', () => {
    it('should [测试场景]', () => {
      // Arrange
      const input = [测试数据];
      
      // Act
      const result = [函数名](input);
      
      // Assert
      expect(result).toBe([期望结果]);
    });

    it('should handle edge cases', () => {
      // 边界情况测试
    });

    it('should throw error for invalid input', () => {
      // 错误处理测试
      expect(() => [函数名](null)).toThrow();
    });
  });
});
\`\`\`

[为每个模块生成完整的单元测试]

## 2. 组件测试

### tests/components/Button.test.tsx
\`\`\`typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/Button';

describe('Button', () => {
  it('should render correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });
});
\`\`\`

[为每个组件生成完整的测试]

## 3. 集成测试

### tests/integration/workflow.test.ts
\`\`\`typescript
import { describe, it, expect, beforeEach } from 'vitest';

describe('[功能名] Workflow', () => {
  beforeEach(() => {
    // 设置测试环境
  });

  it('should complete full workflow', async () => {
    // 测试完整的用户流程
  });
});
\`\`\`

## 4. E2E测试

### tests/e2e/app.spec.ts
\`\`\`typescript
import { test, expect } from '@playwright/test';

test.describe('[应用名]', () => {
  test('should load homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/[标题]/);
  });

  test('should complete user flow', async ({ page }) => {
    // 完整的用户流程测试
  });
});
\`\`\`

## 5. 测试配置

### vitest.config.ts
\`\`\`typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
      ],
    },
  },
});
\`\`\`

### tests/setup.ts
\`\`\`typescript
import '@testing-library/jest-dom';
\`\`\`

## 6. 测试脚本

在package.json中添加：
\`\`\`json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test"
  },
  "devDependencies": {
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/user-event": "^14.0.0",
    "@playwright/test": "^1.40.0",
    "@vitest/ui": "^1.0.0",
    "@vitest/coverage-v8": "^1.0.0"
  }
}
\`\`\`

请生成完整、可运行的测试代码，确保：
- 测试覆盖所有核心功能
- 测试可以直接运行
- 测试包含边界情况
- 测试包含错误处理
- 预计覆盖率 ≥ 80%`;

    // 使用流式输出
    let tests = '';
    await this.chat(prompt, null, {
      stream: true,
      onChunk: (chunk) => {
        process.stdout.write(chunk);
        tests += chunk;
      }
    });
    
    console.log('\n');
    
    // 解析并保存测试文件
    await this.parseAndSaveFiles(tests);
    
    return {
      tests,
      summary: '测试代码已生成'
    };
  }

  async parseAndSaveFiles(code) {
    const fileRegex = /###\s+(.+?)\n```(?:typescript|javascript|json)?\n([\s\S]+?)```/g;
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

    console.log(`\n✅ 测试代码已生成: ${fileCount}个文件`);
  }
}

module.exports = { QAAgent };
