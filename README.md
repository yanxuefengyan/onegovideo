# OneGoVideo - AI 短视频一键生成平台

基于小米 MiMo 大模型的短视频生成应用，支持文生图、视频生成、智能剪辑、字幕生成、背景音乐推荐等功能。

## ✨ 功能特性

### 🎨 文生图
- 输入文字描述生成精美图像
- 支持多种艺术风格（写实、动漫、卡通等）
- 自定义配色方案和宽高比
- 即时预览和下载

### 🎬 视频生成
- AI 自动生成视频脚本
- 分镜拆解和场景设计
- 文字动画和粒子效果
- Canvas 渲染动态视觉内容

### 📝 字幕生成
- 基于脚本自动生成字幕
- 智能断句和时间轴计算
- 支持多种显示样式

### 🎵 背景音乐推荐
- 根据视频内容智能推荐音乐
- 音量自动调节
- 淡入淡出效果

### 💾 一键下载
- 实时预览生成结果
- 支持多种分辨率和格式
- 一键导出视频

## 🛠️ 技术栈

### 前端
- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS 4.x
- **组件库**: shadcn/ui
- **状态管理**: Zustand
- **图标**: Lucide React
- **视频处理**: Canvas API + MediaRecorder

### 后端
- **运行时**: Node.js 20+
- **API**: Next.js API Routes
- **视频合成**: FFmpeg

### AI 服务
- **小米 MiMo 模型**: mimo-v2.5-pro、mimo-v2.5、mimo-v2.5-tts 等

## 📦 安装

```bash
# 克隆项目
git clone <repository-url>
cd onegovideo

# 安装依赖
npm install
```

## ⚙️ 配置

创建 `.env.local` 文件，配置 MiMo API：

```env
# MiMo API 配置
MIMO_API_BASE_URL=https://token-plan-cn.xiaomimimo.com/v1
MIMO_API_KEY=your-api-key-here
MIMO_MODEL_ID=mimo-v2.5-pro
```

## 🚀 运行

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm run start
```

默认运行在 `http://localhost:3001`

## 📁 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── api/                # API 路由
│   │   ├── music/          # 音乐推荐 API
│   │   ├── script/         # 脚本生成 API
│   │   └── video/          # 视频生成 API
│   ├── create/             # 视频创作页面
│   ├── text-to-image/      # 文生图页面
│   ├── globals.css         # 全局样式
│   ├── layout.tsx          # 布局组件
│   └── page.tsx            # 首页
├── components/             # 通用组件
│   └── ui/                 # shadcn/ui 组件
├── lib/                    # 工具库
│   ├── mimo/               # MiMo API 客户端
│   ├── music/              # 音乐库管理
│   ├── store/              # 文件存储
│   ├── video/              # 视频生成工具
│   ├── imageGenerator.ts   # 图像生成引擎
│   ├── dancerGenerator.ts  # 舞者动画生成
│   └── utils.ts            # 通用工具函数
└── store/                  # Zustand 状态管理
    └── video.ts            # 视频状态
```

## 🔧 API 端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/script/generate` | POST | 生成视频脚本 |
| `/api/video/generate` | POST | 生成视频 |
| `/api/video/status/:taskId` | GET | 查询任务状态 |
| `/api/music` | GET | 获取音乐列表 |

## 📖 使用说明

### 文生图
1. 访问 `http://localhost:3001/text-to-image`
2. 输入图像描述（如："一个女孩"）
3. 选择艺术风格和配色方案
4. 点击生成按钮
5. 预览并下载图像

### 视频生成
1. 访问 `http://localhost:3001/create`
2. 输入视频主题描述
3. 配置视频参数（时长、风格等）
4. 点击生成视频
5. 预览生成的视频并下载

## 📝 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**OneGoVideo** - 让 AI 创作更简单 🎬
