import type { VideoScene, SubtitleItem } from "@/lib/types";

export interface SceneRenderData {
  scene: VideoScene;
  index: number;
  width: number;
  height: number;
  subtitles: SubtitleItem[];
}

export function generateSceneHTML(data: SceneRenderData): string {
  const { scene, width, height } = data;

  const bgColors = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
    "linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)",
    "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
  ];

  const bg = bgColors[scene.id.charCodeAt(scene.id.length - 1) % bgColors.length];

  return `
    <div style="
      width: ${width}px;
      height: ${height}px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: ${bg};
      padding: 60px;
      font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
      position: relative;
      overflow: hidden;
    ">
      <div style="
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.2);
      "></div>
      <div style="
        position: relative;
        z-index: 1;
        text-align: center;
        max-width: 80%;
      ">
        <h1 style="
          color: white;
          font-size: ${Math.floor(width / 15)}px;
          font-weight: bold;
          text-shadow: 2px 2px 8px rgba(0,0,0,0.5);
          line-height: 1.4;
          margin-bottom: 30px;
          animation: fadeInUp 0.8s ease-out;
        ">
          ${escapeHtml(scene.text)}
        </h1>
        <p style="
          color: rgba(255,255,255,0.9);
          font-size: ${Math.floor(width / 25)}px;
          text-shadow: 1px 1px 4px rgba(0,0,0,0.3);
          line-height: 1.6;
        ">
          ${escapeHtml(scene.visual)}
        </p>
      </div>
      <div style="
        position: absolute;
        bottom: 40px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(255,255,255,0.2);
        backdrop-filter: blur(10px);
        padding: 8px 24px;
        border-radius: 20px;
        color: white;
        font-size: ${Math.floor(width / 35)}px;
      ">
        场景 ${scene.id.split("_")[1] || "1"}
      </div>
    </div>
  `;
}

export function generateTitleHTML(
  title: string,
  width: number,
  height: number
): string {
  return `
    <div style="
      width: ${width}px;
      height: ${height}px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
      position: relative;
      overflow: hidden;
    ">
      <div style="
        position: absolute;
        width: 300px;
        height: 300px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%);
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      "></div>
      <h1 style="
        position: relative;
        z-index: 1;
        color: white;
        font-size: ${Math.floor(width / 12)}px;
        font-weight: bold;
        text-align: center;
        text-shadow: 0 0 30px rgba(99,102,241,0.5);
        padding: 0 40px;
        line-height: 1.3;
      ">
        ${escapeHtml(title)}
      </h1>
      <div style="
        position: relative;
        z-index: 1;
        margin-top: 30px;
        color: rgba(255,255,255,0.6);
        font-size: ${Math.floor(width / 30)}px;
      ">
        OneGoVideo · AI生成
      </div>
    </div>
  `;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
