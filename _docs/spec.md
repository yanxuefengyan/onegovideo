# OneGoVideo - 一键生成短视频应用规格说明

## 1. 项目概述

### 1.1 项目名称
OneGoVideo - 一键生成短视频平台

### 1.2 项目目标
开发一个基于AI的一键短视频生成平台，用户只需输入简单的文字描述或创意想法，系统即可自动生成包含完整字幕、背景音乐和特效的短视频。

### 1.3 核心价值
- 降低视频创作门槛，让非专业用户也能快速生成高质量短视频
- 利用AI技术实现内容个性化定制
- 提供一站式视频生成解决方案

## 2. 技术架构

### 2.1 前端技术栈
- **框架**: Next.js 14+ (App Router)
- **UI组件**: Tailwind CSS + shadcn/ui
- **状态管理**: Zustand
- **视频预览**: Video.js / Plyr
- **部署**: Vercel

### 2.2 后端技术栈
- **运行时**: Node.js 20+
- **API框架**: Next.js API Routes / Express
- **数据库**: PostgreSQL (Prisma ORM)
- **缓存**: Redis
- **任务队列**: BullMQ
- **文件存储**: 阿里云OSS / AWS S3

### 2.3 AI服务集成 (纯小米MiMo方案)
| 模型 | 用途 | 说明 |
|------|------|------|
| mimo-v2.5-pro | 视频脚本生成、分镜拆解、代码生成 | 核心推理模型，1M上下文 |
| mimo-v2.5 | 基础文本处理、内容优化 | 轻量级文本模型 |
| mimo-v2-omni | 多模态理解、视频分析、Agent任务 | 全模态模型，支持音视频理解 |
| mimo-v2.5-tts | 语音合成、旁白生成 | 文本转语音 |
| mimo-v2.5-tts-voiceclone | 语音克隆、个性化配音 | 语音克隆功能 |
| mimo-v2.5-tts-voicedesign | 语音风格设计 | 自定义语音风格 |
| mimo-v2-pro | 备用文本生成 | 旧版文本模型 |
| mimo-v2-tts | 备用语音合成 | 旧版TTS模型 |

### 2.4 视频处理技术
| 技术 | 用途 | 说明 |
|------|------|------|
| FFmpeg | 视频合成、剪辑、转码 | 开源视频处理工具 |
| Sharp | 图像处理、缩略图生成 | Node.js图像处理库 |
| Canvas | 文字动画、特效渲染 | HTML5 Canvas API |

## 3. 核心功能模块

### 3.1 AI视频生成

#### 3.1.1 功能描述
用户输入文字描述，系统通过MiMo模型生成视频脚本、语音，并使用FFmpeg合成最终视频。

#### 3.1.2 工作流程
```
用户输入 → mimo-v2.5-pro生成脚本 → mimo-v2.5-pro生成分镜 → 
mimo-v2.5-tts生成语音 → Canvas生成文字动画 → FFmpeg合成视频
```

#### 3.1.3 详细处理流程
1. **脚本生成**: 使用mimo-v2.5-pro分析用户输入，生成结构化视频脚本
2. **分镜拆解**: 将脚本拆解为多个场景，每个场景包含文字、时长、特效
3. **语音合成**: 使用mimo-v2.5-tts为每个场景生成语音旁白
4. **视觉元素生成**: 使用Canvas API生成文字动画、背景、特效
5. **视频合成**: 使用FFmpeg将所有元素合成为最终视频

#### 3.1.4 输入参数
- 视频主题/描述 (必填)
- 视频风格 (可选): 知识科普、故事叙述、产品介绍、教程等
- 视频时长 (可选): 15s / 30s / 60s / 自定义
- 目标平台 (可选): 抖音、快手、YouTube Shorts等
- 语音风格 (可选): 男声/女声/童声/自定义
- 背景音乐 (可选): 从音乐库选择或自动生成

#### 3.1.5 输出规格
- 分辨率: 720p / 1080p
- 帧率: 24fps / 30fps
- 格式: MP4 (H.264)
- 包含: 语音旁白 + 文字动画 + 背景音乐 + 字幕

