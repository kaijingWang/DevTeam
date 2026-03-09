#!/usr/bin/env node

const { Command } = require('commander');
const { configCommand } = require('./commands/config-simple');
const { developCommand } = require('./commands/develop-full');
const { resumeCommand } = require('./commands/resume');
const { sessionsCommand } = require('./commands/sessions');
const { cacheCommand } = require('./commands/cache');
const { templateCommand } = require('./commands/template');
const { reviewCommand } = require('./commands/review');
const { fixCommand } = require('./commands/fix');
const { docsCommand } = require('./commands/docs');
const { pluginCommand } = require('./commands/plugin');
const { pairCommand } = require('./commands/pair');
const { learnCommand } = require('./commands/learn');

const program = new Command();

console.log(`
╔═══════════════════════════════════════════════════════════╗
║            DevTeam CLI - v2.0.0                           ║
║            AI-Powered Development Team                    ║
║                                                           ║
║  🎯 PM  🏗️ Architect  🎨 UI  📡 API                      ║
║  👨‍💻 Backend  🎨 Frontend  🧪 QA  📦 Git                  ║
║  🔌 Plugins  🤖 Multi-LLM  🤝 AI Pair  🧠 Learning       ║
╚═══════════════════════════════════════════════════════════╝
`);

program
  .name('devteam')
  .description('AI-powered development team in your terminal')
  .version('2.0.0');

program.addCommand(configCommand);
program.addCommand(developCommand);
program.addCommand(resumeCommand);
program.addCommand(sessionsCommand);
program.addCommand(cacheCommand);
program.addCommand(templateCommand);
program.addCommand(reviewCommand);
program.addCommand(fixCommand);
program.addCommand(docsCommand);
program.addCommand(pluginCommand);
program.addCommand(pairCommand);
program.addCommand(learnCommand);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
