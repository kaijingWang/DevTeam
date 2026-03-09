#!/bin/bash

# DevTeam CLI 一键安装脚本
# 支持: macOS, Linux, Windows (Git Bash)

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# 打印欢迎信息
print_welcome() {
    echo ""
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║          DevTeam CLI v2.0.0 - 一键安装                   ║"
    echo "║          AI-Powered Development Team                      ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo ""
}

# 检测操作系统
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        OS="windows"
    else
        OS="unknown"
    fi
    
    print_info "检测到操作系统: $OS"
}

# 检查依赖
check_dependencies() {
    print_info "检查依赖..."
    
    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        print_error "未安装 Node.js"
        echo ""
        echo "请先安装 Node.js (v16+):"
        echo "  macOS:   brew install node"
        echo "  Linux:   sudo apt install nodejs npm"
        echo "  Windows: https://nodejs.org"
        echo ""
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 16 ]; then
        print_error "Node.js 版本过低 (需要 v16+)"
        exit 1
    fi
    
    print_success "Node.js $(node -v)"
    
    # 检查 npm
    if ! command -v npm &> /dev/null; then
        print_error "未安装 npm"
        exit 1
    fi
    
    print_success "npm $(npm -v)"
    
    # 检查 git
    if ! command -v git &> /dev/null; then
        print_error "未安装 git"
        echo ""
        echo "请先安装 git:"
        echo "  macOS:   brew install git"
        echo "  Linux:   sudo apt install git"
        echo "  Windows: https://git-scm.com"
        echo ""
        exit 1
    fi
    
    print_success "git $(git --version | awk '{print $3}')"
}

# 安装 DevTeam CLI
install_devteam() {
    print_info "开始安装 DevTeam CLI..."
    echo ""
    
    # 创建临时目录
    TEMP_DIR=$(mktemp -d)
    print_info "临时目录: $TEMP_DIR"
    
    cd "$TEMP_DIR" || exit 1
    
    print_info "克隆仓库..."
    echo ""
    
    # 尝试克隆
    if git clone https://github.com/kaijingWang/DevTeam.git devteam-cli; then
        print_success "仓库克隆完成"
    else
        print_error "克隆失败"
        echo ""
        print_warning "可能的原因："
        echo "  1. 网络连接问题"
        echo "  2. GitHub 访问受限"
        echo ""
        print_info "解决方案："
        echo ""
        echo "方案1: 配置代理"
        echo "  git config --global http.proxy http://127.0.0.1:7890"
        echo "  git config --global https.proxy http://127.0.0.1:7890"
        echo ""
        echo "方案2: 手动安装"
        echo "  git clone https://github.com/kaijingWang/DevTeam.git"
        echo "  cd DevTeam"
        echo "  npm install"
        echo "  npm link"
        echo ""
        echo "方案3: 下载 ZIP"
        echo "  https://github.com/kaijingWang/DevTeam/archive/refs/heads/main.zip"
        echo ""
        
        # 清理
        cd ~ || exit 1
        rm -rf "$TEMP_DIR"
        exit 1
    fi
    
    cd devteam-cli || exit 1
    
    echo ""
    print_info "安装依赖..."
    echo ""
    
    if npm install --production; then
        print_success "依赖安装完成"
    else
        print_error "依赖安装失败"
        echo ""
        print_info "尝试清理缓存后重试..."
        npm cache clean --force
        
        if npm install --production; then
            print_success "依赖安装完成"
        else
            print_error "安装失败"
            echo ""
            print_info "请尝试手动安装："
            echo "  cd $TEMP_DIR/devteam-cli"
            echo "  npm install"
            echo "  npm link"
            exit 1
        fi
    fi
    
    echo ""
    print_info "全局安装..."
    echo ""
    
    if npm link; then
        print_success "全局安装完成"
    else
        print_warning "全局安装失败，尝试使用 sudo..."
        
        if sudo npm link; then
            print_success "全局安装完成 (sudo)"
        else
            print_error "安装失败"
            echo ""
            print_info "请尝试手动安装："
            echo "  cd $TEMP_DIR/devteam-cli"
            echo "  sudo npm link"
            exit 1
        fi
    fi
    
    # 清理临时目录
    cd ~ || exit 1
    rm -rf "$TEMP_DIR"
    
    echo ""
    print_success "DevTeam CLI 安装完成！"
}

# 验证安装
verify_installation() {
    echo ""
    print_info "验证安装..."
    
    if command -v devteam &> /dev/null; then
        print_success "devteam 命令可用"
        echo ""
        devteam --version
    else
        print_warning "devteam 命令未找到"
        echo ""
        print_info "可能需要重新加载 shell:"
        echo "  source ~/.bashrc  # 或 ~/.zshrc"
        echo ""
        print_info "或者检查 PATH:"
        echo "  echo \$PATH"
        echo "  npm config get prefix"
    fi
}

# 配置向导
configure_devteam() {
    echo ""
    print_info "配置向导"
    echo ""
    
    read -p "是否现在配置 Claude API Key? (y/n): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        read -p "请输入你的 Claude API Key: " API_KEY
        
        if [ -n "$API_KEY" ]; then
            if devteam config set llm.apiKey "$API_KEY"; then
                print_success "API Key 已配置"
            else
                print_warning "配置失败，请稍后手动配置"
            fi
        else
            print_warning "未输入 API Key，跳过配置"
        fi
    else
        print_info "跳过配置，稍后可运行: devteam config"
    fi
}

# 显示使用说明
show_usage() {
    echo ""
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║                    安装成功！                             ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo ""
    echo "🚀 快速开始:"
    echo ""
    echo "  1. 配置 API Key (如果还没配置):"
    echo "     $ devteam config set llm.apiKey YOUR_KEY"
    echo ""
    echo "  2. 创建新项目:"
    echo "     $ devteam dev \"用户登录功能\""
    echo ""
    echo "  3. 使用模板:"
    echo "     $ devteam template list"
    echo "     $ devteam template init react-app my-app"
    echo ""
    echo "  4. 代码审查:"
    echo "     $ devteam review src/"
    echo ""
    echo "  5. 修复 Bug:"
    echo "     $ devteam fix \"错误信息\" --file src/app.js"
    echo ""
    echo "  6. 生成文档:"
    echo "     $ devteam docs all"
    echo ""
    echo "  7. AI Pair Programming:"
    echo "     $ devteam pair"
    echo ""
    echo "📖 查看帮助:"
    echo "     $ devteam --help"
    echo ""
    echo "🌐 GitHub: https://github.com/kaijingWang/DevTeam"
    echo ""
}

# 主函数
main() {
    print_welcome
    detect_os
    check_dependencies
    echo ""
    install_devteam
    verify_installation
    configure_devteam
    show_usage
}

# 运行主函数
main
