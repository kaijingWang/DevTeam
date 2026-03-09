#!/usr/bin/env node

const { Command } = require('commander');
const { configCommand } = require('./commands/config');
const { developCommand } = require('./commands/develop');
const { resumeCommand } = require('./commands/resume');
const { sessionsCommand } = require('./commands/sessions');

const program = new Command();

// 显示欢迎信息
console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ██████╗ ███████╗██╗   ██╗████████╗███████╗ █████╗ ███╗ ║
║   ██╔══██╗██╔════╝██║   ██║╚══██╔══╝██╔════╝██╔══██╗████║ ║
║   ██║  ██║█████╗  ██║   ██║   ██║   █████╗  ███████║██╔██║ ║
║   ██║  ██║██╔══╝  ╚██╗ ██╔╝   ██║   ██╔══╝  ██╔══██║██║╚██║ ║
║   ██████╔╝███████╗ ╚████╔╝    ██║   ███████╗██║  ██║██║ ╚██║ ║
║   ╚═════╝ ╚══════╝  ╚═══╝     ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝ ║
║                                                           ║
║            AI-Powered Development Team                   ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`);

program
  .name('devteam')
  .description('AI-powered development team in your terminal')
  .version('1.0.0');

// 注册命令
program.addCommand(configCommand);
program.addCommand(developCommand);
program.addCommand(resumeCommand);
program.addCommand(sessionsCommand);

// 解析命令
program.parse(process.argv);

// 如果没有参数，显示帮助
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
