import type { VideoScript } from "@/lib/types";

const MIMO_CONFIG = {
  baseUrl: process.env.MIMO_BASE_URL || "https://token-plan-cn.xiaomimimo.com/v1",
  apiKey: process.env.MIMO_API_KEY || "",
  models: {
    textPro: "mimo-v2.5-pro",
    textBase: "mimo-v2.5",
    omni: "mimo-v2-omni",
    tts: "mimo-v2.5-tts",
    ttsVoiceClone: "mimo-v2.5-tts-voiceclone",
    ttsVoiceDesign: "mimo-v2.5-tts-voicedesign",
  },
};

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatCompletionChoice {
  message: {
    content: string;
    role: string;
  };
  finish_reason: string;
}

interface ChatCompletionResponse {
  id: string;
  choices: ChatCompletionChoice[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

async function callMimoChat(
  messages: ChatMessage[],
  model: string = MIMO_CONFIG.models.textPro,
  temperature: number = 0.7,
  maxTokens: number = 4096
): Promise<ChatCompletionResponse> {
  const response = await fetch(`${MIMO_CONFIG.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${MIMO_CONFIG.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`MiMo API error: ${response.status} - ${error}`);
  }

  return response.json();
}

export async function generateVideoScript(
  prompt: string,
  style: string,
  duration: number
): Promise<VideoScript> {
  const systemPrompt = `你是一个专业的视频脚本创作者。请根据用户的需求生成结构化的视频脚本。

要求：
1. 视频风格: ${style}
2. 视频时长: 约${duration}秒
3. 每个场景时长建议3-8秒
4. 旁白文字要简洁有力，适合配音
5. 视觉描述要具体，方便后续生成动画和图片
6. 为每个场景生成详细的画面描述，用于文生图

请严格按以下JSON格式输出，不要输出其他内容：
{
  "title": "视频标题",
  "description": "视频描述",
  "scenes": [
    {
      "id": "scene_1",
      "text": "场景显示的文字",
      "voiceover": "旁白文字",
      "duration": 5,
      "visual": "视觉效果描述",
      "imagePrompt": "用于文生图的详细提示词，包含风格、色彩、构图等",
      "effects": ["fadeIn", "zoom"]
    }
  ],
  "totalDuration": 30,
  "mood": "积极向上",
  "style": "知识科普",
  "backgroundMusic": "轻快科技感"
}`;

  const result = await callMimoChat(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
    MIMO_CONFIG.models.textPro,
    0.7,
    4096
  );

  const content = result.choices[0].message.content;
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse script JSON from MiMo response");
  }

  return JSON.parse(jsonMatch[0]) as VideoScript;
}

export async function generateImagePrompt(
  sceneDescription: string,
  style: string
): Promise<string> {
  const systemPrompt = `你是一个专业的AI绘画提示词工程师。根据场景描述，生成高质量的文生图提示词。

要求：
1. 提示词要详细，包含主体、背景、风格、色彩、构图、光影等
2. 风格要符合: ${style}
3. 适合用于短视频画面，16:9比例
4. 用英文输出提示词（大多数文生图模型对英文支持更好）
5. 只输出提示词，不要其他内容`;

  const result = await callMimoChat(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: sceneDescription },
    ],
    MIMO_CONFIG.models.textPro,
    0.8,
    512
  );

  return result.choices[0].message.content.trim();
}

export async function generateSubtitleText(
  voiceoverText: string
): Promise<string[]> {
  const result = await callMimoChat(
    [
      {
        role: "system",
        content:
          "你是一个字幕编辑专家。请将输入的旁白文字智能断句，每句话不超过15个字，适合视频字幕显示。每行一句，不要编号，不要其他内容。",
      },
      { role: "user", content: voiceoverText },
    ],
    MIMO_CONFIG.models.textPro,
    0.3,
    1024
  );

  const content = result.choices[0].message.content;
  return content
    .split("\n")
    .map((line: string) => line.trim())
    .filter((line: string) => line.length > 0);
}

export async function recommendMusic(
  scriptContent: string,
  mood: string
): Promise<string> {
  const result = await callMimoChat(
    [
      {
        role: "system",
        content:
          '你是一个音乐推荐专家。根据视频内容和情绪，推荐合适的背景音乐类型。只输出音乐类型关键词，如：轻快科技、温暖治愈、激昂奋进、悬疑紧张、浪漫抒情、古风中国、电子动感。只输出一个类型，不要其他内容。',
      },
      {
        role: "user",
        content: `视频内容: ${scriptContent}\n情绪基调: ${mood}`,
      },
    ],
    MIMO_CONFIG.models.textBase,
    0.5,
    100
  );

  return result.choices[0].message.content.trim();
}

export async function generateFFmpegScript(
  scenes: Array<{ text: string; duration: number; visual: string }>,
  resolution: string
): Promise<string> {
  const result = await callMimoChat(
    [
      {
        role: "system",
        content:
          "你是一个FFmpeg专家。根据视频场景信息，生成FFmpeg合成命令的参数配置。输出JSON格式：{\"filters\": [...], \"inputs\": [...], \"outputSettings\": {...}}",
      },
      {
        role: "user",
        content: JSON.stringify({ scenes, resolution }),
      },
    ],
    MIMO_CONFIG.models.textPro,
    0.3,
    2048
  );

  const content = result.choices[0].message.content;
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  return jsonMatch ? jsonMatch[0] : "{}";
}
