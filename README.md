# 小说编写平台

<div align="center">

![小说编写平台](public/banner.png)

一个基于 Next.js 的全栈小说编写平台，提供 AI 辅助编写、多用户系统、管理员后台和按 token 计费功能。

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

[功能特性](#功能特性) · [快速开始](#快速开始) · [部署教程](#部署教程) · [项目截图](#项目截图)

</div>

## 功能特性

### 用户功能
- 🔐 **用户注册登录** - 简洁的注册登录界面，注册即送 2 元初始额度
- 📚 **小说管理** - 创建、编辑、删除小说，支持攻受文、男女文等多种类型
- 📑 **章节管理** - 多章节创作，自由排序和编辑
- 🤖 **AI 辅助编写** - 集成多个大模型 API（OpenAI、Claude、智谱等），支持自定义 API Key
- 💰 **按 token 计费** - 精确计费，人民币结算，实时查看余额和消耗记录
- 👤 **角色设定** - 自定义男主角和女主角的名字、性格等属性

### 管理员功能
- 🔑 **权限管理** - 用户通过授权码成为管理员
- 🔌 **API 渠道管理** - 添加、编辑、删除多个 AI 渠道，支持预置渠道和自定义渠道
- 💸 **模型定价** - 灵活设置每个模型的输入/输出 token 价格
- 📊 **使用统计** - 查看各渠道的使用情况

## 项目截图

### 首页
![首页](public/screenshots/home.png)

### 登录/注册
![登录页](public/screenshots/login.png)
![注册页](public/screenshots/register.png)

### 仪表盘
![仪表盘](public/screenshots/dashboard.png)

### 小说列表
![小说列表](public/screenshots/novels.png)

### 编辑器
![编辑器](public/screenshots/editor.png)

## 技术栈

- **前端框架**: Next.js 16 (App Router)
- **UI 库**: Tailwind CSS
- **后端**: Next.js API Routes + Server Actions
- **数据库**: PostgreSQL 16
- **ORM**: Prisma 5
- **认证**: JWT (jose)
- **AI 集成**: OpenAI API、Claude API、智谱 API、文心 API、通义 API

## 快速开始

### 前置要求

- Node.js 18+ 
- PostgreSQL 16+
- npm 或 yarn 或 pnpm

### 安装步骤

```bash
# 1. 克隆项目
git clone https://github.com/su469843/fuwuqi.git
cd fuwuqi

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env

# 编辑 .env 文件，填写以下内容：
# DATABASE_URL=postgresql://user:password@localhost:5432/novel_platform
# JWT_SECRET=your-secret-key-here
# ADMIN_CODE=your-admin-code-here

# 4. 初始化数据库
npx prisma generate
npx prisma db push

# 5. 启动开发服务器
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 部署教程

### 方式一：Docker 部署（推荐）

```bash
# 1. 使用 Docker Compose 一键启动
docker compose up -d

# 2. 等待服务启动（首次启动需要初始化数据库）
# 查看日志：docker compose logs -f

# 3. 应用将在 http://localhost:3000 运行
```

**说明**：
- Docker Compose 会自动启动 PostgreSQL、Redis 和应用服务
- 数据会持久化到 Docker volume
- 生产环境请修改 `docker-compose.yml` 中的密码和密钥

### 方式二：手动部署

#### 1. 准备服务器环境

```bash
# 安装 Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 PostgreSQL 16
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt-get update
sudo apt-get install -y postgresql-16

# 创建数据库
sudo -u postgres psql
CREATE DATABASE novel_platform;
CREATE USER novel_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE novel_platform TO novel_user;
\q
```

#### 2. 部署应用

```bash
# 克隆项目
git clone https://github.com/su469843/fuwuqi.git
cd fuwuqi

# 安装依赖
npm install

# 生成 Prisma 客户端
npx prisma generate

# 推送数据库结构
DATABASE_URL="postgresql://novel_user:your_password@localhost:5432/novel_platform" npx prisma db push

# 构建生产版本
npm run build

# 启动服务（建议使用 PM2）
npm install -g pm2
pm2 start npm --name "novel-platform" -- start
pm2 save
pm2 startup
```

#### 3. 配置 Nginx 反向代理（可选）

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 方式三：云平台部署

#### Vercel 部署

1. Fork 本仓库
2. 访问 [Vercel](https://vercel.com/new)
3. 导入 Fork 的仓库
4. 配置环境变量：
   - `DATABASE_URL`: PostgreSQL 连接字符串（使用 Vercel Postgres 或外部数据库）
   - `JWT_SECRET`: 随机密钥
   - `ADMIN_CODE`: 管理员授权码
5. 部署

#### Railway 部署

1. 访问 [Railway](https://railway.app/new)
2. 选择 "Deploy from GitHub repo"
3. 选择本仓库
4. 添加 PostgreSQL 插件
5. 配置环境变量
6. 部署

## 环境变量说明

| 变量名 | 说明 | 必填 | 示例 |
|-------|------|------|------|
| `DATABASE_URL` | PostgreSQL 数据库连接字符串 | 是 | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | JWT 签名密钥 | 是 | 随机字符串，至少 32 字符 |
| `ADMIN_CODE` | 管理员授权码 | 是 | 仅管理员可知的授权码 |

## 数据库结构

项目包含 6 个核心数据表：

- `User` - 用户表（邮箱、密码、角色、余额、API Key）
- `Novel` - 小说表（标题、类型、角色设定）
- `Chapter` - 章节表（标题、内容、顺序）
- `APIChannel` - API 渠道表（渠道配置、模型列表）
- `ModelPricing` - 模型定价表（输入/输出价格）
- `UsageRecord` - 使用记录表（token 消耗、费用）

详细的数据库 schema 请查看 `prisma/schema.prisma`。

## API 接口文档

### 认证接口

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/admin/me` - 成为管理员

### 小说接口

- `GET /api/novels` - 获取小说列表
- `POST /api/novels` - 创建小说
- `PUT /api/novels?id=xxx` - 更新小说
- `DELETE /api/novels?id=xxx` - 删除小说

### 章节接口

- `GET /api/chapters?novelId=xxx` - 获取章节列表
- `POST /api/chapters` - 创建章节
- `PUT /api/chapters?id=xxx` - 更新章节

### AI 接口

- `POST /api/ai/generate` - AI 生成内容

### 管理员接口

- `GET /api/admin/channels` - 获取渠道列表
- `POST /api/admin/channels` - 添加渠道
- `PUT /api/admin/channels?id=xxx` - 更新渠道
- `DELETE /api/admin/channels?id=xxx` - 删除渠道
- `GET /api/admin/pricing` - 获取定价列表
- `POST /api/admin/pricing` - 设置定价
- `DELETE /api/admin/pricing?id=xxx` - 删除定价

## 开发指南

### 目录结构

```
novel-platform/
├── prisma/               # Prisma schema 和迁移
├── public/               # 静态资源
├── src/
│   ├── app/            # Next.js App Router 页面
│   ├── components/     # React 组件
│   └── lib/           # 工具库
├── .env.example        # 环境变量模板
├── docker-compose.yml   # Docker 配置
├── Dockerfile          # 生产环境 Dockerfile
└── README.md          # 项目文档
```

### 添加新功能

1. 在 `prisma/schema.prisma` 中定义数据模型
2. 运行 `npx prisma db push` 同步数据库
3. 在 `src/app/api/` 中创建 API 路由
4. 在 `src/app/` 中创建前端页面
5. 在 `src/lib/` 中添加工具函数

### 代码规范

- 使用 TypeScript 进行类型检查
- 遵循 ESLint 规则
- 使用 Tailwind CSS 进行样式开发
- API 路由使用 `NextResponse` 返回响应
- 客户端使用 `localStorage` 存储 token

## 常见问题

### Q: 如何配置 AI API 渠道？

A: 管理员登录后，进入"管理后台" → "渠道管理"，添加 API 渠道。支持 OpenAI、Claude、智谱等预置渠道，也支持自定义渠道。

### Q: 普通用户如何使用 AI？

A: 管理员配置可用渠道后，普通用户可直接使用。如果管理员未配置，用户可在个人设置中添加自己的 API Key。

### Q: 如何修改初始额度？

A: 在 `src/app/api/auth/register/route.ts` 中修改 `balance` 字段的默认值。

### Q: 如何添加新的小说类型？

A: 在 `prisma/schema.prisma` 的 `Genre` 枚举中添加新类型，并在前端页面中添加对应选项。

## 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件。

## 联系方式

- 作者: [GitHub 用户名](https://github.com/su469843)
- 项目地址: https://github.com/su469843/fuwuqi

---

<div align="center">

如果这个项目对你有帮助，请给一个 ⭐️ Star！

</div>
