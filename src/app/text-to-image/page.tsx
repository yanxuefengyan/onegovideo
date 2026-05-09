'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { generateImageWithPrompt } from '@/lib/imageGenerator';

const styleOptions = [
  { value: 'realistic', label: '写实风格', icon: '📷' },
  { value: 'anime', label: '动漫风格', icon: '🎨' },
  { value: 'cartoon', label: '卡通风格', icon: '🎭' },
  { value: 'digital-art', label: '数字艺术', icon: '💻' },
  { value: 'oil-painting', label: '油画风格', icon: '🖼️' },
  { value: 'watercolor', label: '水彩风格', icon: '🎑' },
  { value: '3d', label: '3D 渲染', icon: '🎲' },
  { value: 'pixel', label: '像素风格', icon: '👾' },
];

const aspectRatios = [
  { value: '1:1', label: '1:1 (正方形)', width: 1024, height: 1024 },
  { value: '9:16', label: '9:16 (手机竖屏)', width: 720, height: 1280 },
  { value: '16:9', label: '16:9 (手机横屏)', width: 1280, height: 720 },
  { value: '4:3', label: '4:3 (标准)', width: 1024, height: 768 },
];

const colorPalettes = [
  { value: 'vibrant', label: '活力', colors: ['#ff6b6b', '#4ecdc4', '#45b7d1'] },
  { value: 'pastel', label: '柔和', colors: ['#ff9a9e', '#fecfef', '#a18cd1'] },
  { value: 'warm', label: '温暖', colors: ['#ff758c', '#ff7eb3', '#ff8e53'] },
  { value: 'cool', label: '冷调', colors: ['#00c6ff', '#0072ff', '#00f260'] },
  { value: 'dark', label: '暗黑', colors: ['#1a1a2e', '#16213e', '#0f3460'] },
  { value: 'neon', label: '霓虹', colors: ['#00f5ff', '#bf00ff', '#ff006e'] },
];

