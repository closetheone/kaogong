# 考公智能助手

面向考公人群的一站式智能备考工具。

## 技术栈

- **后端**: NestJS + Prisma + PostgreSQL
- **前端**: Taro + React + TypeScript (待搭建)
- **数据库**: PostgreSQL + Redis

## 项目结构

```
kaogong/
├── packages/
│   ├── server/          # NestJS 后端
│   │   ├── src/
│   │   │   ├── user/        # 用户模块
│   │   │   ├── question/    # 题库模块
│   │   │   ├── practice/    # 刷题模块
│   │   │   ├── wrong-question/ # 错题本模块
│   │   │   └── prisma/      # 数据库服务
│   │   ├── prisma/
│   │   │   ├── schema.prisma # 数据库模型
│   │   │   └── seed.ts      # 数据导入脚本
│   │   └── data/
│   │       └── questions.json # 题目数据
│   └── web/             # Taro 前端 (待搭建)
├── 考公智能助手-PRD-V1.0.md  # 产品需求文档
└── README.md
```

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置数据库

```bash
cp packages/server/.env.example packages/server/.env
# 编辑 .env 配置数据库连接
```

### 3. 初始化数据库

```bash
pnpm db:generate
pnpm db:push
```

### 4. 导入题目数据

```bash
pnpm db:seed
```

### 5. 启动后端

```bash
pnpm dev:server
```

## API 接口

### 用户模块
- `POST /user/login` - 微信登录
- `GET /user/:id` - 获取用户信息
- `PUT /user/:id` - 更新用户信息
- `GET /user/:id/stats` - 获取学习统计

### 题库模块
- `GET /question` - 题目列表（支持分页、分类筛选）
- `GET /question/categories` - 获取题目分类
- `GET /question/count` - 各分类题目数量
- `GET /question/random/:category` - 随机获取题目
- `GET /question/:id` - 题目详情

### 刷题模块
- `POST /practice/submit` - 提交答案
- `GET /practice/history/:userId` - 刷题历史
- `GET /practice/stats/:userId` - 每日统计

### 错题本模块
- `GET /wrong-question/:userId` - 错题列表
- `GET /wrong-question/:userId/review` - 待复习错题
- `POST /wrong-question/:userId/review/:questionId` - 标记复习结果
- `PUT /wrong-question/:userId/note/:questionId` - 添加笔记
- `GET /wrong-question/:userId/stats` - 错题统计

## 题库数据

当前已导入：
- 2026年国考行测真题（地市级）130道，含答案和解析

## License

MIT
