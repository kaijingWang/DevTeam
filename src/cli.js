#!/usr/bin/env node

const { Command } = require('commander');
const { configCommand } = require('./commands/config-simple');
const { developCommand } = require('./commands/develop-full');
const { resumeCommand } = require('./commands/resume');
const { sessionsCommand } = require('./commands/sessions');
const { cacheCommand } = require('./commands/cache');

const program = new Command();

console.log(`
╔═══════════════════════════════════════════════════════════╗
║            DevTeam CLI - v1.2.0                           ║
║            AI-Powered Development Team                    ║
║                                                           ║
║  🎯 PM  🏗️ Architect  🎨 UI  📡 API                      ║
║  👨‍💻 Backend  🎨 Frontend  🧪 QA  📦 Git                  ║
╚═══════════════════════════════════════════════════════════╝
`);

program
  .name('devteam')
  .description('AI-powered development team in your terminal')
  .version('1.2.0');

program.addCommand(configCommand);
program.addCommand(developCommand);
program.addCommand(resumeCommand);
program.addCommand(sessionsCommand);
program.addCommand(cacheCommand);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
