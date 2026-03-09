#!/bin/bash

# DevTeam CLI 快速安装脚本（使用 npm）
# 适用于: macOS, Linux

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║          DevTeam CLI v2.0.0 - 快速安装                   ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗${NC} 未安装 Node.js"
    echo ""
    echo "请先安装 Node.js (v16+):"
    echo "  macOS:   brew install node"
    echo "  Linux:   sudo apt install nodejs npm"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓${NC} Node.js $(node -v)"

# 检查 npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗${NC} 未安装 npm"
    exit 1
fi

echo -e "${GREEN}✓${NC} npm $(npm -v)"
echo ""

# 方法1: 从 GitHub 安装
echo -e "${BLUE}ℹ${NC} 方法1: 从 GitHub 克隆安装"
echo ""

read -p "是否使用此方法? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    TEMP_DIR=$(mktemp -d)
    cd "$TEMP_DIR"
    
    echo -e "${BLUE}ℹ${NC} 克隆仓库..."
    
    if git clone https://github.com/kaijingWang/DevTeam.git devteam-cli; then
        echo -e "${GREEN}✓${NC} 克隆完成"
        cd devteam-cli
        
        echo -e "${BLUE}ℹ${NC} 安装依赖..."
        npm install --production
        
        echo -e "${BLUE}ℹ${NC} 全局安装..."
        if npm link; then
            echo -e "${GREEN}✓${NC} 安装完成"
        else
            echo -e "${BLUE}ℹ${NC} 尝试使用 sudo..."
            sudo npm link
        fi
        
        cd ~
        rm -rf "$TEMP_DIR"
    else
        echo -e "${RED}✗${NC} 克隆失败"
        echo ""
        echo "可能的原因："
        echo "  1. 网络连接问题"
        echo "  2. GitHub 访问受限"
        echo "  3. 未安装 git"
        echo ""
        echo "请尝试方法2（手动安装）"
        exit 1
    fi
else
    echo ""
    echo -e "${BLUE}ℹ${NC} 方法2: 手动安装"
    echo ""
    echo "请按以下步骤操作："
    echo ""
    echo "1. 克隆仓库:"
    echo "   git clone https://github.com/kaijingWang/DevTeam.git"
    echo ""
    echo "2. 进入目录:"
    echo "   cd DevTeam"
    echo ""
    echo "3. 安装依赖:"
    echo "   npm install"
    echo ""
    echo "4. 全局安装:"
    echo "   npm link"
    echo "   # 如果权限不足，使用: sudo npm link"
    echo ""
    exit 0
fi

# 配置向导
echo ""
read -p "是否现在配置 Claude API Key? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    read -p "请输入你的 Claude API Key: " API_KEY
    
    if [ -n "$API_KEY" ]; then
        devteam config set llm.apiKey "$API_KEY"
        echo -e "${GREEN}✓${NC} API Key 已配置"
    fi
fi

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                    安装成功！                             ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "🚀 快速开始:"
echo ""
echo "  devteam dev \"用户登录功能\""
echo ""
echo "📖 查看帮助:"
echo "  devteam --help"
echo ""
