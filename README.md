# 考公智能助手

一站式考公刷题 Web 应用，前端 React + Vite + Tailwind，后端 NestJS + Prisma。

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动前端开发服务器 (http://localhost:5173)
pnpm dev

# 启动后端服务 (http://localhost:3000)
pnpm dev:server

# 构建生产版本
pnpm build

# 预览生产构建
pnpm preview
```

## 项目结构

```
packages/
├── web/          # 前端 - React 18 + Vite + TypeScript + Tailwind CSS + Zustand
│   ├── src/
│   │   ├── api/        # API 封装（axios）
│   │   ├── components/ # 公共组件（TabBar、PageContainer）
│   │   ├── pages/      # 页面（首页、刷题、答题、结果、错题本、我的）
│   │   ├── store/      # Zustand 状态管理（持久化到 localStorage）
│   │   └── types/      # TypeScript 类型定义
│   └── public/data/    # 本地真题数据（后端未启动时 fallback）
│
└── server/       # 后端 - NestJS + Prisma
    └── src/
        ├── question/    # 题目接口
        ├── practice/    # 练习记录
        ├── mock-exam/   # 模拟考试
        ├── wrong-question/ # 错题本
        └── user/        # 用户
```

## 技术栈

### 前端
- React 18 + TypeScript
- Vite 5（构建工具）
- Tailwind CSS 3（样式）
- React Router v6（路由）
- Zustand（状态管理，localStorage 持久化）
- Axios（HTTP 请求，统一 {code, message, data} 格式）

### 后端
- NestJS 10
- Prisma ORM
- 统一响应格式：`{ code: 0, message: 'success', data: {...} }`

## 功能

- ✅ 首页统计（今日/累计/正确率）
- ✅ 按模块刷题（常识/言语/数量/判断/资料）
- ✅ 随机抽题 10 道一组
- ✅ 实时判分 + 答案解析
- ✅ 练习结果统计
- ✅ 错题本（自动记录错题，支持展开解析）
- ✅ 个人中心（昵称编辑、学习数据统计）
- ✅ 后端不可用时自动 fallback 到本地真题数据
- 📱 移动端优先，响应式设计
