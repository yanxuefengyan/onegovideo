import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <header className="border-b border-white/10 bg-black/30 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">🎬</span>
            </div>
            <span className="font-bold text-2xl text-white">OneGoVideo</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            AI 创意工坊
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            用 AI 创造精彩视频和图像，从文本变创作无限可能
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Link href="/text-to-image">
            <div className="group relative overflow-hidden rounded-3xl bg-white/5 border border-white/10 p-8 hover:bg-white/10 transition-all cursor-pointer hover:scale-105 hover:border-cyan-400/50">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="text-6xl mb-4">🎨</div>
                <h2 className="text-2xl font-bold text-white mb-3">文生图</h2>
                <p className="text-white/60">
                  输入文字描述，AI 帮你生成精美图像。支持多种艺术风格和定制选项。
                </p>
              </div>
            </div>
          </Link>

          <Link href="/create">
            <div className="group relative overflow-hidden rounded-3xl bg-white/5 border border-white/10 p-8 hover:bg-white/10 transition-all cursor-pointer hover:scale-105 hover:border-cyan-400/50">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="text-6xl mb-4">🎬</div>
                <h2 className="text-2xl font-bold text-white mb-3">视频生成</h2>
                <p className="text-white/60">
                  自动生成视频脚本，文生图场景，合成完整视频，一键完成。
                </p>
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-white mb-8">核心功能</h3>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="text-3xl mb-3">🚀</div>
              <h4 className="text-lg font-semibold text-white mb-2">一键生成</h4>
              <p className="text-white/50 text-sm">简单易用，无需专业技能</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="text-3xl mb-3">🎨</div>
              <h4 className="text-lg font-semibold text-white mb-2">多种风格</h4>
              <p className="text-white/50 text-sm">艺术风格任你选择</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="text-3xl mb-3">💾</div>
              <h4 className="text-lg font-semibold text-white mb-2">即时下载</h4>
              <p className="text-white/50 text-sm">生成后立即下载保存</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
