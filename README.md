# 智能标签页分组

一个基于 DeepSeek API 的 Chrome 扩展，可以智能地对浏览器标签页进行分组管理。

## 功能特点

- 🤖 使用 AI 智能分析标签页内容
- 📑 自动对相关标签页进行分组
- 🎨 为不同组别分配不同颜色
- 🔄 支持实时刷新分组
- 🔒 安全的 API Key 管理

## 安装方法

1. 下载或克隆本仓库到本地
2. 打开 Chrome 浏览器，进入扩展程序页面（chrome://extensions/）
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择本仓库所在文件夹

## 使用方法

1. 获取 DeepSeek API Key
   - 访问 [DeepSeek 官网](https://deepseek.com) 注册账号
   - 在控制台中获取 API Key

2. 配置扩展
   - 点击扩展图标打开弹窗
   - 在设置区域输入 DeepSeek API Key
   - API Key 会被安全保存在本地

3. 使用扩展
   - 点击"分析标签页"按钮分析当前打开的标签页
   - 查看分析结果，确认分组是否合理
   - 点击"应用分组"按钮将分组应用到浏览器
   - 需要更新时点击"刷新"按钮

## 权限说明

本扩展需要以下权限：
- `tabs`: 用于读取和管理标签页
- `tabGroups`: 用于创建和管理标签组
- `storage`: 用于保存设置和分组数据

## 技术栈

- Chrome Extensions API
- DeepSeek API
- JavaScript (ES6+)
- HTML5 & CSS3

## 开发说明

### 文件结构 