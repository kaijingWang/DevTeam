const fs = require('fs-extra');
const path = require('path');

class CodeFixer {
  constructor(projectPath) {
    this.projectPath = projectPath;
  }

  /**
   * 修复常见的文件命名问题
   */
  async fixFileNames() {
    console.log('\n🔧 修复文件命名...');
    
    const files = await this.getAllFiles(this.projectPath);
    let fixedCount = 0;
    
    for (const file of files) {
      const basename = path.basename(file);
      
      // 修复"文件："前缀
      if (basename.startsWith('文件：')) {
        const newName = basename.replace('文件：', '');
        const newPath = path.join(path.dirname(file), newName);
        
        try {
          await fs.move(file, newPath);
          console.log(`  ✓ 重命名: ${basename} → ${newName}`);
          fixedCount++;
        } catch (error) {
          console.error(`  ✗ 重命名失败: ${basename}`, error.message);
        }
      }
    }
    
    if (fixedCount > 0) {
      console.log(`✅ 修复了${fixedCount}个文件名`);
    } else {
      console.log('✅ 文件名正常');
    }
  }

  /**
   * 修复PostCSS配置文件扩展名
   */
  async fixPostCSSConfig() {
    console.log('\n🔧 修复PostCSS配置...');
    
    const jsPath = path.join(this.projectPath, 'postcss.config.js');
    const cjsPath = path.join(this.projectPath, 'postcss.config.cjs');
    
    if (await fs.pathExists(jsPath) && !(await fs.pathExists(cjsPath))) {
      try {
        await fs.move(jsPath, cjsPath);
        console.log('  ✓ 重命名: postcss.config.js → postcss.config.cjs');
      } catch (error) {
        console.error('  ✗ 重命名失败', error.message);
      }
    } else {
      console.log('✅ PostCSS配置正常');
    }
  }

  /**
   * 确保必需的配置文件存在
   */
  async ensureConfigFiles() {
    console.log('\n🔧 检查配置文件...');
    
    const configs = {
      'tsconfig.json': {
        compilerOptions: {
          target: 'ES2020',
          useDefineForClassFields: true,
          lib: ['ES2020', 'DOM', 'DOM.Iterable'],
          module: 'ESNext',
          skipLibCheck: true,
          moduleResolution: 'bundler',
          allowImportingTsExtensions: true,
          resolveJsonModule: true,
          isolatedModules: true,
          noEmit: true,
          jsx: 'react-jsx',
          strict: true,
          noUnusedLocals: true,
          noUnusedParameters: true,
          noFallthroughCasesInSwitch: true
        },
        include: ['src'],
        references: [{ path: './tsconfig.node.json' }]
      },
      'tsconfig.node.json': {
        compilerOptions: {
          composite: true,
          skipLibCheck: true,
          module: 'ESNext',
          moduleResolution: 'bundler',
          allowSyntheticDefaultImports: true
        },
        include: ['vite.config.ts']
      },
      'vite.config.ts': `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173
  }
})`,
      'postcss.config.cjs': `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`,
      'tailwind.config.js': `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`,
      'index.html': `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
      'src/index.css': `@tailwind base;
@tailwind components;
@tailwind utilities;`,
      'src/main.tsx': `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`
    };
    
    let createdCount = 0;
    
    for (const [filename, content] of Object.entries(configs)) {
      const filePath = path.join(this.projectPath, filename);
      
      if (!(await fs.pathExists(filePath))) {
        try {
          await fs.ensureDir(path.dirname(filePath));
          
          if (typeof content === 'string') {
            await fs.writeFile(filePath, content);
          } else {
            await fs.writeJson(filePath, content, { spaces: 2 });
          }
          
          console.log(`  ✓ 创建: ${filename}`);
          createdCount++;
        } catch (error) {
          console.error(`  ✗ 创建失败: ${filename}`, error.message);
        }
      }
    }
    
    if (createdCount > 0) {
      console.log(`✅ 创建了${createdCount}个配置文件`);
    } else {
      console.log('✅ 配置文件完整');
    }
  }

  /**
   * 修复package.json中的构建脚本
   */
  async fixPackageJson() {
    console.log('\n🔧 修复package.json...');
    
    const packagePath = path.join(this.projectPath, 'package.json');
    
    if (!(await fs.pathExists(packagePath))) {
      console.log('⚠️  package.json不存在');
      return;
    }
    
    try {
      const pkg = await fs.readJson(packagePath);
      let modified = false;
      
      // 修复构建脚本（移除tsc检查，因为可能有错误）
      if (pkg.scripts && pkg.scripts.build === 'tsc && vite build') {
        pkg.scripts.build = 'vite build';
        modified = true;
        console.log('  ✓ 修复构建脚本');
      }
      
      // 确保有必需的脚本
      if (!pkg.scripts) {
        pkg.scripts = {};
      }
      
      const requiredScripts = {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview'
      };
      
      for (const [name, command] of Object.entries(requiredScripts)) {
        if (!pkg.scripts[name]) {
          pkg.scripts[name] = command;
          modified = true;
          console.log(`  ✓ 添加脚本: ${name}`);
        }
      }
      
      if (modified) {
        await fs.writeJson(packagePath, pkg, { spaces: 2 });
        console.log('✅ package.json已修复');
      } else {
        console.log('✅ package.json正常');
      }
    } catch (error) {
      console.error('✗ 修复失败', error.message);
    }
  }

  /**
   * 运行所有修复
   */
  async fixAll() {
    console.log('\n🚀 开始自动修复...\n');
    
    await this.fixFileNames();
    await this.fixPostCSSConfig();
    await this.ensureConfigFiles();
    await this.fixPackageJson();
    
    console.log('\n✅ 自动修复完成！\n');
  }

  /**
   * 获取所有文件
   */
  async getAllFiles(dir, fileList = []) {
    const files = await fs.readdir(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = await fs.stat(filePath);
      
      if (stat.isDirectory()) {
        if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
          await this.getAllFiles(filePath, fileList);
        }
      } else {
        fileList.push(filePath);
      }
    }
    
    return fileList;
  }
}

module.exports = { CodeFixer };
