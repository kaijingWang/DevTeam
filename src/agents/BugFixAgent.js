const { ClaudeProvider } = require('../llm/ClaudeProvider');
const fs = require('fs-extra');
const path = require('path');
const { CodeParser } = require('../utils/codeParser');

class BugFixAgent {
  constructor() {
    this.llm = new ClaudeProvider();
  }

  async fix(error, context = {}) {
    console.log('\n🔧 正在分析错误...\n');

    const {
      file = '',
      code = '',
      stackTrace = '',
      testOutput = ''
    } = context;

    // 分析错误
    const analysis = await this.analyzeError(error, context);
    
    console.log('  ✓ 错误分析完成');
    console.log(`  类型: ${analysis.type}`);
    console.log(`  原因: ${analysis.cause}\n`);

    // 生成修复方案
    console.log('🔧 正在生成修复方案...\n');
    const fix = await this.generateFix(error, analysis, context);
    
    console.log('  ✓ 修复方案已生成\n');

    return {
      analysis,
      fix,
      confidence: fix.confidence
    };
  }

  async analyzeError(error, context) {
    const prompt = `分析以下错误并提供诊断：

错误信息:
${error}

${context.stackTrace ? `堆栈跟踪:\n${context.stackTrace}\n` : ''}
${context.code ? `相关代码:\n\`\`\`\n${context.code.substring(0, 1000)}\n\`\`\`\n` : ''}
${context.testOutput ? `测试输出:\n${context.testOutput}\n` : ''}

请提供:
1. 错误类型 (syntax/runtime/logic/type)
2. 错误原因
3. 影响范围
4. 严重程度 (critical/high/medium/low)

输出格式:
类型: runtime
原因: 未处理的Promise rejection
影响: 可能导致应用崩溃
严重程度: high`;

    try {
      const response = await this.llm.chat([
        {
          role: 'system',
          content: '你是一个资深的调试专家，擅长快速定位和分析各种错误。'
        },
        {
          role: 'user',
          content: prompt
        }
      ]);

      return this.parseAnalysis(response);
    } catch (err) {
      return {
        type: 'unknown',
        cause: '无法分析',
        impact: '未知',
        severity: 'medium'
      };
    }
  }

  parseAnalysis(text) {
    const analysis = {
      type: 'unknown',
      cause: '',
      impact: '',
      severity: 'medium'
    };

    const lines = text.split('\n');
    for (const line of lines) {
      if (line.includes('类型:')) {
        analysis.type = line.split(':')[1].trim();
      } else if (line.includes('原因:')) {
        analysis.cause = line.split(':')[1].trim();
      } else if (line.includes('影响:')) {
        analysis.impact = line.split(':')[1].trim();
      } else if (line.includes('严重程度:')) {
        analysis.severity = line.split(':')[1].trim();
      }
    }

    return analysis;
  }

  async generateFix(error, analysis, context) {
    const prompt = `请为以下错误生成修复方案：

错误: ${error}
类型: ${analysis.type}
原因: ${analysis.cause}

${context.file ? `文件: ${context.file}\n` : ''}
${context.code ? `当前代码:\n\`\`\`\n${context.code}\n\`\`\`\n` : ''}

请提供:
1. 修复后的代码
2. 修复说明
3. 测试建议
4. 置信度 (0-100)

输出格式:
### 修复代码
\`\`\`javascript
// 修复后的代码
\`\`\`

### 修复说明
...

### 测试建议
...

### 置信度
85`;

    try {
      const response = await this.llm.chat([
        {
          role: 'system',
          content: '你是一个资深的Bug修复专家，擅长快速修复各种代码问题。'
        },
        {
          role: 'user',
          content: prompt
        }
      ]);

      return this.parseFix(response);
    } catch (err) {
      return {
        code: '',
        explanation: '无法生成修复方案',
        testSuggestions: [],
        confidence: 0
      };
    }
  }

  parseFix(text) {
    const fix = {
      code: '',
      explanation: '',
      testSuggestions: '',
      confidence: 50
    };

    // 提取代码块
    const codeMatch = text.match(/```[\w]*\n([\s\S]*?)```/);
    if (codeMatch) {
      fix.code = codeMatch[1].trim();
    }

    // 提取说明
    const explanationMatch = text.match(/### 修复说明\n([\s\S]*?)(?=###|$)/);
    if (explanationMatch) {
      fix.explanation = explanationMatch[1].trim();
    }

    // 提取测试建议
    const testMatch = text.match(/### 测试建议\n([\s\S]*?)(?=###|$)/);
    if (testMatch) {
      fix.testSuggestions = testMatch[1].trim();
    }

    // 提取置信度
    const confidenceMatch = text.match(/### 置信度\n(\d+)/);
    if (confidenceMatch) {
      fix.confidence = parseInt(confidenceMatch[1]);
    }

    return fix;
  }

  async applyFix(file, fix) {
    console.log(`\n📝 应用修复到 ${file}...\n`);

    try {
      // 备份原文件
      const backupFile = `${file}.backup`;
      await fs.copy(file, backupFile);
      console.log(`  ✓ 已备份到 ${backupFile}`);

      // 写入修复后的代码
      await fs.writeFile(file, fix.code, 'utf-8');
      console.log(`  ✓ 已应用修复\n`);

      return true;
    } catch (error) {
      console.error(`  ✗ 应用修复失败: ${error.message}\n`);
      return false;
    }
  }

  async verifyFix(file, testCommand) {
    console.log('🧪 验证修复...\n');

    try {
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);

      const { stdout, stderr } = await execAsync(testCommand);
      
      if (stderr && !stderr.includes('warning')) {
        console.log('  ✗ 验证失败\n');
        console.log(stderr);
        return false;
      }

      console.log('  ✓ 验证通过\n');
      return true;
    } catch (error) {
      console.log('  ✗ 验证失败\n');
      console.log(error.message);
      return false;
    }
  }

  displayFixReport(result) {
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║                    Bug修复报告                            ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    console.log('🔍 错误分析:\n');
    console.log(`  类型: ${result.analysis.type}`);
    console.log(`  原因: ${result.analysis.cause}`);
    console.log(`  严重程度: ${result.analysis.severity}\n`);

    console.log('🔧 修复方案:\n');
    console.log(`  置信度: ${result.fix.confidence}%`);
    console.log(`  说明: ${result.fix.explanation}\n`);

    if (result.fix.testSuggestions) {
      console.log('🧪 测试建议:\n');
      console.log(`  ${result.fix.testSuggestions}\n`);
    }

    console.log('─'.repeat(80) + '\n');
  }
}

module.exports = { BugFixAgent };
