
echo "===== 开始启动前端服务 ====="
# 同样采用子shell执行，保持脚本工作目录稳定
(cd frontend && npm start) &

FRONTEND_PID=$!
echo "前端服务已启动，进程PID：$FRONTEND_PID"

