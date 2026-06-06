# 变更日志

## 2026-06-07 — 项目初始化

### 技术栈
- **框架**: Next.js 16 (App Router) + TypeScript
- **样式**: Tailwind CSS v4
- **数据库**: better-sqlite3 (SQLite)
- **认证**: jose (JWT) + bcryptjs
- **UI 风格**: 白色简洁，大量圆角 (rounded-2xl/3xl)

### 功能清单

| 功能 | 说明 |
|------|------|
| 📝 投稿 | 角色投稿（表单）+ 修饰符投稿（表单），按周期自动开关 |
| 🔍 查看投稿 | 双标签（角色/修饰符），卡片展示，👍👎 点赞踩，💡 建议弹窗 |
| 🗳️ 投票 | 投票期开放投票（每人每周期1票），非投票期展示上期排名 |
| 👤 我的 | 个人中心：头像上传、投稿历史、周期排名、🔄重新投递、退出登录 |
| 🔑 登录 | 两步注册（基本信息 → 简介），JWT登录 |
| 👑 管理员 | ID `2827186780` 为管理员，可在查看投稿页删除任意投稿 |

### 数据库表
- `users` — 用户（含 avatar、is_admin）
- `cycles` — 周期（自动创建）
- `characters` — 角色投稿
- `modifiers` — 修饰符投稿
- `votes` — 投票记录（UNIQUE user+type+cycle 保证一人一票）
- `reactions` — 点赞/踩
- `suggestions` — 建议

### 周期逻辑
- **角色周期**: 2周，周一 ~ 第二周周五投稿，第二周周六日投票
- **修饰符周期**: 1周，周一 ~ 周五投稿，周六日投票
- 参考起始日: 2026-06-01 (周一)

---

## 2026-06-07 #2 — 角色商店改为动态道具列表

### 改动内容

**角色商店字段改造**：
- 原来：单个文本输入框，自由填写
- 现在：点击 **「+ 添加道具」** 按钮动态添加行
- 每行包含：**道具名称** 输入框 + **价格** 输入框 + **✕ 删除按钮**
- 存储格式：JSON 数组 `[{"name":"道具名","price":"价格"}, ...]`
- 兼容旧数据：旧格式纯文本不会报错，会自动忽略（不显示）

**受影响文件**：
- `src/components/CharacterForm.tsx` — 商店改为动态行
- `src/components/SubmissionCard.tsx` — 新增 `shopItems` prop，商店道具以卡片形式展示
- `src/app/browse/page.tsx` — 解析商店 JSON 传递给 SubmissionCard

### 关键代码位置

| 文件 | 功能 |
|------|------|
| `src/lib/db.ts` | 数据库初始化、建表 |
| `src/lib/cycle.ts` | 周期计算（getCycleStatus、getCycleRanking） |
| `src/lib/auth.ts` | JWT 签发/验证/cookie 操作 |
| `src/types/index.ts` | 全部 TypeScript 类型定义 |
| `src/app/api/auth/register/route.ts` | 注册（含管理员自动分配） |
| `src/app/api/auth/login/route.ts` | 登录（含管理员权限补授） |
| `src/app/api/auth/avatar/route.ts` | 头像上传 |
| `src/app/api/characters/route.ts` | 角色 CRUD + user_reaction 填充 |
| `src/app/api/characters/[id]/route.ts` | 角色详情 + 管理员删除 |
| `src/app/api/modifiers/route.ts` | 修饰符 CRUD + user_reaction 填充 |
| `src/app/api/modifiers/[id]/route.ts` | 管理员删除修饰符 |
| `src/app/api/vote/route.ts` | 投票（含周期检查+一人一票） |
| `src/app/api/vote/results/route.ts` | 投票排名结果 |
| `src/app/api/reactions/route.ts` | 点赞/踩（切换/取消） |
| `src/app/api/suggestions/route.ts` | 建议 CRUD |
| `src/app/api/profile/[userId]/route.ts` | 用户主页数据 |
| `src/app/api/resubmit/route.ts` | 重新投递（含第一名检查） |
| `src/components/Navbar.tsx` | 导航栏（头像+名字，无退出按钮） |
| `src/components/CharacterForm.tsx` | 角色投稿表单（含动态商店道具） |
| `src/components/ModifierForm.tsx` | 修饰符投稿表单 |
| `src/components/SubmissionCard.tsx` | 投稿卡片（商店道具/故事展示） |
| `src/components/ReactionButtons.tsx` | 点赞踩按钮组 |
| `src/components/SuggestModal.tsx` | 建议弹窗 |
| `src/components/VoteCard.tsx` | 投票卡片 |
| `src/components/RankingCard.tsx` | 排名卡片 |
| `src/components/CycleStatusBanner.tsx` | 周期状态横幅 |
| `src/components/TabSwitch.tsx` | 标签切换 |
| `src/components/AuthGuard.tsx` | 登录守卫 |
| `src/components/LoginForm.tsx` | 登录/注册表单 |

### 管理员 ID
`2827186780` — 注册或登录时自动获得管理员权限

### 启动方式
```bash
cd "c:/Users/张大妈/Desktop/vibe项目/投票"
npm run dev
# 访问 http://localhost:3000
```
