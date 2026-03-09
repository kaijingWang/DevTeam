#!/bin/bash

echo "🧪 测试DevTeam CLI"
echo ""

# 测试配置命令
echo "1. 测试配置命令..."
npm run dev -- config list

echo ""
echo "2. 测试开发命令..."
npm run dev -- dev "测试需求"

echo ""
echo "✅ 测试完成"
