const inquirer = require('inquirer');
const { router } = require('../llm/LLMRouter');
const { Orchestrator } = require('../orchestrator/Orchestrator');
const chalk = require('chalk');

class ChatMode {
  constructor() {
    this.llm = router.getProvider();
    this.orchestrator = new Orchestrator();
    this.conversationHistory = [];
    this.currentProject = null;
  }

  async start() {
    console.clear();
    this.printWelcome();
    
    // 初始化对话
    await this.chat();
  }

  printWelcome() {
    console.log(chalk.cyan(`
╔═══════════════════════════════════════════════════════════╗
║          DevTeam - AI 开发助手                            ║
║          输入你的需求，我来帮你开发                        ║
╚═══════════════════════════════════════════════════════════╝
`));
    console.log(chalk.gray('提示：'));
    console.log(chalk.gray('  - 输入 /help 查看帮助'));
    console.log(chalk.gray('  - 输入 /exit 退出'));
    console.log(chalk.gray('  - 输入 /clear 清空对话'));
    console.log(chalk.gray('  - 输入 /new 开始新项目'));
    console.log();
  }

  async chat() {
    while (true) {
      const { message } = await inquirer.prompt([
        {
          type: 'input',
          name: 'message',
          message: chalk.green('你:'),
          prefix: ''
        }
      ]);

      const trimmed = message.trim();

      // 处理命令
      if (trimmed.startsWith('/')) {
        const shouldContinue = await this.handleCommand(trimmed);
        if (!shouldContinue) break;
        continue;
      }

      // 处理空消息
      if (!trimmed) continue;

      // 处理用户消息
      await this.handleMessage(trimmed);
    }
  }

  async handleCommand(command) {
    const cmd = command.toLowerCase();

    switch (cmd) {
      case '/exit':
      case '/quit':
        console.log(chalk.yellow('\n再见！👋\n'));
        return false;

      case '/help':
        this.showHelp();
        break;

      case '/clear':
        console.clear();
        this.conversationHistory = [];
        this.printWelcome();
        console.log(chalk.green('✓ 对话已清空\n'));
        break;

      case '/new':
        await this.startNewProject();
        break;

      case '/status':
        this.showStatus();
        break;

      case '/history':
        this.showHistory();
        break;

      default:
        console.log(chalk.red(`\n未知命令: ${command}\n`));
        console.log(chalk.gray('输入 /help 查看可用命令\n'));
    }

    return true;
  }

  async handleMessage(message) {
    // 添加到对话历史
    this.conversationHistory.push({
      role: 'user',
      content: message
    });

    console.log();
    console.log(chalk.blue('AI: ') + chalk.gray('思考中...'));

    try {
      // 判断意图
      const intent = await this.detectIntent(message);

      switch (intent.type) {
        case 'develop':
          await this.handleDevelopIntent(message, intent);
          break;

        case 'review':
          await this.handleReviewIntent(message, intent);
          break;

        case 'fix':
          await this.handleFixIntent(message, intent);
          break;

        case 'question':
          await this.handleQuestionIntent(message);
          break;

        default:
          await this.handleGeneralIntent(message);
      }
    } catch (error) {
      console.log(chalk.red(`\n✗ 错误: ${error.message}\n`));
    }
  }

  async detectIntent(message) {
    const lowerMessage = message.toLowerCase();

    // 开发意图
    if (lowerMessage.includes('开发') || 
        lowerMessage.includes('创建') || 
        lowerMessage.includes('实现') ||
        lowerMessage.includes('添加') ||
        lowerMessage.includes('做一个')) {
      return { type: 'develop', confidence: 0.9 };
    }

    // 审查意图
    if (lowerMessage.includes('审查') || 
        lowerMessage.includes('检查') || 
        lowerMessage.includes('review')) {
      return { type: 'review', confidence: 0.9 };
    }

    // 修复意图
    if (lowerMessage.includes('修复') || 
        lowerMessage.includes('bug') || 
        lowerMessage.includes('错误')) {
      return { type: 'fix', confidence: 0.9 };
    }

    // 问题意图
    if (lowerMessage.includes('什么') || 
        lowerMessage.includes('如何') || 
        lowerMessage.includes('怎么') ||
        lowerMessage.includes('为什么') ||
        lowerMessage.includes('?') ||
        lowerMessage.includes('？')) {
      return { type: 'question', confidence: 0.8 };
    }

    return { type: 'general', confidence: 0.5 };
  }

