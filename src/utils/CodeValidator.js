const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs-extra');

const execAsync = promisify(exec);

class CodeValidator {
  constructor(projectPath) {
    this.projectPath = projectPath;
  }

  /**
   * 验证TypeScript代码
   */
  async validateTypeScript() {
    console.log('\n🔍 验证TypeScript代码...');
    
    try {
      const { stdout, stderr } = await execAsync('npx tsc --noEmit', {
        cwd: this.projectPath,
        timeout: 30000
      });
      
      if (stderr) {
        console.error('❌ TypeScript错误：');
        console.error(stderr);
        return { success: false, errors: stderr };
      }
      
      console.log('✅ TypeScript检查通过');
      return { success: true };
    } catch (error) {
      console.error('❌ TypeScript检查失败：');
      console.error(error.stdout || error.message);
      return { success: false, errors: error.stdout || error.message };
    }
  }

  /**
   * 验证ESLint
   */
  async validateESLint() {
    console.log('\n🔍 运行ESLint检查...');
    
    try {
      const { stdout } = await execAsync('npx eslint src --ext .ts,.tsx', {
        cwd: this.projectPath,
        timeout: 30000
      });
      
      if (stdout) {
        console.log('⚠️  ESLint警告：');
        console.log(stdout);
      } else {
        console.log('✅ ESLint检查通过');
      }
      
      return { success: true, warnings: stdout };
    } catch (error) {
      // ESLint返回非0退出码表示有错误
      console.error('❌ ESLint错误：');
      console.error(error.stdout || error.message);
      return { success: false, errors: error.stdout || error.message };
    }
  }

  /**
   * 验证构建
   */
  async validateBuild() {
    console.log('\n🔍 验证项目构建...');
    
    try {
      const { stdout, stderr } = await execAsync('npm run build', {
        cwd: this.projectPath,
        timeout: 60000
      });
      
      console.log(stdout);
      
      if (stderr && !stderr.includes('warning')) {
        console.error('❌ 构建错误：');
        console.error(stderr);
        return { success: false, errors: stderr };
      }
      
      // 检查dist目录是否存在
      const distPath = path.join(this.projectPath, 'dist');
      if (!fs.existsSync(distPath)) {
        console.error('❌ 构建失败：dist目录不存在');
        return { success: false, errors: 'dist目录不存在' };
      }
      
      console.log('✅ 构建成功');
      return { success: true };
    } catch (error) {
      console.error('❌ 构建失败：');
      console.error(error.stdout || error.message);
      return { success: false, errors: error.stdout || error.message };
    }
  }

  /**
   * 验证依赖安装
   */
  async validateDependencies() {
    console.log('\n🔍 检查依赖...');
    
    const packageJsonPath = path.join(this.projectPath, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      console.error('❌ package.json不存在');
      return { success: false, errors: 'package.json不存在' };
    }
    
    const nodeModulesPath = path.join(this.projectPath, 'node_modules');
    if (!fs.existsSync(nodeModulesPath)) {
      console.log('📦 安装依赖...');
      
      try {
        const { stdout } = await execAsync('npm install', {
          cwd: this.projectPath,
          timeout: 120000
        });
        
        console.log('✅ 依赖安装完成');
        return { success: true };
      } catch (error) {
        console.error('❌ 依赖安装失败：');
        console.error(error.stdout || error.message);
        return { success: false, errors: error.stdout || error.message };
      }
    }
    
    console.log('✅ 依赖已安装');
    return { success: true };
  }

  /**
   * 验证文件结构
   */
  async validateFileStructure() {
    console.log('\n🔍 验证文件结构...');
    
    const requiredFiles = [
      'package.json',
      'tsconfig.json',
      'vite.config.ts',
      'index.html',
      'src/main.tsx',
      'src/App.tsx',
      'src/index.css'
    ];
    
    const missingFiles = [];
    
    for (const file of requiredFiles) {
      const filePath = path.join(this.projectPath, file);
      if (!fs.existsSync(filePath)) {
        missingFiles.push(file);
      }
    }
    
    if (missingFiles.length > 0) {
      console.error('❌ 缺少必需文件：');
      missingFiles.forEach(file => console.error(`  - ${file}`));
      return { success: false, errors: `缺少文件: ${missingFiles.join(', ')}` };
    }
    
    console.log('✅ 文件结构完整');
    return { success: true };
  }

  /**
   * 运行所有验证
   */
  async validateAll() {
    console.log('\n🚀 开始代码验证...\n');
    
    const results = {
      fileStructure: await this.validateFileStructure(),
      dependencies: await this.validateDependencies(),
      typescript: null,
      build: null
    };
    
    // 只有在前面的步骤成功后才继续
    if (results.fileStructure.success && results.dependencies.success) {
      results.typescript = await this.validateTypeScript();
      
      if (results.typescript.success) {
        results.build = await this.validateBuild();
      }
    }
    
    // 生成报告
    console.log('\n' + '='.repeat(50));
    console.log('📊 验证报告');
    console.log('='.repeat(50));
    
    const allSuccess = Object.values(results).every(r => r && r.success);
    
    if (allSuccess) {
      console.log('\n✅ 所有检查通过！项目可以正常运行。\n');
    } else {
      console.log('\n❌ 发现问题，请修复后重试。\n');
    }
    
    return {
      success: allSuccess,
      results
    };
  }
}

module.exports = { CodeValidator };
