const { Command } = require('commander');
const { CodeReviewAgent } = require('../agents/CodeReviewAgent');
const fs = require('fs-extra');
const path = require('path');

const reviewCommand = new Command('review')
  .description('AI代码审查')
  .argument('[files...]', '要审查的文件')
  .option('-f, --focus <type>', '审查重点 (all|security|performance|style)', 'all')
  .option('-s, --severity <level>', '最低严重程度 (all|critical|high|medium|low)', 'all')
  .action(async (files, options) => {
    try {
      const reviewer = new CodeReviewAgent();
      
      // 如果没有指定文件，审查src目录
      if (files.length === 0) {
        files = await findSourceFiles('src');
      }

      if (files.length === 0) {
        console.log('\n⚠️  没有找到要审查的文件\n');
        return;
      }

      // 读取文件内容
      const fileContents = {};
      for (const file of files) {
        if (await fs.pathExists(file)) {
          fileContents[file] = await fs.readFile(file, 'utf-8');
        }
      }

      // 执行审查
      const report = await reviewer.review(fileContents, options);
      
      // 显示报告
      reviewer.displayReport(report);

    } catch (error) {
      console.error('\n❌ 错误:', error.message, '\n');
    }
  });

async function findSourceFiles(dir) {
  const files = [];
  const extensions = ['.js', '.ts', '.jsx', '.tsx'];

  async function scan(currentDir) {
    if (!await fs.pathExists(currentDir)) return;

    const items = await fs.readdir(currentDir);

    for (const item of items) {
      if (item === 'node_modules' || item.startsWith('.')) continue;

      const itemPath = path.join(currentDir, item);
      const stat = await fs.stat(itemPath);

      if (stat.isDirectory()) {
        await scan(itemPath);
      } else if (extensions.some(ext => item.endsWith(ext))) {
        files.push(itemPath);
      }
    }
  }

  await scan(dir);
  return files.slice(0, 10); // 最多审查10个文件
}

module.exports = { reviewCommand };
