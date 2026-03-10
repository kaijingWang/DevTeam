const { Command } = require('commander');
const { Orchestrator } = require('../orchestrator/Orchestrator');
const { CodeFixer } = require('../utils/CodeFixer');
const { CodeValidator } = require('../utils/CodeValidator');
const { IterationCoordinator } = require('../agents/IterationCoordinator');
const path = require('path');

function createIterativeCommand() {
  const iterativeCommand = new Command('iterate')
    .description('迭代开发（自动修复问题直到完成）')
    .argument('<requirement>', '需求描述')
    .option('--max-iterations <number>', '最大迭代次数', '5')
    .option('--auto-fix', '自动修复问题', true)
    .option('--no-auto-fix', '不自动修复')
    .action(async (requirement, options) => {
      console.log('\n🔄 DevTeam CLI - 迭代开发模式\n');
      console.log('📝 需求:', requirement);
      console.log('🔢 最大迭代次数:', options.maxIterations);
      console.log('🔧 自动修复:', options.autoFix ? '是' : '否');
      console.log('\n' + '='.repeat(60) + '\n');
      
      const orchestrator = new Orchestrator();
      const workspacePath = path.join(process.cwd(), 'devteam-workspace');
      const coordinator = new IterationCoordinator();
      coordinator.maxIterations = parseInt(options.maxIterations);
      
      try {
        // ========== 第1步：初始生成 ==========
        console.log('📝 Step 1: 初始代码生成\n');
        await orchestrator.run({
          requirement,
          mode: 'auto',
          projectPath: process.cwd()
        });
        
        // ========== 第2步：自动修复 ==========
        if (options.autoFix) {
          console.log('\n🔧 Step 2: 自动修复常见问题\n');
          const fixer = new CodeFixer(workspacePath);
          await fixer.fixAll();
        }
        
        // ========== 第3步：迭代优化 ==========
        console.log('\n🔄 Step 3: 迭代优化\n');
        
        let iterationCount = 0;
        let allPassed = false;
        
        while (iterationCount < coordinator.maxIterations && !allPassed) {
          iterationCount++;
          console.log(`\n${'='.repeat(60)}`);
          console.log(`🔄 第 ${iterationCount}/${coordinator.maxIterations} 次迭代`);
          console.log('='.repeat(60) + '\n');
          
          // 验证代码
          console.log('✅ 验证代码质量...\n');
          const validator = new CodeValidator(workspacePath);
          const validationResult = await validator.validateAll();
          
          // 运行测试（如果有）
          console.log('\n🧪 运行测试...\n');
          const testResult = await runTests(workspacePath);
          
          // 检查是否全部通过
          if (validationResult.success && testResult.success) {
            allPassed = true;
            console.log('\n✅ 所有检查通过！');
            break;
          }
          
          // 分析问题并修复
          console.log('\n🔍 分析问题...\n');
          const iterationResult = await coordinator.execute({
            requirement,
            projectPath: workspacePath,
            validationResult: validationResult.results,
            testResult
          });
          
          if (!iterationResult.success) {
            console.log('\n⚠️  迭代修复失败');
            if (iterationResult.remainingIssues) {
              console.log('\n剩余问题：');
              iterationResult.remainingIssues.forEach((issue, index) => {
                console.log(`${index + 1}. [${issue.type}] ${issue.description}`);
              });
            }
            break;
          }
          
          // 再次自动修复
          if (options.autoFix) {
            console.log('\n🔧 再次自动修复...\n');
            const fixer = new CodeFixer(workspacePath);
            await fixer.fixAll();
          }
        }
        
        // ========== 最终报告 ==========
        console.log('\n' + '='.repeat(60));
        console.log('📊 迭代开发完成');
        console.log('='.repeat(60));
        console.log(`\n🔢 总迭代次数: ${iterationCount}`);
        console.log(`✅ 最终状态: ${allPassed ? '全部通过' : '仍有问题'}`);
        
        if (allPassed) {
          console.log('\n🎉 项目开发完成！代码质量达标。\n');
          console.log('🚀 快速开始：');
          console.log('   cd devteam-workspace');
          console.log('   npm run dev\n');
        } else {
          console.log('\n⚠️  项目未完全达标，但已尽力优化。\n');
          console.log('💡 建议：');
          console.log('   1. 查看剩余问题');
          console.log('   2. 手动修复');
          console.log('   3. 或增加迭代次数重试\n');
        }
        
        console.log('📚 查看文档：');
        console.log('   docs/PRD.md           - 产品需求文档');
        console.log('   docs/ARCHITECTURE.md  - 技术架构文档');
        console.log('   docs/API.md           - API文档');
        console.log('   design/UI-DESIGN.md   - UI设计文档\n');
        
      } catch (error) {
        console.error('\n❌ 错误：', error.message);
        console.error('\n💡 提示：');
        console.error('   1. 检查API配置');
        console.error('   2. 检查网络连接');
        console.error('   3. 查看详细日志');
        process.exit(1);
      }
    });
    
  return iterativeCommand;
}

/**
 * 运行测试
 */
async function runTests(projectPath) {
  const { exec } = require('child_process');
  const { promisify } = require('util');
  const execAsync = promisify(exec);
  const fs = require('fs-extra');
  const path = require('path');
  
  // 检查是否有测试文件
  const testsDir = path.join(projectPath, 'tests');
  if (!fs.existsSync(testsDir)) {
    console.log('⏭️  没有测试文件，跳过测试');
    return { success: true, message: '没有测试' };
  }
  
  try {
    const { stdout, stderr } = await execAsync('npm test', {
      cwd: projectPath,
      timeout: 60000
    });
    
    console.log(stdout);
    
    return {
      success: true,
      output: stdout
    };
  } catch (error) {
    console.error('测试失败：');
    console.error(error.stdout || error.message);
    
    // 解析测试失败信息
    const failures = parseTestFailures(error.stdout || error.message);
    
    return {
      success: false,
      failures,
      output: error.stdout || error.message
    };
  }
}

/**
 * 解析测试失败信息
 */
function parseTestFailures(output) {
  const failures = [];
  
  // 简化的解析，实际可能需要更复杂的逻辑
  const lines = output.split('\n');
  lines.forEach(line => {
    if (line.includes('FAIL') || line.includes('✕')) {
      failures.push({
        test: line.trim(),
        message: line.trim(),
        file: 'unknown'
      });
    }
  });
  
  return failures;
}

module.exports = { iterativeCommand: createIterativeCommand() };
