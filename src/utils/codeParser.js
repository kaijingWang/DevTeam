class CodeParser {
  static parseCodeBlocks(text) {
    const files = {};
    const lines = text.split('\n');
    
    let currentFile = null;
    let currentCode = [];
    let inCodeBlock = false;
    let codeBlockLang = null;
    
    for (const line of lines) {
      // 检测文件名
      if (line.includes('文件：') || line.includes('File:') || line.includes('###')) {
        // 保存上一个文件
        if (currentFile && currentCode.length > 0) {
          files[currentFile] = currentCode.join('\n').trim();
        }
        
        // 提取文件名
        const match = line.match(/(?:文件：|File:|###\s+)(.+)/);
        if (match) {
          currentFile = match[1].trim();
          currentCode = [];
          inCodeBlock = false;
        }
      }
      // 检测代码块开始/结束
      else if (line.trim().startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        
        if (inCodeBlock) {
          // 提取语言标识
          const langMatch = line.match(/```(\w+)/);
          codeBlockLang = langMatch ? langMatch[1] : null;
        } else {
          codeBlockLang = null;
        }
      }
      // 收集代码
      else if (inCodeBlock && currentFile) {
        currentCode.push(line);
      }
    }
    
    // 保存最后一个文件
    if (currentFile && currentCode.length > 0) {
      files[currentFile] = currentCode.join('\n').trim();
    }
    
    return files;
  }
  
  static extractSummary(text, maxLines = 10) {
    const lines = text.split('\n').filter(line => line.trim());
    return lines.slice(0, maxLines).join('\n');
  }
  
  static countLines(code) {
    return code.split('\n').length;
  }
  
  static estimateTokens(text) {
    // 粗略估计：1 token ≈ 4 字符
    return Math.ceil(text.length / 4);
  }
}

module.exports = { CodeParser };
