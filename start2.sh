#!/bin/bash


# 第二步：启动后端服务（cd backend && npm start）
echo "===== 开始启动后端服务 ====="

(cd backend && npm start) &

BACKEND_PID=$!
echo "后端服务已启动，进程PID：$BACKEND_PID"

