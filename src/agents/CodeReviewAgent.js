const { ClaudeProvider } = require('../llm/ClaudeProvider');
const fs = require('fs-extra');
const path = require('path');

class CodeReviewAgent {
  constructor() {
    this.llm = new ClaudeProvider();
  }

  async review(files, options = {}) {
    const {
      focus = 'all', // all, security, performance, style
      severity = 'all' // all, critical, high, medium, low
    } = options;

    console.log('\n🔍 正在审查代码...\n');

    const results = [];

    for (const [filename, content] of Object.entries(files)) {
      console.log(`  审查: ${filename}`);
      
      const review = await this.reviewFile(filename, content, { focus, severity });
      results.push({
        file: filename,
        ...review
      });
    }

    return this.generateReport(results);
  }

  async reviewFile(filename, content, options) {
    const prompt = `请审查以下代码文件，找出潜在问题和改进建议。

文件: ${filename}

代码:
\`\`\`
${content.substring(0, 3000)}
\`\`\`

请从以下维度审查:
1. 代码规范和风格
2. 潜在的bug和错误
3. 性能问题
4. 安全漏洞
5. 最佳实践

对每个问题，请提供:
- 严重程度 (critical/high/medium/low)
- 问题描述
- 位置（行号）
- 修复建议

输出格式:
### 问题1
- 严重程度: high
- 位置: 第15行
- 描述: SQL注入风险
- 建议: 使用参数化查询

### 问题2
...`;

    try {
      const response = await this.llm.chat([
        {
          role: 'system',
          content: '你是一个资深代码审查专家，擅长发现代码中的问题并提供改进建议。'
        },
        {
          role: 'user',
          content: prompt
        }
      ]);

      return this.parseReviewResult(response);
    } catch (error) {
      console.warn(`  ⚠️  审查失败: ${error.message}`);
      return {
        score: 0,
        issues: [],
        suggestions: []
      };
    }
  }

  parseReviewResult(text) {
    const issues = [];
    const suggestions = [];
    
    // 简单解析（实际应该更复杂）
    const lines = text.split('\n');
    let currentIssue = null;

    for (const line of lines) {
      if (line.startsWith('### 问题')) {
        if (currentIssue) {
          issues.push(currentIssue);
        }
        currentIssue = {
          severity: 'medium',
          location: '',
          description: '',
          suggestion: ''
        };
      } else if (currentIssue) {
        if (line.includes('严重程度:')) {
          currentIssue.severity = line.split(':')[1].trim();
        } else if (line.includes('位置:')) {
          currentIssue.location = line.split(':')[1].trim();
        } else if (line.includes('描述:')) {
          currentIssue.description = line.split(':')[1].trim();
        } else if (line.includes('建议:')) {
          currentIssue.suggestion = line.split(':')[1].trim();
        }
      }
    }

    if (currentIssue) {
      issues.push(currentIssue);
    }

    // 计算分数
    const score = Math.max(0, 100 - issues.length * 10);

    return { score, issues, suggestions };
  }

  generateReport(results) {
    const allIssues = results.flatMap(r => 
      r.issues.map(i => ({ ...i, file: r.file }))
    );

    const critical = allIssues.filter(i => i.severity === 'critical');
    const high = allIssues.filter(i => i.severity === 'high');
    const medium = allIssues.filter(i => i.severity === 'medium');
    const low = allIssues.filter(i => i.severity === 'low');

    const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;

    return {
      score: Math.round(avgScore),
      totalIssues: allIssues.length,
      critical: critical.length,
      high: high.length,
      medium: medium.length,
      low: low.length,
      issues: allIssues,
      files: results
    };
  }

  displayReport(report) {
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║                    代码审查报告                           ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    console.log(`📊 总体评分: ${report.score}/100\n`);

    if (report.totalIssues === 0) {
      console.log('✅ 未发现问题！代码质量优秀。\n');
      return;
    }

    console.log(`🐛 发现问题: ${report.totalIssues}个\n`);

    if (report.critical > 0) {
      console.log(`  🔴 严重: ${report.critical}个`);
    }
    if (report.high > 0) {
      console.log(`  🟠 重要: ${report.high}个`);
    }
    if (report.medium > 0) {
      console.log(`  🟡 一般: ${report.medium}个`);
    }
    if (report.low > 0) {
      console.log(`  ⚪ 轻微: ${report.low}个`);
    }

    console.log('\n详细问题:\n');
    console.log('─'.repeat(80));

    // 按严重程度排序
    const sortedIssues = report.issues.sort((a, b) => {
      const severity = { critical: 4, high: 3, medium: 2, low: 1 };
      return severity[b.severity] - severity[a.severity];
    });

    sortedIssues.slice(0, 10).forEach((issue, index) => {
      const icon = issue.severity === 'critical' ? '🔴' :
                   issue.severity === 'high' ? '🟠' :
                   issue.severity === 'medium' ? '🟡' : '⚪';
      
      console.log(`\n${index + 1}. ${icon} [${issue.severity.toUpperCase()}] ${issue.file}`);
      console.log(`   位置: ${issue.location}`);
      console.log(`   问题: ${issue.description}`);
      console.log(`   建议: ${issue.suggestion}`);
    });

    if (sortedIssues.length > 10) {
      console.log(`\n... 还有${sortedIssues.length - 10}个问题`);
    }

    console.log('\n' + '─'.repeat(80) + '\n');
  }
}

module.exports = { CodeReviewAgent };
