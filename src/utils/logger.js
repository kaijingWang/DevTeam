const chalk = require('chalk');
const boxen = require('boxen');

const logger = {
  info: (message) => {
    console.log(chalk.blue('ℹ'), message);
  },

  success: (message) => {
    console.log(chalk.green('✓'), message);
  },

  error: (message) => {
    console.log(chalk.red('✗'), message);
  },

  warn: (message) => {
    console.log(chalk.yellow('⚠'), message);
  },

  box: (message, title) => {
    console.log(
      boxen(message, {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        title: title,
        titleAlignment: 'center',
        borderColor: 'cyan'
      })
    );
  },

  step: (current, total, name) => {
    console.log('\n' + chalk.cyan('━'.repeat(60)));
    console.log(chalk.cyan(`📋 Step ${current}/${total}: ${name}`));
    console.log(chalk.cyan('━'.repeat(60)) + '\n');
  }
};

module.exports = { logger };