export default function TextToImagePage() {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [style, setStyle] = useState('anime');
  const [aspectRatio, setAspectRatio] = useState('9:16');
  const [creativity, setCreativity] = useState(7);
  const [colorPalette, setColorPalette] = useState('neon');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generationTime, setGenerationTime] = useState<number | null>(null);

  const getDimensions = () => {
    const ratio = aspectRatios.find(r => r.value === aspectRatio) || aspectRatios[0];
    return { width: ratio.width, height: ratio.height };
  };

  const generateImage = useCallback(async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setSelectedImage(null);
    const startTime = Date.now();

    try {
      const { width, height } = getDimensions();
      const imageDataUrl = await generateImageWithPrompt({
        prompt,
        negativePrompt,
        style,
        width,
        height,
        creativity,
        colorPalette,
        seed: Date.now(),
      });

      setGeneratedImages(prev => [imageDataUrl, ...prev.slice(0, 7)]);
      setSelectedImage(imageDataUrl);
      setGenerationTime(Date.now() - startTime);
    } catch (error) {
      console.error('Image generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, negativePrompt, style, aspectRatio, creativity, colorPalette]);

  const downloadImage = useCallback(() => {
    if (!selectedImage) return;
    
    const link = document.createElement('a');
    link.href = selectedImage;
    link.download = `onegovideo_image_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [selectedImage]);

  const quickPrompts = [
    '一个可爱的女孩在花园里',
    '未来科技城市场景',
    '梦幻的星空下的城堡',
    '赛博朋克风格的城市夜景',
    '一只可爱的猫咪在阳光下',
    '中国风山水画',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <header className="border-b border-white/10 bg-black/30 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">🎨</span>
            </div>
            <span className="font-bold text-2xl text-white">OneGoVideo</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/create">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                🎬 视频生成
              </Button>
            </Link>
            <Badge className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-none">
              🖼️ 文生图
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-white/5 backdrop-blur-md border-white/10 border-0">
              <CardHeader className="bg-gradient-to-r from-cyan-600/80 to-purple-600/80 text-white rounded-t-lg">
                <CardTitle className="text-2xl flex items-center gap-2">
                  ✨ 图像描述
                </CardTitle>
                <CardDescription className="text-cyan-100">
                  输入你想要生成的图像描述
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/90">描述内容</label>
                  <Textarea
                    id="prompt"
                    placeholder="例如：一个可爱的女孩在花园里，阳光明媚，色彩鲜艳..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                    disabled={isGenerating}
                    className="resize-none bg-white/5 border-white/10 text-white placeholder-white/40 focus:border-cyan-400 focus:ring-cyan-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/90">快速提示</label>
                  <div className="flex flex-wrap gap-2">
                    {quickPrompts.map((qp, idx) => (
                      <button
                        key={idx}
                        onClick={() => !isGenerating && setPrompt(qp)}
                        disabled={isGenerating}
                        className="px-3 py-1.5 text-xs bg-white/10 hover:bg-white/20 text-white/80 rounded-full border border-white/10 transition-all disabled:opacity-50"
                      >
                        {qp}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-md border-white/10 border-0">
              <CardHeader>
                <CardTitle className="text-white text-lg">🎨 生成设置</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-white/90 flex items-center justify-between">
                    <span>艺术风格</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {styleOptions.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => !isGenerating && setStyle(s.value)}
                        disabled={isGenerating}
                        className={`p-2 rounded-lg border text-center transition-all ${
                          style === s.value
                            ? 'border-cyan-400 bg-cyan-400/20 text-white'
                            : 'border-white/10 hover:border-cyan-400/50 text-white/70 hover:bg-white/5'
                        } disabled:opacity-50`}
                        title={s.label}
                      >
                        <span className="text-xl">{s.icon}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-white/90 flex items-center justify-between">
                    <span>宽高比</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {aspectRatios.map((ratio) => (
                      <button
                        key={ratio.value}
                        onClick={() => !isGenerating && setAspectRatio(ratio.value)}
                        disabled={isGenerating}
                        className={`p-2 rounded-lg border text-center transition-all text-sm ${
                          aspectRatio === ratio.value
                            ? 'border-cyan-400 bg-cyan-400/20 text-white'
                            : 'border-white/10 hover:border-cyan-400/50 text-white/70 hover:bg-white/5'
                        } disabled:opacity-50`}
                      >
                        {ratio.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-white/90 flex items-center justify-between">
                    <span>创意程度</span>
                    <span className="text-cyan-400">{creativity}/10</span>
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                      <button
                        key={level}
                        onClick={() => !isGenerating && setCreativity(level)}
                        disabled={isGenerating}
                        className={`flex-1 py-2 rounded text-xs transition-all ${
                          creativity >= level
                            ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                            : 'bg-white/10 text-white/40 hover:bg-white/20'
                        } disabled:opacity-50`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-white/90">配色方案</label>
                  <div className="grid grid-cols-3 gap-2">
                    {colorPalettes.map((palette) => (
                      <button
                        key={palette.value}
                        onClick={() => !isGenerating && setColorPalette(palette.value)}
                        disabled={isGenerating}
                        className={`p-3 rounded-lg border transition-all ${
                          colorPalette === palette.value
                            ? 'border-cyan-400 bg-cyan-400/20'
                            : 'border-white/10 hover:border-cyan-400/50 hover:bg-white/5'
                        } disabled:opacity-50`}
                      >
                        <div className="flex gap-1 justify-center mb-1">
                          {palette.colors.map((color, idx) => (
                            <div
                              key={idx}
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-white/60 capitalize block">
                          {palette.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={generateImage}
                    disabled={isGenerating || !prompt.trim()}
                    className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-lg py-6 shadow-lg shadow-cyan-500/30"
                  >
                    {isGenerating ? (
                      <>
                        <Spinner className="mr-2" />
                        生成中...
                      </>
                    ) : (
                      <>
                        🎨 生成图像
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {selectedImage && (
              <Card className="border-green-500/50 bg-white/5 backdrop-blur-md border-0">
                <CardHeader className="bg-green-500/20">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-green-300 flex items-center gap-2 text-xl">
                      <span className="text-2xl">✨</span>
                      生成结果
                    </CardTitle>
                    {generationTime && (
                      <Badge className="bg-green-500/30 text-green-300 border-green-500/30">
                        {generationTime}ms
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="relative rounded-xl overflow-hidden border-2 border-green-500/30 bg-black">
                    <img
                      src={selectedImage}
                      alt="Generated"
                      className="w-full h-auto"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                      onClick={downloadImage}
                    >
                      💾 下载图片
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                      onClick={() => setGeneratedImages([])}
                    >
                      🗑️ 清空历史
                    </Button>
                  </div>

                  {prompt && (
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <h4 className="text-white/80 font-medium mb-2">📝 提示词</h4>
                      <p className="text-white/60 text-sm">{prompt}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {generatedImages.length > 0 && (
              <Card className="bg-white/5 backdrop-blur-md border-white/10 border-0">
                <CardHeader>
                  <CardTitle className="text-white">🖼️ 历史生成 ({generatedImages.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {generatedImages.map((img, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedImage(img)}
                        className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImage === img
                            ? 'border-cyan-400 shadow-lg shadow-cyan-500/30'
                            : 'border-white/10 hover:border-cyan-400/50'
                        }`}
                      >
                        <img
                          src={img}
                          alt={`Generated ${idx + 1}`}
                          className="w-full h-40 object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {!isGenerating && !selectedImage && generatedImages.length === 0 && (
              <Card className="bg-white/5 backdrop-blur-md border-white/10 border-0">
                <CardContent className="pt-12 pb-12 text-center">
                  <div className="text-6xl mb-4">🎨</div>
                  <h3 className="text-xl font-medium text-white mb-2">开始创作</h3>
                  <p className="text-white/60 max-w-md mx-auto">
                    在左侧输入图像描述，选择风格，点击生成按钮开始创作
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
