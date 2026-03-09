const { Command } = require('commander');
const { DocsGenerator } = require('../generators/DocsGenerator');

const docsCommand = new Command('docs')
  .description('生成项目文档');

docsCommand
  .command('readme')
  .description('生成README.md')
  .action(async () => {
    try {
      const generator = new DocsGenerator();
      await generator.generateReadme();
    } catch (error) {
      console.error('\n❌ 错误:', error.message, '\n');
    }
  });

docsCommand
  .command('api')
  .description('生成API文档')
  .action(async () => {
    try {
      const generator = new DocsGenerator();
      await generator.generateApiDocs();
    } catch (error) {
      console.error('\n❌ 错误:', error.message, '\n');
    }
  });

docsCommand
  .command('deploy')
  .description('生成部署文档')
  .action(async () => {
    try {
      const generator = new DocsGenerator();
      await generator.generateDeployDocs();
    } catch (error) {
      console.error('\n❌ 错误:', error.message, '\n');
    }
  });

docsCommand
  .command('all')
  .description('生成所有文档')
  .action(async () => {
    try {
      const generator = new DocsGenerator();
      await generator.generateReadme();
      await generator.generateApiDocs();
      await generator.generateDeployDocs();
      
      console.log('✅ 所有文档已生成！\n');
    } catch (error) {
      console.error('\n❌ 错误:', error.message, '\n');
    }
  });

module.exports = { docsCommand };
