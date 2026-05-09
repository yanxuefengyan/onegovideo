"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { VideoScript, VideoScene } from "@/lib/types";
import { generateDancerImage, getTimeBasedImageGenerator } from "@/lib/dancerGenerator";

const styleOptions = [
  { value: "knowledge", label: "科技街舞", icon: "🎵" },
  { value: "story", label: "现代舞", icon: "💃" },
  { value: "product", label: "活力舞蹈", icon: "✨" },
  { value: "tutorial", label: "教学舞蹈", icon: "👯" },
  { value: "vlog", label: "潮流舞", icon: "🎤" },
  { value: "news", label: "现代街舞", icon: "🎸" }
];

const durationOptions = [
  { value: 15, label: "15秒" },
  { value: 30, label: "30秒" },
  { value: 60, label: "60秒" },
  { value: 120, label: "2分钟" }
];

const resolutionOptions = [
  { value: "720p", label: "720p 高清" },
  { value: "1080p", label: "1080p 超清" }
];

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export default function CreatePage() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("vlog");
  const [duration, setDuration] = useState(30);
  const [resolution, setResolution] = useState("1080p");

  const [status, setStatus] = useState<"idle" | "generating_script" | "generating_images" | "generating_visuals" | "compositing" | "completed" | "failed">("idle");
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [script, setScript] = useState<VideoScript | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateVideo = useCallback(async () => {
    if (!prompt.trim()) return;

    setVideoUrl(null);
    setScript(null);
    setGeneratedImages([]);
    setErrorMessage(null);
    setStatus("generating_script");
    setProgress(10);
    setCurrentStep("🎬 准备舞台...");

    try {
      const mockScript: VideoScript = {
        title: prompt.slice(0, 30) + (prompt.length > 30 ? "..." : ""),
        description: prompt,
        scenes: [],
        totalDuration: duration,
        mood: "热情活力",
        style: style,
        backgroundMusic: "动感舞曲"
      };

      const sceneCount = Math.max(3, Math.floor(duration / 6));
      const sceneDuration = Math.floor(duration / sceneCount);
      
      for (let i = 0; i < sceneCount; i++) {
        mockScript.scenes.push({
          id: `scene_${i + 1}`,
          text: `${i === 0 ? '🎵 ' : i === sceneCount - 1 ? '💃 ' : '✨ '}${prompt.slice(0, 20)}${prompt.length > 20 ? '...' : ''}`,
          voiceover: prompt,
          duration: sceneDuration,
          visual: "炫酷舞台",
          imagePrompt: "舞者在舞台上跳舞",
          effects: ["dance", "lights", "party"]
        });
      }

      setScript(mockScript);
      setStatus("generating_images");
      setProgress(25);
      setCurrentStep("🎨 创建舞者...");

      const width = resolution === "1080p" ? 1920 : 1280;
      const height = resolution === "1080p" ? 1080 : 720;
      
      const previewImages: string[] = [];
      
      for (let i = 0; i < mockScript.scenes.length; i++) {
        setCurrentStep(`🎭 准备第 ${i + 1} / ${mockScript.scenes.length} 位舞者...");
        const img = await generateDancerImage({
          prompt: mockScript.scenes[i].imagePrompt || "",
          style: style,
          width,
          height,
          seed: Date.now() + i * 1000,
          time: i * 0.5
        });
        previewImages.push(img);
        setGeneratedImages([...previewImages]);
        setProgress(25 + Math.floor(((i + 1) / mockScript.scenes.length) * 25));
      }

      setStatus("generating_visuals");
      setProgress(50);
      setCurrentStep("💃 开始跳舞...");

      const canvas = canvasRef.current;
      if (!canvas) return;
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const fps = 30;
      const totalFrames = fps * duration;
      const stream = canvas.captureStream(fps);
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        setStatus("completed");
        setProgress(100);
        setCurrentStep("🎉 视频完成！");
      };

      mediaRecorder.start();

      const imageGenerator = getTimeBasedImageGenerator(
        prompt, style, width, height, Date.now()
      );

      let frame = 0;
      const renderLoop = () => {
        const time = frame / fps;
        const sceneDuration = duration / mockScript.scenes.length;
        const sceneIndex = Math.min(Math.floor(time / sceneDuration), mockScript.scenes.length - 1);
        const sceneProgress = (time % sceneDuration) / sceneDuration;

        renderDancerFrame(
          ctx, width, height,
          mockScript.scenes[sceneIndex],
          time,
          sceneProgress,
          sceneIndex,
          mockScript.scenes.length,
          style
        );

        const progressVal = Math.min(95, 50 + Math.floor((frame / totalFrames) * 45));
        setProgress(progressVal);
        
        if (progressVal < 70) {
          setCurrentStep("🎬 录制舞蹈中...");
        } else if (progressVal < 90) {
          setCurrentStep("✨ 添加特效...");
        } else {
          setCurrentStep("🎵 最后润色...");
        }

        frame++;

        if (frame < totalFrames) {
          requestAnimationFrame(renderLoop);
        } else {
          mediaRecorder.stop();
        }
      };

      renderLoop();
    } catch (error) {
      console.error("Video generation error:", error);
      setStatus("failed");
      setErrorMessage(error instanceof Error ? error.message : "未知错误");
      setCurrentStep(`❌ 出错了：${error instanceof Error ? error.message : "未知错误"}`);
    }
  }, [prompt, style, duration, resolution]);

  function renderDancerFrame(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    scene: VideoScene,
    time: number,
    sceneProgress: number,
    sceneIndex: number,
    totalScenes: number
  ) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');
    
    if (tempCtx) {
      const dancerImage = getTimeBasedImageGenerator(
        scene.text, style, width, height, Date.now()
      );
      
      const imageDataURL = dancerImage(time);
      const img = new Image();
      img.src = imageDataURL;
      
      if (img.complete) {
        tempCtx.drawImage(img, 0, 0);
      } else {
        img.onload = () => {
          tempCtx.drawImage(img, 0, 0);
        };
      }
      
      ctx.drawImage(tempCanvas, 0, 0);
    }

    const textY = height * 0.15;
    const textWidth = width * 0.85;
    const fontSize = Math.max(36, Math.min(56, width / 30));
    
    ctx.font = `bold ${fontSize}px "PingFang SC", "Microsoft YaHei", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 25;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;

    const textAlpha = Math.min(1, sceneProgress * 3);
    ctx.globalAlpha = textAlpha;

    const textGrad = ctx.createLinearGradient(width * 0.3, textY, width * 0.7, textY);
    textGrad.addColorStop(0, '#fff');
    textGrad.addColorStop(0.5, '#00f5ff');
    textGrad.addColorStop(1, '#fff');
    ctx.fillStyle = textGrad;

    const chars = Array.from(scene.text);
    let line = '';
    const lines: string[] = [];
    for (let i = 0; i < chars.length; i++) {
      const testLine = line + chars[i];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > textWidth && line) {
        lines.push(line);
        line = chars[i];
      } else {
        line = testLine;
      }
    }
    if (line) lines.push(line);

    const lineHeight = fontSize * 1.4;
    const startY = textY - ((lines.length - 1) * lineHeight) / 2;

    lines.forEach((textLine, i) => {
      ctx.fillText(textLine, width / 2, startY + i * lineHeight);
    });

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    const progressBarY = height * 0.95;
    const progressBarWidth = width * 0.25;
    const progressBarX = (width - progressBarWidth) / 2;
    const progressBarHeight = 8;

    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    drawRoundedRect(ctx, progressBarX, progressBarY, progressBarWidth, progressBarHeight, 4);
    ctx.fill();

    const progressGrad = ctx.createLinearGradient(progressBarX, 0, progressBarX + progressBarWidth, 0);
    progressGrad.addColorStop(0, '#00f5ff');
    progressGrad.addColorStop(0.5, '#bf00ff');
    progressGrad.addColorStop(1, '#00f5ff');
    ctx.fillStyle = progressGrad;
    drawRoundedRect(ctx, progressBarX, progressBarY, progressBarWidth * sceneProgress, progressBarHeight, 4);
    ctx.fill();

    const dotsY = height * 0.91;
    const dotSize = 12;
    const dotSpacing = 24;
    const dotsWidth = totalScenes * dotSize + (totalScenes - 1) * dotSpacing;
    const dotsX = (width - dotsWidth) / 2;

    for (let i = 0; i < totalScenes; i++) {
      ctx.beginPath();
      const dotX = dotsX + i * (dotSize + dotSpacing);
      
      if (i < sceneIndex) {
        ctx.fillStyle = '#00ff88';
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 15;
      } else if (i === sceneIndex) {
        const pulse = Math.sin(time * 6) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(0, 245, 255, ${pulse})`;
        ctx.shadowColor = '#00f5ff';
        ctx.shadowBlur = 20;
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.shadowBlur = 0;
      }
      
      ctx.arc(dotX, dotsY, dotSize / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  const handleReset = () => {
    setStatus("idle");
    setVideoUrl(null);
    setScript(null);
    setGeneratedImages([]);
    setErrorMessage(null);
    setPrompt("");
    setProgress(0);
  };

  const handleDownload = () => {
    if (!videoUrl) return;
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = `onegovideo_dance_${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const isProcessing = status !== "idle" && status !== "completed" && status !== "failed";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <header className="border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">🎬</span>
            </div>
            <span className="font-bold text-2xl text-white">OneGoVideo</span>
          </Link>
          <Badge className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-none px-4 py-1.5 text-sm">
            💃 AI 舞者
          </Badge>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-2xl bg-white/5 backdrop-blur-md border-white/10 border-0">
              <CardHeader className="bg-gradient-to-r from-cyan-600/80 to-purple-600/80 text-white rounded-t-lg">
                <CardTitle className="text-2xl flex items-center gap-2">
                  💃 AI 舞蹈视频生成器
                </CardTitle>
                <CardDescription className="text-cyan-100 text-base">
                  输入你的内容描述 → AI 生成舞者在炫酷舞台上跳舞的视频！
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/90">视频主题</label>
                  <Textarea
                    id="prompt"
                    placeholder="例如：一首欢快的夏日舞曲，活力四射！"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                    disabled={isProcessing}
                    className="resize-none bg-white/5 border-white/10 text-white placeholder-white/40 focus:border-cyan-400 focus:ring-cyan-400"
                  />
                </div>

                {!isProcessing && !videoUrl && (
                  <div className="pt-2">
                    <Button
                      onClick={generateVideo}
                      disabled={!prompt.trim()}
                      className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-lg py-6 shadow-lg shadow-cyan-500/30"
                    >
                      💃 开始跳舞！
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {status === "failed" && errorMessage && (
              <Card className="border-red-500/50 bg-red-500/10">
                <CardContent className="pt-6">
                  <p className="text-red-300">{errorMessage}</p>
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="mt-4 border-red-500/50 text-red-300 hover:bg-red-500/20"
                  >
                    再试一次
                  </Button>
                </CardContent>
              </Card>
            )}

            {isProcessing && (
              <Card className="bg-white/5 backdrop-blur-md border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-cyan-400 animate-pulse"></div>
                    {currentStep}
                  </CardTitle>
                  <CardDescription className="text-white/60">准备好舞会现场...</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Progress value={progress} className="w-full h-3 bg-white/10" />
                  <div className="flex justify-between text-sm text-white/50">
                    <span>{status}</span>
                    <span>{progress}%</span>
                  </div>
                  
                  <div className="mt-4 aspect-video rounded-xl overflow-hidden bg-black border-2 border-cyan-500/30">
                    <canvas ref={canvasRef} className="w-full h-full" />
                  </div>

                  {generatedImages.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-white/60 mb-2">舞台预览:</p>
                      <div className="grid grid-cols-4 gap-2">
                        {generatedImages.map((img, i) => (
                          <div key={i} className="aspect-video rounded-lg overflow-hidden border border-white/10">
                            <img src={img} alt={`Dancer ${i + 1}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {videoUrl && (
              <Card className="border-green-500/50 shadow-2xl bg-white/5 backdrop-blur-md">
                <CardHeader className="bg-green-500/20">
                  <CardTitle className="text-green-300 flex items-center gap-2 text-xl">
                    <span className="text-3xl">🎉</span>
                    舞蹈视频完成！
                  </CardTitle>
                  <CardDescription className="text-green-200">
                    你的专属舞蹈视频准备好了！
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="aspect-video rounded-xl overflow-hidden bg-black border-4 border-green-500/30 shadow-xl">
                    <video src={videoUrl} controls autoPlay loop className="w-full h-full" />
                  </div>
                  
                  {script && (
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <h4 className="text-white/80 font-medium mb-2">🎵 视频信息:</h4>
                      <p className="text-white/60 text-sm"><strong>标题:</strong> {script.title}</p>
                      <p className="text-white/60 text-sm"><strong>场景:</strong> {script.scenes.length} 个舞蹈场景</p>
                      <p className="text-white/60 text-sm"><strong>风格:</strong> {styleOptions.find(s => s.value === script.style)?.label || script.style}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-4">
                    <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-lg" onClick={handleDownload}>
                      💾 下载视频
                    </Button>
                    <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={handleReset}>
                      再来一支舞
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardHeader>
                <CardTitle className="text-white">🎵 舞蹈风格</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2">
                  {styleOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => !isProcessing && setStyle(opt.value)}
                      disabled={isProcessing}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        style === opt.value
                          ? "border-cyan-400 bg-cyan-400/20 text-white font-medium"
                          : "border-white/10 hover:border-cyan-400/30 text-white/70 hover:bg-white/5"
                      } disabled:opacity-50`}
                    >
                      <span className="text-lg">{opt.icon}</span>
                      <span className="ml-2 text-sm">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardHeader>
                <CardTitle className="text-white">⏱️ 舞蹈时长</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {durationOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => !isProcessing && setDuration(opt.value)}
                      disabled={isProcessing}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        duration === opt.value
                          ? "border-cyan-400 bg-cyan-400/20 text-white font-medium"
                          : "border-white/10 hover:border-cyan-400/30 text-white/70 hover:bg-white/5"
                      } disabled:opacity-50`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardHeader>
                <CardTitle className="text-white">🖼️ 画质</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {resolutionOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => !isProcessing && setResolution(opt.value)}
                      disabled={isProcessing}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        resolution === opt.value
                          ? "border-cyan-400 bg-cyan-400/20 text-white font-medium"
                          : "border-white/10 hover:border-cyan-400/30 text-white/70 hover:bg-white/5"
                      } disabled:opacity-50`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardHeader>
                <CardTitle className="text-white">🎭 特色功能</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                    <span className="text-cyan-400">💃</span>
                    <span className="text-white/80 text-sm">AI 舞者动画</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                    <span className="text-purple-400">🎵</span>
                    <span className="text-white/80 text-sm">炫酷灯光效果</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                    <span className="text-green-400">✨</span>
                    <span className="text-white/80 text-sm">粒子特效</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                    <span className="text-yellow-400">🎪</span>
                    <span className="text-white/80 text-sm">专业舞台</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