### 3.2 智能剪辑

#### 3.2.1 功能描述
基于AI分析视频内容，自动进行智能剪辑和节奏调整。

#### 3.2.2 核心能力
- **场景检测**: 自动识别视频中的不同场景
- **节奏分析**: 根据音乐节拍调整剪辑点
- **内容筛选**: 自动保留精彩片段，删除冗余内容
- **转场效果**: 智能添加合适的转场效果

#### 3.2.3 剪辑模式
1. **自动模式**: 完全自动剪辑
2. **半自动模式**: AI建议 + 用户确认
3. **手动模式**: 提供AI辅助工具

### 3.3 字幕生成

#### 3.3.1 功能描述
基于视频脚本自动生成与语音同步的字幕。

#### 3.3.2 核心能力
- **脚本同步**: 基于mimo-v2.5-pro生成的脚本自动提取字幕
- **时间轴计算**: 根据语音时长自动计算字幕时间轴
- **智能断句**: AI智能断句，符合阅读习惯
- **多语言支持**: 支持中英日韩等主流语言

#### 3.3.3 字幕生成流程
1. 从视频脚本提取文字内容
2. 使用mimo-v2.5-pro进行智能断句
3. 根据TTS生成的语音时长计算时间轴
4. 生成SRT/ASS格式字幕文件

#### 3.3.4 字幕样式
- 字体: 多种字体可选
- 颜色: 支持自定义颜色和描边
- 位置: 顶部/中部/底部
- 动画: 淡入淡出、弹出、卡拉OK效果

### 3.4 背景音乐推荐

#### 3.4.1 功能描述
根据视频内容和风格，智能推荐合适的背景音乐。

#### 3.4.2 推荐策略
1. **内容匹配**: 根据视频主题推荐
2. **情绪匹配**: 根据视频情绪推荐
3. **节奏匹配**: 根据视频节奏推荐
4. **平台适配**: 根据目标平台推荐

#### 3.4.3 音乐来源
- **内置音乐库**: 预置版权免费的背景音乐，按风格、情绪、节奏分类
- **AI推荐**: 使用mimo-v2.5-pro分析视频内容，智能推荐匹配的音乐
- **用户上传**: 支持用户上传自有音乐

#### 3.4.4 音乐处理
- 音量自动调节: 根据语音自动调整背景音乐音量
- 淡入淡出: 音乐开始和结束自动淡入淡出
- 时长适配: 自动裁剪或循环音乐以匹配视频时长

### 3.5 特效添加

#### 3.5.1 功能描述
为视频添加各种视觉特效和滤镜。

#### 3.5.2 特效类型
- **滤镜**: 复古、清新、电影感等
- **转场**: 淡入淡出、滑动、缩放等
- **文字动画**: 标题、注释、水印
- **贴纸/表情**: 动态贴纸库
- **画面特效**: 光效、粒子、变形

#### 3.5.3 特效应用方式
- **自动应用**: AI根据内容自动选择
- **模板应用**: 使用预设特效模板
- **自定义应用**: 用户手动选择和调整

### 3.6 一键下载

#### 3.6.1 功能描述
生成完成后，用户可以一键下载最终视频。

#### 3.6.2 下载选项
- **分辨率选择**: 720p / 1080p / 4K
- **格式选择**: MP4 / MOV / WebM
- **质量选择**: 标准 / 高清 / 无损
- **平台预设**: 直接导出为特定平台格式

#### 3.6.3 分享功能
- 生成分享链接
- 直接分享到社交媒体
- 生成二维码分享

## 4. 用户界面设计

### 4.1 页面结构
```
首页
├── 创作工作台
│   ├── 输入区 (文字描述/上传素材)
│   ├── 预览区 (实时预览)
│   ├── 设置区 (参数配置)
│   └── 控制区 (生成/暂停/取消)
├── 素材库
│   ├── 音乐库
│   ├── 特效库
│   └── 模板库
├── 我的作品
│   ├── 草稿箱
│   ├── 已完成
│   └── 已发布
└── 个人中心
    ├── 账户设置
    ├── API配置
    └── 使用统计
```

