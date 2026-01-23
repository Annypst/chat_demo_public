import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './App.css';

const App = () => {
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState([]);
  const [showAbout, setShowAbout] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // 添加ref用于滚动到底部
  const messagesContainerRef = useRef(null);

  // 自动滚动到底部的函数
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      // 使用scrollTo方法，兼容性更好，特别是在移动设备上
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  // 连接到服务器
  useEffect(() => {
    // 根据当前访问的域名动态确定后端地址
    const getBackendUrl = () => {
      const hostname = window.location.hostname;
      
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3001'; // 本地开发环境
      } else {
        // 生产环境或远程访问，使用你的公网后端地址
       
        return 'frp-add.com:10673'; // 使用你的公网后端地址
      }
    };

    const serverUrl = getBackendUrl();
    const newSocket = io(serverUrl);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('已连接到服务器');
    });

    // 监听消息
    newSocket.on('message', (data) => {
      setMessages(prev => [...prev, data]);
    });

    // 监听用户列表
    newSocket.on('user_list', (userList) => {
      setUsers(userList);
    });

    // 监听用户加入
    newSocket.on('user_joined', (username) => {
      setMessages(prev => [...prev, { username: '系统', message: `${username} 加入了聊天室`, timestamp: new Date() }]);
    });

    // 监听用户离开
    newSocket.on('user_left', (username) => {
      setMessages(prev => [...prev, { username: '系统', message: `${username} 离开了聊天室`, timestamp: new Date() }]);
      setUsers(prev => prev.filter(user => user !== username));
    });

    return () => newSocket.close();
  }, []);

  // 每当消息更新时，滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 加入聊天室
  const joinChat = () => {
    if (username.trim() !== '') {
      socket.emit('join', username);
      setIsConnected(true);
    }
  };

  // 发送消息
  const sendMessage = (e) => {
    e.preventDefault();
    if ((message.trim() !== '' || selectedImage) && socket) {
      if (selectedImage) {
        // 发送图片消息
        const reader = new FileReader();
        reader.onload = function(event) {
          socket.emit('message', { 
            message: message, 
            image: event.target.result // 图片的base64编码
          });
          setMessage('');
          setSelectedImage(null);
          setImagePreview(null);
        };
        reader.readAsDataURL(selectedImage);
      } else {
        // 发送普通文本消息
        socket.emit('message', { message });
        setMessage('');
      }
    }
  };

  // 处理图片选择
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) { // 限制5MB
        alert('图片大小不能超过5MB');
        return;
      }
      setSelectedImage(file);
      
      // 创建预览
      const reader = new FileReader();
      reader.onload = function(event) {
        setImagePreview(event.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert('请选择有效的图片文件');
    }
  };

  // 清除选择的图片
  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  return (
    <div className="app">
      <div className="chat-container">
        {!isConnected ? (
          <div className="join-screen">
            <h2>加入聊天室</h2>
            <input
              type="text"
              placeholder="输入您的用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && joinChat()}
            />
            <button onClick={joinChat}>加入</button>
          </div>
        ) : (
          <>
            <div className="header">
              <h1>AI 聊天室</h1>
              <p>已经接入ai，使用 @ai 命令触发 AI 助手</p>
              <p>© 2025 AI 聊天室 @Annypst V2.0</p>
              <div className="user-info">
                <span>用户: {username}</span>
              </div>
            </div>
            
            <div className="chat-area">
              <div className="users-panel">
                <h3>在线用户 ({users.length})</h3>
                <ul>
                  {users.map((user, index) => (
                    <li key={index} className={user === username ? 'current-user' : ''}>
                      {user} {user === username ? '(我)' : ''}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="messages-panel">
                {/* 添加ref到消息容器 */}
                <div className="messages" ref={messagesContainerRef}>
                  {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.username === username ? 'own-message' : ''}`}>
                      <div className="message-header">
                        <span className="username">{msg.username}</span>
                        <span className="timestamp">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div className="message-content">
                        {msg.message && <div>{msg.message}</div>}
                        {msg.image && <img src={msg.image} alt="Shared" className="shared-image" />}
                      </div>
                    </div>
                  ))}
                </div>
                
                <form className="message-form" onSubmit={sendMessage}>
                  <input
                    type="text"
                    placeholder="输入消息..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <div className="image-input-area">
                    <label htmlFor="image-upload" className="image-upload-button">📎</label>
                    <input 
                      id="image-upload" 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange} 
                      style={{ display: 'none' }} 
                    />
                    {imagePreview && (
                      <div className="image-preview-container">
                        <img src={imagePreview} alt="预览" className="image-preview" />
                        <button type="button" className="remove-image-button" onClick={removeImage}>×</button>
                      </div>
                    )}
                  </div>
                  <button type="submit">发送</button>
                </form>
              </div>
            </div>
            
            <div className="about-section">
              <button className="about-button" onClick={() => setShowAbout(true)}>
                关于
              </button>
            </div>
            
            {/* 关于模态框 */}
            {showAbout && (
              <div className="about-modal" onClick={() => setShowAbout(false)}>
                <div className="about-content" onClick={(e) => e.stopPropagation()}>
                  <div className="about-header">
                    <h2>关于 AI 聊天室</h2>
                    <button className="close-button" onClick={() => setShowAbout(false)}>×</button>
                  </div>
                  <div className="about-body">
                    <p>欢迎使用 AI 聊天室！</p>
                    <p>这是一个集成了AI助手的实时聊天应用，支持多用户在线聊天和AI对话功能。</p>
                    <p><strong>功能特点：</strong></p>
                    <ul>
                      <li>实时多人聊天</li>
                      <li>AI助手集成（使用 @ai 命令触发）</li>
                      <li>在线用户显示</li>
                      <li>简洁友好的用户界面</li>
                    </ul>
                    <p><strong>使用方法：</strong></p>
                    <ul>
                      <li>输入用户名加入聊天室</li>
                      <li>在消息中使用 @ai 前缀调用AI助手</li>
                      <li>与在线用户实时交流</li>
                    </ul>
                    <p>版本：V2.0</p>
                    <p>开发者：@Annypst</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default App;