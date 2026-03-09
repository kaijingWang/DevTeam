const { Command } = require('commander');
const { BugFixAgent } = require('../agents/BugFixAgent');
const fs = require('fs-extra');
const inquirer = require('inquirer');

const fixCommand = new Command('fix')
  .description('自动修复Bug')
  .argument('[error]', '错误信息')
  .option('-f, --file <file>', '出错的文件')
  .option('-t, --test <command>', '测试命令')
  .option('--auto', '自动应用修复')
  .action(async (error, options) => {
    try {
      const agent = new BugFixAgent();

      // 如果没有提供错误信息，尝试从最近的日志中获取
      if (!error) {
        console.log('\n⚠️  请提供错误信息\n');
        console.log('用法: devteam fix "错误信息" --file src/app.ts\n');
        return;
      }

      // 读取文件内容
      let code = '';
      if (options.file && await fs.pathExists(options.file)) {
        code = await fs.readFile(options.file, 'utf-8');
      }

      // 执行修复
      const result = await agent.fix(error, {
        file: options.file,
        code
      });

      // 显示报告
      agent.displayFixReport(result);

      // 如果有修复代码
      if (result.fix.code) {
        // 显示修复代码预览
        console.log('📄 修复后的代码:\n');
        console.log('─'.repeat(80));
        const lines = result.fix.code.split('\n');
        console.log(lines.slice(0, 20).join('\n'));
        if (lines.length > 20) {
          console.log(`\n... (还有${lines.length - 20}行)`);
        }
        console.log('─'.repeat(80) + '\n');

        // 询问是否应用
        let shouldApply = options.auto;
        
        if (!shouldApply) {
          const { apply } = await inquirer.prompt([
            {
              type: 'list',
              name: 'apply',
              message: '是否应用此修复？',
              choices: [
                { name: '✅ 应用修复', value: true },
                { name: '📝 查看完整代码', value: 'view' },
                { name: '❌ 取消', value: false }
              ]
            }
          ]);

          if (apply === 'view') {
            console.log('\n完整修复代码:\n');
            console.log('='.repeat(80));
            console.log(result.fix.code);
            console.log('='.repeat(80) + '\n');

            const { applyAfterView } = await inquirer.prompt([
              {
                type: 'confirm',
                name: 'applyAfterView',
                message: '现在应用修复？',
                default: false
              }
            ]);

            shouldApply = applyAfterView;
          } else {
            shouldApply = apply;
          }
        }

        if (shouldApply && options.file) {
          const applied = await agent.applyFix(options.file, result.fix);

          if (applied && options.test) {
            await agent.verifyFix(options.file, options.test);
          }
        }
      } else {
        console.log('⚠️  无法生成修复方案\n');
      }

    } catch (error) {
      console.error('\n❌ 错误:', error.message, '\n');
    }
  });

module.exports = { fixCommand };