### 4.2 交互流程
1. 用户进入创作工作台
2. 输入视频描述或上传素材
3. 选择视频风格和参数
4. 点击"一键生成"
5. 系统处理并显示进度
6. 预览生成结果
7. 微调(可选)
8. 下载或分享

## 5. API设计

### 5.1 核心API端点

#### 视频生成
```typescript
POST /api/video/generate
Body: {
  prompt: string;
  style?: 'realistic' | 'anime' | '3d' | 'flat';
  duration?: 15 | 30 | 60 | number;
  platform?: 'douyin' | 'kuaishou' | 'youtube';
  resolution?: '720p' | '1080p' | '4k';
  referenceImage?: File;
}
Response: {
  taskId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  estimatedTime: number;
}
```

#### 任务状态查询
```typescript
GET /api/video/status/:taskId
Response: {
  taskId: string;
  status: string;
  progress: number;
  result?: {
    videoUrl: string;
    thumbnailUrl: string;
    duration: number;
  };
  error?: string;
}
```

#### 字幕生成
```typescript
POST /api/subtitle/generate
Body: {
  videoId: string;
  language?: string;
  style?: SubtitleStyle;
}
Response: {
  subtitles: Subtitle[];
  timeline: Timeline;
}
```

#### 音乐推荐
```typescript
POST /api/music/recommend
Body: {
  videoId: string;
  mood?: string;
  genre?: string;
  duration: number;
}
Response: {
  recommendations: MusicTrack[];
}
```

### 5.2 MiMo API集成
```typescript
// MiMo API配置
const MIMO_CONFIG = {
  baseUrl: 'https://token-plan-cn.xiaomimimo.com/v1',
  apiKey: process.env.MIMO_API_KEY,
  models: {
    textPro: 'mimo-v2.5-pro',
    textBase: 'mimo-v2.5',
    omni: 'mimo-v2-omni',
    tts: 'mimo-v2.5-tts',
    ttsVoiceClone: 'mimo-v2.5-tts-voiceclone',
    ttsVoiceDesign: 'mimo-v2.5-tts-voicedesign'
  }
};

// 使用mimo-v2.5-pro生成视频脚本
async function generateScript(prompt: string, style: string): Promise<VideoScript> {
  const response = await fetch(`${MIMO_CONFIG.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${MIMO_CONFIG.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: MIMO_CONFIG.models.textPro,
      messages: [
        {
          role: 'system',
          content: `你是一个专业的视频脚本创作者。请根据用户的需求生成结构化的视频脚本，包含以下字段：
          - title: 视频标题
          - scenes: 场景数组，每个场景包含：
            - text: 场景文字内容
            - duration: 预计时长(秒)
            - visual: 视觉效果描述
            - voiceover: 旁白文字
          - totalDuration: 总时长
          - mood: 视频情绪基调
          - style: 视频风格`
        },
        {
          role: 'user',
          content: `请为以下主题生成${style}风格的视频脚本：${prompt}`
        }
      ],
      temperature: 0.7,
      max_tokens: 4096
    })
  });
  
  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

// 使用mimo-v2.5-tts生成语音
async function generateVoice(text: string, voiceStyle: string): Promise<AudioBuffer> {
  const response = await fetch(`${MIMO_CONFIG.baseUrl}/audio/speech`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${MIMO_CONFIG.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: MIMO_CONFIG.models.tts,
      input: text,
      voice: voiceStyle,
      response_format: 'mp3'
    })
  });
  
  return response.arrayBuffer();
}

