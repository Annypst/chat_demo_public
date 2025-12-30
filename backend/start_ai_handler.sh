#!/bin/bash
# 启动AI处理器的脚本

# 加载环境变量，跳过注释行
if [ -f .env ]; then
    # 逐行读取.env文件，跳过注释行并导出变量
    while IFS= read -r line; do
        # 跳过空行和注释行
        if [[ $line =~ ^[[:space:]]*# ]] || [[ -z $line ]]; then
            continue
        fi
        # 导出变量
        export $line
    done < .env
fi

# 启动Python AI处理器
python3 ai_handler.py