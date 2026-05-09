import { NextRequest, NextResponse } from "next/server";

const MIMO_CONFIG = {
  baseUrl: process.env.MIMO_BASE_URL || "https://token-plan-cn.xiaomimimo.com/v1",
  apiKey: process.env.MIMO_API_KEY || "",
  models: {
    textPro: "mimo-v2.5-pro",
    textBase: "mimo-v2.5",
    omni: "mimo-v2-omni",
    tts: "mimo-v2.5-tts",
  },
};

export async function POST(request: NextRequest) {
  try {
    const { prompt, style, duration } = await request.json();

    if (!prompt?.trim()) {
      return NextResponse.json(
        { error: "请提供视频描述" },
        { status: 400 }
      );
    }

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
  "totalDuration": ${duration},
  "mood": "积极向上",
  "style": "${style}",
  "backgroundMusic": "轻快科技感"
}`;

    const response = await fetch(`${MIMO_CONFIG.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MIMO_CONFIG.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MIMO_CONFIG.models.textPro,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("MiMo API Error:", response.status, errorText);
      
      // 如果API调用失败，返回一个模拟的脚本作为后备方案
      return NextResponse.json(generateFallbackScript(prompt, style, duration));
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      return NextResponse.json(generateFallbackScript(prompt, style, duration));
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(generateFallbackScript(prompt, style, duration));
    }

    const script = JSON.parse(jsonMatch[0]);
    return NextResponse.json(script);

  } catch (error) {
    console.error("Script generation error:", error);
    // 出错时返回后备脚本
    return NextResponse.json(generateFallbackScript(
      (await request.json()).prompt || "默认视频",
      (await request.json()).style || "knowledge",
      (await request.json()).duration || 30
    ));
  }
}

function generateFallbackScript(prompt: string, style: string, duration: number) {
  const sceneCount = Math.max(3, Math.floor(duration / 6));
  const sceneDuration = Math.floor(duration / sceneCount);
  
  const scenes = [];
  for (let i = 0; i < sceneCount; i++) {
    scenes.push({
      id: `scene_${i + 1}`,
      text: `${i === 0 ? '开篇：' : i === sceneCount - 1 ? '结尾：' : ''}${prompt.slice(0, 25)}${prompt.length > 25 ? '...' : ''}`,
      voiceover: prompt,
      duration: sceneDuration,
      visual: `展示${style}风格的场景${i + 1}`,
      imagePrompt: `${style} style professional video scene, cinematic lighting, 16:9`,
      effects: ["fadeIn", "zoom", "slideIn"]
    });
  }

  return {
    title: prompt.slice(0, 30) + (prompt.length > 30 ? '...' : ''),
    description: prompt,
    scenes,
    totalDuration: duration,
    mood: "积极向上",
    style,
    backgroundMusic: "轻快科技感"
  };
}