// 使用mimo-v2.5-pro生成FFmpeg合成命令
async function generateFFmpegCommand(script: VideoScript, audioFiles: string[]): Promise<string> {
  const response = await fetch(`${MIMO_CONFIG.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${MIMO_CONFIG.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: MIMO_CONFIG.models.textPro,
      messages: [
        {
          role: 'system',
          content: '你是一个FFmpeg专家。请根据视频脚本和音频文件生成FFmpeg命令来合成最终视频。'
        },
        {
          role: 'user',
          content: JSON.stringify({ script, audioFiles })
        }
      ],
      temperature: 0.3
    })
  });
  
  const data = await response.json();
  return data.choices[0].message.content;
}
```

## 6. 数据库设计

### 6.1 核心表结构

#### 用户表 (users)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  name VARCHAR(100),
  avatar_url TEXT,
  mimo_api_key TEXT, -- 加密存储
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 视频项目表 (video_projects)
```sql
CREATE TABLE video_projects (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title VARCHAR(255),
  description TEXT,
  status VARCHAR(50), -- draft, processing, completed, failed
  config JSONB, -- 视频配置参数
  result_url TEXT,
  thumbnail_url TEXT,
  duration INTEGER, -- 秒
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 任务表 (tasks)
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES video_projects(id),
  type VARCHAR(50), -- script, video, subtitle, music, effect
  status VARCHAR(50),
  progress INTEGER DEFAULT 0,
  input_data JSONB,
  output_data JSONB,
  error_message TEXT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 7. 安全与隐私

### 7.1 API密钥安全
- 所有API密钥使用AES-256加密存储
- 环境变量管理敏感配置
- 定期轮换API密钥

### 7.2 用户数据保护
- 符合GDPR和中国个人信息保护法
- 用户可随时删除个人数据
- 数据传输使用HTTPS加密

### 7.3 内容安全
- 内容审核过滤违规内容
- 版权检测避免侵权
- 水印保护原创内容

## 8. 性能要求

### 8.1 响应时间
- 页面加载: < 2秒
- API响应: < 500ms
- 视频生成: 根据时长，通常1-5分钟

### 8.2 并发支持
- 支持1000+同时在线用户
- 支持100+同时视频生成任务

### 8.3 可用性
- 系统可用性: 99.9%
- 数据备份: 每日自动备份

## 9. 开发阶段

### 9.1 第一阶段 (MVP)
- 基础视频生成功能
- MiMo API集成
- 简单的字幕生成
- 基础下载功能

### 9.2 第二阶段
- 智能剪辑功能
- 背景音乐推荐
- 更多特效支持
- 用户系统完善

### 9.3 第三阶段
- 高级编辑功能
- 协作功能
- 数据分析
- 商业化功能

## 10. 部署方案

### 10.1 开发环境
- 本地开发: Docker Compose
- 代码管理: Git + GitHub

### 10.2 生产环境
- 前端: Vercel
- 后端: 阿里云ECS / AWS EC2
- 数据库: 阿里云RDS / AWS RDS
- 存储: 阿里云OSS / AWS S3
- CDN: 阿里云CDN / CloudFront

## 11. 成本估算

### 11.1 AI服务成本 (纯小米MiMo方案)
| 模型 | 单价 | 预估月用量 | 月成本 |
|------|------|------------|--------|
| mimo-v2.5-pro | $0.4/1M输入, $2/1M输出 | 10M tokens | ¥150 |
| mimo-v2.5-tts | 按字符计费 | 100万字符 | ¥100 |
| mimo-v2-omni | $0.4/1M输入, $2/1M输出 | 5M tokens | ¥75 |
| **AI服务总计** | | | **¥325** |

### 11.2 基础设施成本
| 资源 | 规格 | 月成本 |
|------|------|--------|
| ECS | 4C8G | ¥300 |
| RDS | 2C4G | ¥200 |
| OSS | 100GB | ¥10 |
| CDN | 1TB流量 | ¥100 |
| **基础设施总计** | | **¥610** |

### 11.3 总成本
- **月度总成本**: ¥935
- **年度总成本**: ¥11,220

### 11.4 成本优化策略
- 缓存常用脚本模板，减少API调用
- 使用mimo-v2.5替代mimo-v2.5-pro处理简单任务
- 批量处理视频生成任务
- 优化FFmpeg命令，减少处理时间

## 12. 风险与挑战

### 12.1 技术风险
- 视频生成质量不稳定
- API调用延迟和限流
- 大文件处理性能

### 12.2 业务风险
- AI服务成本控制
- 版权和合规问题
- 市场竞争激烈

### 12.3 应对策略
- 多模型备选方案
- 成本优化和缓存策略
- 差异化功能定位