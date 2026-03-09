#!/usr/bin/env node

const { Command } = require('commander');
const { configCommand } = require('./commands/config-simple');
const { developCommand } = require('./commands/develop-full');

const program = new Command();

console.log(`
╔═══════════════════════════════════════════════════════════╗
║            DevTeam CLI - v1.0.0-alpha                     ║
║            AI-Powered Development Team                    ║
╚═══════════════════════════════════════════════════════════╝
`);

program
  .name('devteam')
  .description('AI-powered development team in your terminal')
  .version('1.0.0');

program.addCommand(configCommand);
program.addCommand(developCommand);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
