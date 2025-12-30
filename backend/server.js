const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config(); // 用于加载环境变量

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // 允许所有来源，也可以设置为特定的域名或IP
    methods: ["GET", "POST"]
  }
});

// 中间件
app.use(cors());

// 存储连接的用户
const users = {};

// 检查消息是否包含AI请求
function containsAIRequest(message) {
  return message.toLowerCase().includes('@ai');
}

// 处理AI请求
async function handleAIRequest(message, socket) {
  return new Promise((resolve) => {
    const { spawn } = require('child_process');
    const axios = require('axios');
    
    // 提取@ai后面的内容
    const aiPrompt = message.split('@ai')[1].trim();
    
    // 尝试通过HTTP请求调用Python AI处理器
    axios.post('http://localhost:5001/ai/process', {
      message: aiPrompt
    }, {
      timeout: 30000 // 30秒超时
    })
    .then(response => {
      if (response.data && response.data.response) {
        const aiResponse = response.data.response;
        
        // 发送AI的回复到聊天室
        const aiMessageData = {
          username: 'AI助手',
          message: aiResponse,
          timestamp: new Date()
        };
        
        // 广播AI的回复
        io.emit('message', aiMessageData);
        
        console.log(`AI助手回复: ${aiResponse}`);
        resolve(aiResponse);
      } else {
        const errorMessage = "AI助手暂时无法响应。";
        
        // 发送错误消息到聊天室
        const errorMessageData = {
          username: '系统',
          message: errorMessage,
          timestamp: new Date()
        };
        
        socket.emit('message', errorMessageData);
        resolve(errorMessage);
      }
    })
    .catch(error => {
      console.error('Error calling AI processor:', error.message);
      const errorMessage = "AI助手暂时无法响应。";
      
      // 发送错误消息到聊天室
      const errorMessageData = {
        username: '系统',
        message: errorMessage,
        timestamp: new Date()
      };
      
      socket.emit('message', errorMessageData);
      resolve(errorMessage);
    });
  });
}

// 监听连接事件
io.on('connection', (socket) => {
  console.log('用户已连接:', socket.id);

  // 处理用户加入事件
  socket.on('join', (username) => {
    users[socket.id] = username;
    socket.broadcast.emit('user_joined', username);
    io.emit('user_list', Object.values(users));
    console.log(`${username} 加入了聊天室（使用@ai 命令 触发AI助手）`);
  });

  // 处理消息事件
  socket.on('message', async (data) => {
    const messageData = {
      username: users[socket.id],
      message: data.message,
      image: data.image, // 添加图片数据
      timestamp: new Date()
    };
    
    if (data.image) {
      console.log(`${users[socket.id]} 发送了图片: ${data.message || '(无描述)'}`);
    } else {
      console.log(`${users[socket.id]} 说: ${data.message}`);
    }
    
    // 检查消息是否包含@ai
    if (containsAIRequest(data.message)) {
      // 发送用户消息到聊天室（但不包括AI的部分）
      const userMessageData = {
        username: users[socket.id],
        message: data.message,
        image: data.image, // 包含图片数据
        timestamp: new Date()
      };
      io.emit('message', userMessageData);
      
      // 处理AI请求
      await handleAIRequest(data.message, socket);
    } else {
      // 普通消息或图片消息，直接广播
      io.emit('message', messageData);
    }
  });

  // 处理断开连接事件
  socket.on('disconnect', () => {
    const username = users[socket.id];
    if (username) {
      console.log(`${username} 离开了聊天室`);
      delete users[socket.id];
      socket.broadcast.emit('user_left', username);
      io.emit('user_list', Object.values(users));
    }
  });
});

const PORT = process.env.PORT || 5000;
// 启动服务器，监听所有网络接口
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on all interfaces at port ${PORT}`);
  console.log(`Access the application via http://YOUR_IP_ADDRESS:${PORT}`);
});