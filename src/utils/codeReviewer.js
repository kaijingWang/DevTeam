const inquirer = require('inquirer');
const { CodeParser } = require('./codeParser');

class CodeReviewer {
  async reviewAndConfirm(code, options = {}) {
    const {
      title = '生成的代码',
      autoSave = false
    } = options;

    // 解析代码块
    const files = CodeParser.parseCodeBlocks(code);
    const fileCount = Object.keys(files).length;

    if (fileCount === 0) {
      console.log('\n⚠️  未检测到代码块\n');
      return { action: 'skip', files: {} };
    }

    // 显示预览
    console.log(`\n📄 ${title} (${fileCount}个文件):\n`);
    console.log('─'.repeat(80));

    for (const [filename, content] of Object.entries(files)) {
      console.log(`\n📝 ${filename}`);
      console.log('─'.repeat(80));
      
      // 显示前20行
      const lines = content.split('\n');
      const preview = lines.slice(0, 20).join('\n');
      console.log(preview);
      
      if (lines.length > 20) {
        console.log(`\n... (还有${lines.length - 20}行)`);
      }
      
      console.log('─'.repeat(80));
    }

    // 如果自动保存，直接返回
    if (autoSave) {
      return { action: 'save', files };
    }

    // 询问用户
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: '请选择操作:',
        choices: [
          { name: '✅ 保存所有文件', value: 'save' },
          { name: '🔄 重新生成', value: 'regenerate' },
          { name: '📝 查看完整代码', value: 'view' },
          { name: '✏️  选择性保存', value: 'selective' },
          { name: '❌ 跳过', value: 'skip' }
        ]
      }
    ]);

    if (action === 'view') {
      // 显示完整代码
      for (const [filename, content] of Object.entries(files)) {
        console.log(`\n${'='.repeat(80)}`);
        console.log(`📝 ${filename}`);
        console.log('='.repeat(80));
        console.log(content);
      }
      
      // 再次询问
      return await this.reviewAndConfirm(code, options);
    }

    if (action === 'selective') {
      // 选择性保存
      const selectedFiles = {};
      
      for (const [filename, content] of Object.entries(files)) {
        const { save } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'save',
            message: `保存 ${filename}?`,
            default: true
          }
        ]);
        
        if (save) {
          selectedFiles[filename] = content;
        }
      }
      
      return { action: 'save', files: selectedFiles };
    }

    return { action, files };
  }

  async confirmSingleFile(filename, content, options = {}) {
    console.log(`\n📄 ${filename}:\n`);
    console.log('─'.repeat(80));
    
    const lines = content.split('\n');
    const preview = lines.slice(0, 30).join('\n');
    console.log(preview);
    
    if (lines.length > 30) {
      console.log(`\n... (还有${lines.length - 30}行)`);
    }
    
    console.log('─'.repeat(80));

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: '请选择操作:',
        choices: [
          { name: '✅ 保存', value: 'save' },
          { name: '🔄 重新生成', value: 'regenerate' },
          { name: '📝 查看完整代码', value: 'view' },
          { name: '❌ 跳过', value: 'skip' }
        ]
      }
    ]);

    if (action === 'view') {
      console.log(`\n${'='.repeat(80)}`);
      console.log(content);
      console.log('='.repeat(80));
      
      return await this.confirmSingleFile(filename, content, options);
    }

    return action;
  }

  displaySummary(savedFiles) {
    if (savedFiles.length === 0) {
      console.log('\n⚠️  没有保存任何文件\n');
      return;
    }

    console.log(`\n✅ 已保存 ${savedFiles.length} 个文件:\n`);
    savedFiles.forEach(file => {
      console.log(`  ✓ ${file}`);
    });
    console.log();
  }
}

module.exports = { CodeReviewer };
