#!/bin/bash
# 时光留声机 - 启动脚本
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NODE="/Users/q1a2z3/.workbuddy/binaries/node/versions/22.22.2/bin/node"
VITE="$SCRIPT_DIR/node_modules/.pnpm/vite@5.4.21/node_modules/vite/bin/vite.js"

echo "🕰️  启动时光留声机..."

# Kill old processes if running
pkill -f "time-recorder-app/apps/api/src/index.js" 2>/dev/null || true
pkill -f "time-recorder-app.*vite" 2>/dev/null || true
sleep 1

# Start API
echo "  ➜ 启动后端 API (port 3001)..."
cd "$SCRIPT_DIR/apps/api"
$NODE src/index.js > /tmp/tr-api.log 2>&1 &
API_PID=$!

# Start Web
echo "  ➜ 启动前端 Vite (port 5173)..."
cd "$SCRIPT_DIR/apps/web"
$NODE "$VITE" --port 5173 > /tmp/tr-web.log 2>&1 &
WEB_PID=$!

echo ""
sleep 2
echo "✅ 启动完成！"
echo "   前端: http://localhost:5173"
echo "   后端: http://localhost:3001/api/health"
echo ""
echo "   API PID: $API_PID  |  Web PID: $WEB_PID"
echo "   日志: /tmp/tr-api.log  /tmp/tr-web.log"
echo ""
echo "按 Ctrl+C 停止服务"

# Wait
wait $API_PID $WEB_PID
