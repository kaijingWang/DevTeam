const fs = require('fs-extra');
const path = require('path');
const chokidar = require('chokidar');
const { router } = require('../llm/LLMRouter');

class PairProgrammingAgent {
  constructor() {
    this.llm = router.getProvider();
    this.watcher = null;
    this.analysisQueue = [];
    this.isAnalyzing = false;
    this.suggestions = new Map();
  }

  async start(projectPath = '.') {
    console.log('\n🤝 启动AI Pair Programming模式...\n');
    console.log('  实时监控代码变化');
    console.log('  提供即时建议和警告');
    console.log('  按 Ctrl+C 退出\n');

    // 监控文件变化
    this.watcher = chokidar.watch(projectPath, {
      ignored: /(^|[\/\\])\../, // 忽略隐藏文件
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 1000,
        pollInterval: 100
      }
    });

    this.watcher
      .on('change', (filePath) => this.onFileChange(filePath))
      .on('add', (filePath) => this.onFileAdd(filePath));

    console.log('✓ 监控已启动\n');
    console.log('─'.repeat(80) + '\n');

    // 保持进程运行
    return new Promise(() => {});
  }

  async onFileChange(filePath) {
    // 只处理代码文件
    if (!this.isCodeFile(filePath)) return;

    console.log(`📝 检测到文件变化: ${filePath}`);

    // 添加到分析队列
    this.analysisQueue.push(filePath);

    // 如果没有正在分析，开始分析
    if (!this.isAnalyzing) {
      this.processQueue();
    }
  }

  async onFileAdd(filePath) {
    if (!this.isCodeFile(filePath)) return;

    console.log(`➕ 检测到新文件: ${filePath}`);
    this.analysisQueue.push(filePath);

    if (!this.isAnalyzing) {
      this.processQueue();
    }
  }

  async processQueue() {
    if (this.analysisQueue.length === 0) {
      this.isAnalyzing = false;
      return;
    }

    this.isAnalyzing = true;
    const filePath = this.analysisQueue.shift();

    try {
      await this.analyzeFile(filePath);
    } catch (error) {
      console.error(`  ✗ 分析失败: ${error.message}`);
    }

    // 继续处理队列
    setTimeout(() => this.processQueue(), 500);
  }

  async analyzeFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      
      // 快速检查
      const issues = this.quickCheck(content, filePath);
      
      if (issues.length > 0) {
        this.displayIssues(filePath, issues);
      }

      // AI深度分析（异步）
      this.deepAnalyze(filePath, content);
    } catch (error) {
      // 忽略读取错误
    }
  }

  quickCheck(content, filePath) {
    const issues = [];

    // 检查常见问题
    if (content.includes('console.log')) {
      issues.push({
        type: 'warning',
        message: '包含console.log，记得在生产环境移除'
      });
    }

    if (content.includes('TODO') || content.includes('FIXME')) {
      issues.push({
        type: 'info',
        message: '包含TODO/FIXME注释'
      });
    }

    if (content.match(/var\s+\w+/)) {
      issues.push({
        type: 'warning',
        message: '使用var声明变量，建议使用let或const'
      });
    }

    if (content.includes('==') && !content.includes('===')) {
      issues.push({
        type: 'warning',
        message: '使用==比较，建议使用==='
      });
    }

    // 检查未处理的Promise
    if (content.match(/\.\s*then\s*\(/)) {
      if (!content.includes('.catch')) {
        issues.push({
          type: 'error',
          message: 'Promise缺少错误处理'
        });
      }
    }

    // 检查大文件
    if (content.split('\n').length > 300) {
      issues.push({
        type: 'warning',
        message: '文件过大（>300行），考虑拆分'
      });
    }

    return issues;
  }

  async deepAnalyze(filePath, content) {
    try {
      const prompt = `快速审查以下代码，只指出严重问题：

文件: ${filePath}

代码:
\`\`\`
${content.substring(0, 2000)}
\`\`\`

只返回严重问题（critical/high），格式：
- [类型] 问题描述

如果没有严重问题，返回：OK`;

      const response = await this.llm.chat([
        {
          role: 'system',
          content: '你是一个代码审查助手，快速识别严重问题。'
        },
        {
          role: 'user',
          content: prompt
        }
      ]);

      if (response.trim() !== 'OK') {
        console.log(`\n🤖 AI建议 (${filePath}):`);
        console.log(response);
        console.log('─'.repeat(80) + '\n');
      }
    } catch (error) {
      // 忽略AI分析错误
    }
  }

  displayIssues(filePath, issues) {
    console.log(`\n⚠️  发现问题 (${filePath}):\n`);

    for (const issue of issues) {
      const icon = issue.type === 'error' ? '🔴' :
                   issue.type === 'warning' ? '🟡' : 'ℹ️';
      console.log(`  ${icon} ${issue.message}`);
    }

    console.log('\n' + '─'.repeat(80) + '\n');
  }

  isCodeFile(filePath) {
    const ext = path.extname(filePath);
    return ['.js', '.ts', '.jsx', '.tsx', '.vue', '.py', '.go', '.java'].includes(ext);
  }

  stop() {
    if (this.watcher) {
      this.watcher.close();
      console.log('\n✓ 监控已停止\n');
    }
  }
}

module.exports = { PairProgrammingAgent };
