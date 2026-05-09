import { NextRequest, NextResponse } from "next/server";
import { updateTaskStatus } from "@/lib/store/fileStore";
import type { GenerateVideoRequest } from "@/lib/types";
import path from "path";
import fs from "fs/promises";

const OUTPUT_DIR = path.join(process.cwd(), "public", "output");
const TEMP_DIR = path.join(process.cwd(), "tmp");

export async function POST(request: NextRequest) {
  try {
    const body: GenerateVideoRequest = await request.json();
    const { prompt, style, duration, resolution, voiceStyle, musicCategory } =
      body;

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "请输入视频描述" },
        { status: 400 }
      );
    }

    const taskId = `task_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 8)}`;
    const taskDir = path.join(TEMP_DIR, taskId);
    await fs.mkdir(taskDir, { recursive: true });
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    await updateTaskStatus(taskId, "generating_script", 10, "正在生成视频脚本...");

    processVideoGeneration(
      taskId,
      prompt,
      style,
      duration,
      resolution,
      voiceStyle,
      musicCategory
    ).catch((err) => {
      console.error(`Video generation failed for ${taskId}:`, err);
      updateTaskStatus(
        taskId,
        "failed",
        0,
        `生成失败: ${err instanceof Error ? err.message : "未知错误"}`
      );
    });

    return NextResponse.json({
      taskId,
      status: "generating_script",
      estimatedTime: duration * 3,
    });
  } catch (error) {
    console.error("Generate video error:", error);
    return NextResponse.json(
      { error: "视频生成请求失败" },
      { status: 500 }
    );
  }
}

async function processVideoGeneration(
  taskId: string,
  prompt: string,
  style: string,
  duration: number,
  resolution: string,
  voiceStyle: string,
  musicCategory?: string
) {
  const taskDir = path.join(TEMP_DIR, taskId);

  try {
    await updateTaskStatus(taskId, "generating_script", 10, "正在生成视频脚本...");
    
    const script = {
      title: prompt.slice(0, 30) + "...",
      description: prompt,
      scenes: [
        {
          id: "scene_0",
          text: prompt.slice(0, 40) + "...",
          voiceover: prompt,
          duration: 5,
          visual: "介绍",
          effects: ["fadeIn"]
        }
      ],
      totalDuration: 10,
      mood: "积极",
      style: style,
      backgroundMusic: "默认"
    };
    
    await fs.writeFile(
      path.join(taskDir, "script.json"),
      JSON.stringify(script, null, 2)
    );

    await updateTaskStatus(taskId, "generating_voice", 25, "正在生成语音旁白...");
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await updateTaskStatus(taskId, "generating_visuals", 50, "正在生成视觉画面...");
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await updateTaskStatus(taskId, "adding_subtitles", 65, "正在生成字幕...");
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await updateTaskStatus(taskId, "adding_music", 75, "正在添加背景音乐...");
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await updateTaskStatus(taskId, "compositing", 85, "正在合成视频...");
    
    await new Promise(resolve => setTimeout(resolve, 500));

    // 创建一个简单的演示视频（实际上没有真的视频，只是演示流程）
    const demoVideoPath = path.join(OUTPUT_DIR, `${taskId}.mp4`);
    const demoThumbPath = path.join(OUTPUT_DIR, `${taskId}_thumb.jpg`);
    
    // 创建一个占位符（实际项目中这里应该是真实的视频生成）
    await fs.writeFile(demoVideoPath, Buffer.from("demo video"));
    await fs.writeFile(demoThumbPath, Buffer.from("demo thumb"));

    await updateTaskStatus(taskId, "completed", 100, "视频生成完成！", {
      videoUrl: `/output/${taskId}.mp4`,
      thumbnailUrl: `/output/${taskId}_thumb.jpg`,
      duration: script.totalDuration,
    });
  } catch (error) {
    console.error(`Processing failed for ${taskId}:`, error);
    await updateTaskStatus(
      taskId,
      "failed",
      0,
      `生成失败: ${error instanceof Error ? error.message : "未知错误"}`
    );
  }
}
