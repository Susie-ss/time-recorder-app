# 🕰️ 时光留声机

> **数字遗产管理 · AI 情感陪伴 · 留声舱**
>
> 为你珍藏无法言说的话，让爱跨越时间传递。

[![Deploy](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel)](https://vercel.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## ✨ 功能概览

| 模块 | 功能描述 |
|------|---------|
| 🔐 账户系统 | 注册 / 登录 / JWT 持久化会话，邮箱唯一校验 |
| 🛡️ 安全心跳 | 状态安全环 + "我很好" 一键确认，超时状态三级预警 |
| 📦 资产库 | 文字凭证、图片资产、重要文件三类管理，支持标签筛选 |
| 💌 留声舱 | 文字信件 / 语音克隆 / 3D 神态摄制，三种定时发送策略 |
| 🤖 AI 陪伴 | 创建数字亲人，设定性格 & 记忆碎片，与逝者继续对话 |
| 👤 个人中心 | 修改昵称、邮箱展示、心跳周期自定义（7～90 天） |

---

## 📸 截图预览

> 移动端优先设计，黑金暗色调界面

```
首页（安全心跳）   资产库          留声舱          AI 陪伴
  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
  │  🛡️ 安全  │    │ 📦 文字  │    │ 💌 信件  │    │ 👤 奶奶  │
  │  状态环   │    │ 🖼️ 图片  │    │ 🎤 语音  │    │ 温暖慈爱 │
  │ "我很好"  │    │ 📄 文件  │    │ 🎬 视频  │    │  [对话]  │
  └──────────┘    └──────────┘    └──────────┘    └──────────┘
```

---

## 🚀 快速开始

### 本地运行

```bash
# 克隆项目
git clone https://github.com/Susie-ss/time-recorder-app.git
cd time-recorder-app

# 一键启动（前后端同时）
./start.sh
```

访问 [http://localhost:5173](http://localhost:5173)

> **前提**：已安装 Node.js ≥ 18 和 pnpm

### 手动启动

```bash
# 安装依赖
pnpm install

# 启动 API（端口 3001）
pnpm --filter api dev

# 启动前端（端口 5173）
pnpm --filter web dev
```

---

## 🏗️ 项目架构

```
time-recorder-app/
├── apps/
│   ├── web/                  # 前端 React 应用
│   │   ├── src/
│   │   │   ├── pages/        # 5 个页面模块
│   │   │   │   ├── AuthPage.jsx       # 登录 / 注册
│   │   │   │   ├── HomePage.jsx       # 首页 · 安全心跳
│   │   │   │   ├── AssetsPage.jsx     # 资产库
│   │   │   │   ├── MessagesPage.jsx   # 留声舱
│   │   │   │   ├── RelativesPage.jsx  # AI 陪伴
│   │   │   │   └── ProfilePage.jsx    # 个人中心
│   │   │   ├── components/   # Toast · Modal 等通用组件
│   │   │   ├── store/        # Zustand 全局状态
│   │   │   └── api/          # Axios 请求封装
│   │   └── package.json
│   └── api/                  # 独立 API 服务（备用）
├── api/                      # Vercel Serverless 函数入口
│   └── src/
│       ├── routes/
│       │   ├── auth.js        # 注册 / 登录 / 更新资料
│       │   ├── assets.js      # 资产 CRUD + 文件上传
│       │   ├── messages.js    # 留声舱 CRUD
│       │   ├── relatives.js   # AI 亲人 CRUD + 对话
│       │   └── heartbeat.js   # 心跳确认
│       ├── middleware/
│       │   └── auth.js        # JWT 验证中间件
│       └── db.js              # lowdb 数据库初始化
├── data/
│   └── db.json                # JSON 文件数据库
├── vercel.json                # Vercel 部署配置
├── pnpm-workspace.yaml
└── start.sh                   # 一键本地启动脚本
```

---

## 🛠️ 技术栈

### 前端

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18 | UI 框架 |
| Vite | 6 | 构建工具 |
| Tailwind CSS | 3 | 样式框架 |
| Zustand | 5 | 全局状态管理 |
| Axios | 1 | HTTP 请求 |
| Lucide React | — | 图标库 |
| Capacitor | 8 | Android / iOS 打包 |

### 后端

| 技术 | 版本 | 用途 |
|------|------|------|
| Express | 4 | Web 框架 |
| lowdb | 1 | JSON 文件数据库 |
| bcryptjs | — | 密码加密 |
| jsonwebtoken | — | JWT 认证 |
| uuid | — | 唯一 ID 生成 |

---

## 📱 功能详解

### 🛡️ 安全心跳

每隔固定周期（默认 30 天）需要点击「我很好」确认在线状态。

- 🟢 **状态安全**：7 天内已确认
- 🟡 **请确认状态**：7～14 天未确认
- 🔴 **已超时未响应**：超过 14 天未确认

心跳周期可在「个人中心」自定义为 7 / 14 / 30 / 60 / 90 天。

---

### 📦 资产库

管理你的重要数字资产，支持三种类型：

| 类型 | 说明 |
|------|------|
| 📝 文字凭证 | 账号密码、保险单号、重要说明等纯文字记录 |
| 🖼️ 图片资产 | 扫描件、截图、证件照等图片文件 |
| 📄 重要文件 | PDF、合同、授权书等文档文件 |

支持按类型筛选，支持标签分类，点击卡片查看详情。

---

### 💌 留声舱

提前录制给亲人的信件，选择你希望他们收到的时机。

**留声类型：**
- 📝 **纯文字信件** — 最直接的心里话
- 🎤 **语音克隆** — 保留你的声音
- 🎬 **3D 神态摄制** — 留存你的面容与神情

**发送时机：**
| 策略 | 触发条件 |
|------|---------|
| ⌛ 离世后立即发送 | 心跳超时确认离世后立即触发 |
| ⏰ 指定日期发送 | 在指定日历日期发送 |
| ⏳ 离世后延迟发送 | 离世后 1 个月 / 3 个月 / 1 年 / 3 年 / 5 年 |

每条留声可设置收件人称呼及联系方式，支持查看、编辑、删除。

---

### 🤖 AI 陪伴

创建已逝亲人的数字形象，通过 AI 与他们继续对话。

**创建时可设置：**
- 亲人姓名 & 称谓关系（如：奶奶、父亲）
- 性格标签：温暖慈爱 / 幽默风趣 / 睿智稳重 / 严肃认真
- 记忆碎片：输入关于他们的真实记忆，让 AI 角色更真实

创建后可随时开启对话，AI 会根据设定的性格和记忆碎片作出回应。

---

### 👤 个人中心

- 修改昵称
- 查看邮箱
- 自定义心跳提醒周期
- 数据统计概览（资产数 / 留声数 / AI 亲人数）
- 一键登出

---

## 🌐 部署到 Vercel

1. Fork 本仓库到你的 GitHub 账号
2. 在 [Vercel](https://vercel.com) 导入该 repo
3. Vercel 会自动读取 `vercel.json` 配置，无需额外设置
4. 点击 **Deploy** 完成部署

> ⚠️ **注意**：Vercel Serverless 环境下 `/tmp` 目录为临时存储，每次冷启动后文件上传内容会丢失。如需持久化文件，建议接入对象存储（如腾讯云 COS、阿里云 OSS）。

---

## 📦 Android 打包

```bash
# 1. 构建前端
cd apps/web && npm run build

# 2. 同步到 Capacitor
npx cap sync android

# 3. 用 Android Studio 打开
npx cap open android

# 或通过 GitHub Actions 自动构建
# 见 .github/workflows/build-apk.yml
```

> **环境要求**：Android SDK 36，JDK 17，Capacitor 8.x

---

## 📋 API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/register` | 注册（邮箱唯一） |
| POST | `/api/auth/login` | 登录，返回 JWT |
| GET  | `/api/auth/me` | 获取当前用户信息 |
| PATCH| `/api/auth/profile` | 更新昵称 / 心跳周期 |
| POST | `/api/heartbeat` | 发送心跳"我很好" |
| GET  | `/api/assets` | 获取资产列表 |
| POST | `/api/assets` | 新增资产（支持文件上传） |
| DELETE | `/api/assets/:id` | 删除资产 |
| GET  | `/api/messages` | 获取留声列表 |
| POST | `/api/messages` | 新建留声舱 |
| PUT  | `/api/messages/:id` | 编辑留声舱 |
| DELETE | `/api/messages/:id` | 删除留声舱 |
| GET  | `/api/relatives` | 获取 AI 亲人列表 |
| POST | `/api/relatives` | 创建数字亲人 |
| DELETE | `/api/relatives/:id` | 删除数字亲人 |
| POST | `/api/relatives/:id/chat` | 与数字亲人对话 |

所有受保护接口需携带 `Authorization: Bearer <token>` 请求头。

---

## 🗂️ 数据存储

本地开发使用 `data/db.json` 作为 JSON 文件数据库（lowdb），开箱即用，无需安装数据库。

```json
{
  "users": [],
  "assets": [],
  "messages": [],
  "relatives": []
}
```

---

## 📄 License

MIT © 2026 时光留声机
