# 时光留声机 - 全栈 App

数字遗产管理 · AI 情感陪伴 · 留声舱

## 启动

```bash
cd time-recorder-app
./start.sh
```

访问 http://localhost:5173

## 架构

```
apps/
├── web/   React 18 + Vite + Tailwind CSS (port 5173)
└── api/   Express + lowdb JSON 存储 (port 3001)
```

## 功能

- 注册/登录（JWT 认证）
- 首页：安全状态环 + "我很好" 心跳确认
- 资产库：文字/图片/文件三类凭证，支持上传
- 留声舱：三种类型留声 + 三种分发时机，支持详情/编辑/删除
- AI 陪伴：创建数字亲人，性格+记忆碎片，真实对话
- 个人中心：修改昵称、心跳周期设置

## 数据存储

`apps/data/db.json` — JSON 文件存储，开箱即用，无需 DB 安装
