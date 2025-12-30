# 简易即时通讯软件

这是一个使用React和Node.js + Socket.io构建的简易即时通讯软件，支持多用户实时聊天。

## 功能特性

- 实时消息发送和接收
- 多用户连接支持
- 在线用户列表显示
- 用户加入/离开提示
- 消息时间戳显示
- AI助手集成（当消息包含@ai时触发）

## 技术栈

- 前端：React, Socket.io-client
- 后端：Node.js, Express, Socket.io
- AI处理器：Python, OpenAI SDK
- 实时通信：WebSocket

## 项目结构

```
chat_demo/
├── backend/          # 后端服务器
│   ├── server.js     # 主服务器文件
│   ├── ai_handler.py # Python AI处理器
│   ├── .env          # 环境变量配置
│   └── package.json
└── frontend/         # 前端应用
    ├── src/
    │   ├── App.js    # 主应用组件
    │   └── App.css   # 样式文件
    └── package.json
```

## 运行步骤

### 1. 配置DeepSeek API密钥

在 `backend/.env` 文件中设置您的DeepSeek API密钥：

```
DEEPSEEK_API_KEY=your_actual_deepseek_api_key_here
```

### 2. 启动Python AI处理器

```bash
cd backend
python3 ai_handler.py
```

AI处理器将在 `http://localhost:5001` 运行。

### 3. 启动后端服务器

```bash
cd backend
npm start
```

服务器将在 `http://localhost:5000` 运行。

### 4. 启动前端应用

```bash
cd frontend
npm start
```

前端应用将在 `http://localhost:3000` 运行，并自动打开浏览器窗口。

### 5. 使用应用

1. 打开浏览器访问 `http://localhost:3000`
2. 输入用户名并点击"加入"
3. 开始与其他用户聊天
4. 要使用AI功能，在消息中包含@ai，例如："@ai 今天天气怎么样？"

## AI功能说明

- 当您发送包含"@ai"的消息时，系统会将@ai后面的内容作为提示发送给AI
- AI助手会处理您的请求并返回相应的回答
- AI的回答将以"AI助手"的名义显示在聊天室中
- AI功能通过Python脚本处理，使用DeepSeek API

## 多用户测试

要测试多用户功能，可以在不同浏览器或浏览器标签页中打开 `http://localhost:3000`，使用不同的用户名加入聊天室。

## 文件说明

### 后端 (backend/server.js)
- 实现WebSocket服务器
- 处理用户连接、断开连接事件
- 广播消息给所有连接的用户
- 维护在线用户列表
- 与Python AI处理器通信

### Python AI处理器 (backend/ai_handler.py)
- 处理AI请求
- 使用DeepSeek API生成回复
- 提供HTTP API接口供后端服务器调用

### 前端 (frontend/src/App.js)
- 实现聊天界面
- 处理用户输入和消息显示
- 与后端服务器建立WebSocket连接
- 显示在线用户列表

## 注意事项

- 确保后端服务器在前端应用启动前已运行
- 默认后端端口为5000，前端端口为3000，AI处理器端口为5001
- 如果遇到连接问题，请检查端口是否被其他应用占用
- 请确保设置了有效的DeepSeek API密钥以使用AI功能
- 需要先启动Python AI处理器再启动后端服务器