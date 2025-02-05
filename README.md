# 智能标签页分组 / Smart Tab Groups

一个基于 DeepSeek API 的 Chrome 扩展，可以智能地对浏览器标签页进行分组管理。

A Chrome extension powered by DeepSeek API that intelligently organizes browser tabs into groups.

## 功能特点 / Features

- 🤖 使用 AI 智能分析标签页内容 / AI-powered tab content analysis
- 📑 自动对相关标签页进行分组 / Automatic grouping of related tabs
- 🎨 为不同组别分配不同颜色 / Different colors for different groups
- 🔄 支持实时刷新分组 / Real-time group refresh support
- 🔒 安全的 API Key 管理 / Secure API Key management

## 安装方法 / Installation

1. 下载或克隆本仓库到本地
   Clone or download this repository

2. 打开 Chrome 浏览器，进入扩展程序页面（chrome://extensions/）
   Open Chrome browser and navigate to chrome://extensions/

3. 开启"开发者模式"
   Enable "Developer mode"

4. 点击"加载已解压的扩展程序"
   Click "Load unpacked"

5. 选择本仓库所在文件夹
   Select the repository folder

## 使用方法 / Usage

1. 获取 DeepSeek API Key / Get DeepSeek API Key
   - 访问 DeepSeek 官网注册账号 / Visit [DeepSeek website](https://deepseek.com) to register
   - 在控制台中获取 API Key / Get API Key from the console

2. 配置扩展 / Configure Extension
   - 点击扩展图标打开弹窗 / Click extension icon to open popup
   - 在设置区域输入 DeepSeek API Key / Enter DeepSeek API Key in settings
   - API Key 会被安全保存在本地 / API Key will be securely saved locally

3. 使用扩展 / Use Extension
   - 点击"分析标签页"按钮分析当前标签页 / Click "Analyze Tabs" to analyze current tabs
   - 查看分析结果，确认分组是否合理 / Review analysis results
   - 点击"应用分组"按钮应用分组 / Click "Apply Groups" to create tab groups
   - 需要更新时点击"刷新"按钮 / Click "Refresh" to update

## 权限说明 / Permissions

本扩展需要以下权限 / This extension requires the following permissions:
- `tabs`: 用于读取和管理标签页 / For reading and managing tabs
- `tabGroups`: 用于创建和管理标签组 / For creating and managing tab groups
- `storage`: 用于保存设置和分组数据 / For saving settings and group data

## 技术栈 / Tech Stack

- Chrome Extensions API
- DeepSeek API
- JavaScript (ES6+)
- HTML5 & CSS3

## 开发说明 / Development

### 文件结构 / File Structure 