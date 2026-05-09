import { NextRequest, NextResponse } from "next/server";
import { generateVideoScript } from "@/lib/mimo/client";

export async function POST(request: NextRequest) {
  try {
    const { prompt, style, duration } = await request.json();

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "请输入视频描述" },
        { status: 400 }
      );
    }

    const script = await generateVideoScript(prompt, style || "knowledge", duration || 30);

    return NextResponse.json({ script });
  } catch (error) {
    console.error("Script generation error:", error);
    return NextResponse.json(
      { error: "脚本生成失败，请重试" },
      { status: 500 }
    );
  }
}