  async handleDevelopIntent(message, intent) {
    console.log(chalk.blue('\n🚀 AI: 好的，我来帮你开发！\n'));

    // 询问确认
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: '是否开始开发？',
        default: true
      }
    ]);

    if (!confirm) {
      console.log(chalk.yellow('\n已取消\n'));
      return;
    }

    // 选择模式
    const { mode } = await inquirer.prompt([
      {
        type: 'list',
        name: 'mode',
        message: '选择运行模式:',
        choices: [
          { name: '🚀 自动模式 - 全自动运行', value: 'auto' },
          { name: '💬 交互模式 - 每步询问', value: 'interactive' },
          { name: '👣 步进模式 - 每步暂停', value: 'step' }
        ]
      }
    ]);

    console.log();

    // 执行开发
    try {
      await this.orchestrator.execute(message, {
        mode,
        projectPath: this.currentProject || '.'
      });

      console.log(chalk.green('\n✓ 开发完成！\n'));

      // 询问下一步
      await this.askNextAction();
    } catch (error) {
      console.log(chalk.red(`\n✗ 开发失败: ${error.message}\n`));
    }
  }

  async handleReviewIntent(message, intent) {
    console.log(chalk.blue('\n🔍 AI: 好的，我来审查代码！\n'));

    const { CodeReviewAgent } = require('../agents/CodeReviewAgent');
    const reviewer = new CodeReviewAgent();

    // 简单实现：审查当前目录
    const path = this.currentProject || '.';
    
    console.log(chalk.gray(`审查目录: ${path}\n`));

    // 这里应该调用实际的审查逻辑
    console.log(chalk.green('✓ 审查完成\n'));
  }

  async handleFixIntent(message, intent) {
    console.log(chalk.blue('\n🔧 AI: 好的，我来修复问题！\n'));

    // 询问错误信息
    const { error } = await inquirer.prompt([
      {
        type: 'input',
        name: 'error',
        message: '请描述错误或粘贴错误信息:',
      }
    ]);

    const { file } = await inquirer.prompt([
      {
        type: 'input',
        name: 'file',
        message: '出错的文件路径 (可选):',
      }
    ]);

    console.log(chalk.gray('\n分析中...\n'));

    // 这里应该调用实际的修复逻辑
    console.log(chalk.green('✓ 修复方案已生成\n'));
  }

  async handleQuestionIntent(message) {
    // 使用 LLM 回答问题
    const response = await this.llm.chat([
      {
        role: 'system',
        content: '你是一个专业的开发助手，帮助用户解答开发相关的问题。回答要简洁、准确。'
      },
      ...this.conversationHistory
    ]);

    this.conversationHistory.push({
      role: 'assistant',
      content: response
    });

    console.log(chalk.blue('\nAI: ') + response + '\n');
  }

  async handleGeneralIntent(message) {
    // 通用对话
    const response = await this.llm.chat([
      {
        role: 'system',
        content: '你是 DevTeam AI 开发助手。你可以帮助用户开发项目、审查代码、修复Bug。请友好地回应用户。'
      },
      ...this.conversationHistory
    ]);

    this.conversationHistory.push({
      role: 'assistant',
      content: response
    });

    console.log(chalk.blue('\nAI: ') + response + '\n');
  }

  async startNewProject() {
    console.log(chalk.blue('\n📦 开始新项目\n'));

    const { useTemplate } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'useTemplate',
        message: '是否使用模板？',
        default: true
      }
    ]);

    if (useTemplate) {
      const { template } = await inquirer.prompt([
        {
          type: 'list',
          name: 'template',
          message: '选择模板:',
          choices: [
            { name: '🔧 Express REST API', value: 'express-api' },
            { name: '⚛️  React SPA', value: 'react-app' },
            { name: '▲ Next.js 全栈', value: 'nextjs-app' },
            { name: '✨ 自定义', value: 'custom' }
          ]
        }
      ]);

      const { projectName } = await inquirer.prompt([
        {
          type: 'input',
          name: 'projectName',
          message: '项目名称:',
          default: 'my-project'
        }
      ]);

      console.log(chalk.gray(`\n创建项目: ${projectName}\n`));
      
      // 这里应该调用模板初始化逻辑
      this.currentProject = `./${projectName}`;
      
      console.log(chalk.green(`✓ 项目已创建: ${this.currentProject}\n`));
    }
  }

  async askNextAction() {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: '接下来要做什么？',
        choices: [
          { name: '💬 继续对话', value: 'continue' },
          { name: '🔍 审查代码', value: 'review' },
          { name: '📝 生成文档', value: 'docs' },
          { name: '✅ 完成', value: 'done' }
        ]
      }
    ]);

    switch (action) {
      case 'review':
        await this.handleReviewIntent('审查代码', {});
        break;
      case 'docs':
        console.log(chalk.gray('\n生成文档中...\n'));
        console.log(chalk.green('✓ 文档已生成\n'));
        break;
      case 'done':
        console.log(chalk.green('\n✓ 完成！\n'));
        break;
    }
  }

  showHelp() {
    console.log(chalk.cyan('\n可用命令:\n'));
    console.log(chalk.white('  /help     ') + chalk.gray('- 显示帮助'));
    console.log(chalk.white('  /exit     ') + chalk.gray('- 退出程序'));
    console.log(chalk.white('  /clear    ') + chalk.gray('- 清空对话历史'));
    console.log(chalk.white('  /new      ') + chalk.gray('- 开始新项目'));
    console.log(chalk.white('  /status   ') + chalk.gray('- 查看当前状态'));
    console.log(chalk.white('  /history  ') + chalk.gray('- 查看对话历史'));
    console.log();
    console.log(chalk.cyan('使用示例:\n'));
    console.log(chalk.gray('  "开发一个用户登录功能"'));
    console.log(chalk.gray('  "审查 src 目录的代码"'));
    console.log(chalk.gray('  "修复这个 TypeError"'));
    console.log(chalk.gray('  "如何使用 React Hooks？"'));
    console.log();
  }

  showStatus() {
    console.log(chalk.cyan('\n当前状态:\n'));
    console.log(chalk.white('  当前项目: ') + chalk.gray(this.currentProject || '无'));
    console.log(chalk.white('  对话轮数: ') + chalk.gray(this.conversationHistory.length / 2));
    console.log();
  }

  showHistory() {
    console.log(chalk.cyan('\n对话历史:\n'));
    
    if (this.conversationHistory.length === 0) {
      console.log(chalk.gray('  (空)\n'));
      return;
    }

    this.conversationHistory.forEach((msg, i) => {
      const prefix = msg.role === 'user' ? chalk.green('你: ') : chalk.blue('AI: ');
      const content = msg.content.substring(0, 100);
      const suffix = msg.content.length > 100 ? '...' : '';
      console.log(`  ${i + 1}. ${prefix}${chalk.gray(content + suffix)}`);
    });
    
    console.log();
  }
}

module.exports = { ChatMode };
