const inquirer = require('inquirer');

class InteractiveController {
  constructor() {
    this.step = 0;
    this.totalSteps = 8;
  }

  async showStepHeader(stepName) {
    console.log('\n' + '━'.repeat(60));
    console.log(`📋 Step ${this.step}/${this.totalSteps}: ${stepName}`);
    console.log('━'.repeat(60) + '\n');
  }

  async askToContinue(options = {}) {
    const { preview, result } = options;
    
    if (preview) {
      console.log('\n' + preview);
    }
    
    const choices = [
      { name: '继续下一步', value: 'continue' },
      { name: '查看详情', value: 'view' },
      { name: '重新生成', value: 'regenerate' },
      { name: '退出', value: 'quit' }
    ];
    
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: '请选择操作:',
        choices
      }
    ]);
    
    return action;
  }

  async showDetail(content, title) {
    console.log('\n' + '═'.repeat(60));
    console.log(title);
    console.log('═'.repeat(60));
    console.log(content.substring(0, 1000));
    if (content.length > 1000) {
      console.log('\n... (内容过长，仅显示前1000字符)');
    }
    console.log('═'.repeat(60) + '\n');
    
    const { back } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'back',
        message: '返回?',
        default: true
      }
    ]);
  }

  async confirmAction(message) {
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message,
        default: true
      }
    ]);
    
    return confirm;
  }

  showProgress(message) {
    process.stdout.write(`  ${message}...`);
  }

  completeProgress() {
    console.log(' ✓');
  }
}

module.exports = { InteractiveController };
