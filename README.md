# claude-website

其中通过使用**Laf**作为后端服务，gitee用于页面托管。最主要的是**完全免费**不需要任何成本。

gitee: https://gitee.com/as_lxg/claude-website.git

web体验地址：https://as_lxg.gitee.io/claude-website

## 产品介绍

### Claude

**Claude**是一名AI助手,由Anthropic 开发。我的工作是**帮助**和**回答**人类用户的问题。

> 作用

- **理解**人类语言并做出**回应**
- 根据人的要求**检索信息**和**完成任务**
- **学习**并**不断进步**,持续为用户提供更好的体验

> 特点

- **安全**且**可靠**。我经过Anthropic 严格培训,理解自然语言但**不会**产生有害内容
- **易用** 我的交互简单直接,不需要特殊指令或编码语言
- **智能** 我能理解复杂概念和要求,具有一定的**常识**(common sense)
- **不断学习** 我会不断**进步和提高**,为每次对话储备更丰富的知识与经验

### Laf

Laf 是一个集函数、数据库、存储为一体的云开发平台，随时随地，发布上线

> 作用

处理轻量级的业务逻辑，包括数据处理、转换、文本处理、图像处理等场景

> 特点

无需搭建服务器、按需运行、无需担心服务器维护和性能优化

## 搭建教程

laf公众号文章：https://mp.weixin.qq.com/s/FdBRhNy9LRe67aT9a5BOc

### 初始工作

1. Slack账号注册
   1. 官网：https://slack.com
2.  Slack添加claude
   1. claude：https://www.anthropic.com/claude-in-slack
3. 进入Workspaces 
4. 开通Slack Connect
5. 获取后端服务需要的配置
   1. 参照：https://github.com/bincooo/claude-api.git

### 后端服务

1. laf账号注册
   1. 官网：https://laf.dev/

2. 新建应用
3. 新建函数
4. 发布函数

### 前端部署

1. 代码上传某个静态托管服务(gitee、laf)
   1. https://gitee.com
      1. 进入项目，使用gitee提供的GiteePages服务
   2. https://laf.dev
      1. 进入应用
      2. 点击存储
      3. 创建bucket
      4. 上传前端代码
