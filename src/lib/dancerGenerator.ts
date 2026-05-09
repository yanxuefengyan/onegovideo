// 专业的人物跳舞动画生成器
// 包含完整的人物动画、灯光效果、舞台场景

interface DancerGeneratorOptions {
  prompt: string;
  style: string;
  width: number;
  height: number;
  seed?: number;
  time?: number;
}

const DANCE_STYLES = {
  knowledge: { name: "科技街舞", colors: ["#00f5ff", "#bf00ff", "#00ff88"], bgColors: ["#0a0a1a", "#1a0a2e"] },
  story: { name: "现代舞", colors: ["#ff6b9d", "#ffc3a0", "#c687ff"], bgColors: ["#1a0a14", "#0a1628"] },
  product: { name: "活力舞蹈", colors: ["#00ff88", "#ffaa00", "#ff0066"], bgColors: ["#0a1a14", "#1a140a"] },
  tutorial: { name: "教学舞蹈", colors: ["#4dabf7", "#72c3fc", "#91d3ff"], bgColors: ["#0a1420", "#0a1a20"] },
  vlog: { name: "潮流舞", colors: ["#ff006e", "#8338ec", "#3a86ff"], bgColors: ["#1a0a1a", "#0a0a2a"] },
  news: { name: "现代街舞", colors: ["#ffbe0b", "#fb5607", "#ff006e"], bgColors: ["#1a140a", "#2a140a"] }
};

export async function generateDancerImage(options: DancerGeneratorOptions): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = options.width;
    canvas.height = options.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve('');
      return;
    }

    const styleKey = (options.style as keyof typeof DANCE_STYLES) || 'vlog';
    const style = DANCE_STYLES[styleKey];
    const seed = options.seed || Date.now();
    const time = options.time || 0;

    // 设置随机种子
    const random = seededRandom(seed);

    // 1. 绘制舞台背景
    drawStageBackground(ctx, options.width, options.height, style, time, random);

    // 2. 绘制舞台灯光
    drawStageLights(ctx, options.width, options.height, style, time);

    // 3. 绘制跳舞人物
    drawDancingCharacter(ctx, options.width, options.height, style, time, random);

    // 4. 绘制前景特效
    drawForegroundEffects(ctx, options.width, options.height, style, time, random);

    // 5. 添加氛围光晕
    drawAtmosphereGlow(ctx, options.width, options.height, style, time);

    resolve(canvas.toDataURL('image/png'));
  });
}

function seededRandom(seed: number) {
  let s = seed;
  return function () {
    s = Math.sin(s) * 10000;
    return s - Math.floor(s);
  };
}

function drawStageBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  style: any,
  time: number,
  random: () => number
) {
  // 渐变背景
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, style.bgColors[0]);
  bgGrad.addColorStop(0.5, style.bgColors[1]);
  bgGrad.addColorStop(1, style.bgColors[0]);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 添加网格地板
  const gridSize = 40;
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;

  // 透视网格
  const horizon = height * 0.7;
  for (let i = 0; i < 20; i++) {
    const y = horizon + i * gridSize * 0.5;
    const scale = 1 + i * 0.1;
    const x1 = width / 2 - (width / 2) * scale;
    const x2 = width / 2 + (width / 2) * scale;
    
    ctx.beginPath();
    ctx.moveTo(x1, y);
    ctx.lineTo(x2, y);
    ctx.stroke();
  }

  // 放射线条
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2 + time * 0.2;
    ctx.strokeStyle = `${style.colors[i % style.colors.length]}20`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(width / 2, horizon);
    ctx.lineTo(
      width / 2 + Math.cos(angle) * width,
      horizon + Math.sin(angle) * height
    );
    ctx.stroke();
  }
}

function drawStageLights(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  style: any,
  time: number
) {
  // 多色聚光灯
  const lightPositions = [
    { x: width * 0.2, y: 0 },
    { x: width * 0.5, y: 0 },
    { x: width * 0.8, y: 0 }
  ];

  lightPositions.forEach((pos, i) => {
    const offset = Math.sin(time * 2 + i) * 50;
    const color = style.colors[i % style.colors.length];
    
    const lightGrad = ctx.createRadialGradient(
      pos.x + offset, pos.y, 0,
      pos.x + offset, height * 0.7, 300
    );
    lightGrad.addColorStop(0, `${color}60`);
    lightGrad.addColorStop(0.5, `${color}20`);
    lightGrad.addColorStop(1, 'transparent');
    
    ctx.fillStyle = lightGrad;
    ctx.fillRect(0, 0, width, height);
  });
}

function drawDancingCharacter(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  style: any,
  time: number,
  random: () => number
) {
  const centerX = width / 2;
  const centerY = height * 0.6;
  const scale = Math.min(width, height) / 800;

  ctx.save();
  ctx.translate(centerX, centerY);

  // 跳舞动画
  const bounce = Math.sin(time * 6) * 10 * scale;
  const sway = Math.sin(time * 4) * 0.15;
  const legMove = Math.sin(time * 8) * 20 * scale;
  const armMove = Math.cos(time * 6) * 30 * scale;

  ctx.rotate(sway);
  ctx.translate(0, bounce);

  // 绘制人物影子
  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(0, 100 * scale, 60 * scale, 15 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 1. 身体
  const bodyGrad = ctx.createLinearGradient(0, -50 * scale, 0, 80 * scale);
  bodyGrad.addColorStop(0, style.colors[0]);
  bodyGrad.addColorStop(1, style.colors[1]);
  
  ctx.fillStyle = bodyGrad;
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 3 * scale;
  
  // 躯干
  ctx.beginPath();
  ctx.moveTo(-25 * scale, -30 * scale);
  ctx.lineTo(-20 * scale, 60 * scale);
  ctx.lineTo(20 * scale, 60 * scale);
  ctx.lineTo(25 * scale, -30 * scale);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 2. 头部
  ctx.save();
  const headTilt = Math.sin(time * 3) * 0.1;
  ctx.rotate(headTilt);
  
  // 头/头盔
  const headGrad = ctx.createRadialGradient(0, -80 * scale, 0, 0, -80 * scale, 45 * scale);
  headGrad.addColorStop(0, '#fff');
  headGrad.addColorStop(0.5, style.colors[2]);
  headGrad.addColorStop(1, style.colors[0]);
  
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.arc(0, -80 * scale, 40 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.stroke();

  // 眼睛/面罩光
  ctx.fillStyle = '#00f5ff';
  ctx.shadowColor = '#00f5ff';
  ctx.shadowBlur = 20 * scale;
  ctx.fillRect(-20 * scale, -85 * scale, 15 * scale, 8 * scale);
  ctx.fillRect(5 * scale, -85 * scale, 15 * scale, 8 * scale);
  ctx.shadowBlur = 0;

  ctx.restore();

  // 3. 左手臂
  ctx.save();
  ctx.translate(-25 * scale, -10 * scale);
  ctx.rotate(-0.5 + armMove * 0.02);
  
  ctx.fillStyle = style.colors[1];
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-50 * scale, 40 * scale);
  ctx.lineTo(-40 * scale, 50 * scale);
  ctx.lineTo(10 * scale, 10 * scale);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 左手特效
  ctx.fillStyle = style.colors[0];
  ctx.shadowColor = style.colors[0];
  ctx.shadowBlur = 30 * scale;
  ctx.beginPath();
  ctx.arc(-45 * scale, 45 * scale, 15 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  // 4. 右手臂
  ctx.save();
  ctx.translate(25 * scale, -10 * scale);
  ctx.rotate(0.5 - armMove * 0.02);
  
  ctx.fillStyle = style.colors[1];
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(50 * scale, 40 * scale);
  ctx.lineTo(40 * scale, 50 * scale);
  ctx.lineTo(-10 * scale, 10 * scale);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 右手特效
  ctx.fillStyle = style.colors[2];
  ctx.shadowColor = style.colors[2];
  ctx.shadowBlur = 30 * scale;
  ctx.beginPath();
  ctx.arc(45 * scale, 45 * scale, 15 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  // 5. 左腿
  ctx.save();
  ctx.translate(-10 * scale, 60 * scale);
  ctx.rotate(legMove * 0.02);
  
  ctx.fillStyle = style.colors[0];
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-20 * scale, 80 * scale);
  ctx.lineTo(-10 * scale, 85 * scale);
  ctx.lineTo(10 * scale, 5 * scale);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // 6. 右腿
  ctx.save();
  ctx.translate(10 * scale, 60 * scale);
  ctx.rotate(-legMove * 0.02);
  
  ctx.fillStyle = style.colors[0];
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(20 * scale, 80 * scale);
  ctx.lineTo(10 * scale, 85 * scale);
  ctx.lineTo(-10 * scale, 5 * scale);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}

function drawForegroundEffects(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  style: any,
  time: number,
  random: () => number
) {
  // 上升粒子
  for (let i = 0; i < 50; i++) {
    const x = (random() * width);
    const y = ((time * 100 + i * 50) % height);
    const size = random() * 8 + 2;
    const alpha = 1 - y / height;
    const colorIndex = i % style.colors.length;
    
    ctx.globalAlpha = alpha * 0.8;
    ctx.fillStyle = style.colors[colorIndex];
    ctx.shadowColor = style.colors[colorIndex];
    ctx.shadowBlur = 15;
    
    ctx.beginPath();
    ctx.arc(x, height - y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;

  // 音乐符号
  const musicSymbols = ['♪', '♫', '♬', '♩'];
  ctx.font = 'bold 40px Arial';
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  
  for (let i = 0; i < 8; i++) {
    const x = width * 0.1 + (i / 8) * width * 0.8;
    const y = height * 0.3 + Math.sin(time + i) * 30;
    const rotation = Math.sin(time * 2 + i) * 0.3;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.fillText(musicSymbols[i % musicSymbols.length], 0, 0);
    ctx.restore();
  }
}

function drawAtmosphereGlow(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  style: any,
  time: number
) {
  // 中心光晕
  const pulse = Math.sin(time * 3) * 0.3 + 0.7;
  const centerGrad = ctx.createRadialGradient(
    width / 2, height * 0.6, 0,
    width / 2, height * 0.6, 400
  );
  centerGrad.addColorStop(0, `${style.colors[0]}${Math.floor(pulse * 40).toString(16).padStart(2, '0')}`);
  centerGrad.addColorStop(0.5, 'transparent');
  
  ctx.fillStyle = centerGrad;
  ctx.fillRect(0, 0, width, height);

  // 边缘暗化
  const vignette = ctx.createRadialGradient(
    width / 2, height / 2, Math.min(width, height) * 0.3,
    width / 2, height / 2, Math.max(width, height) * 0.7
  );
  vignette.addColorStop(0, 'transparent');
  vignette.addColorStop(1, 'rgba(0,0,0,0.6)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);
}

export function getTimeBasedImageGenerator(
  prompt: string,
  style: string,
  width: number,
  height: number,
  seed: number
) {
  return (time: number) => generateDancerImage({
    prompt,
    style,
    width,
    height,
    seed,
    time
  });
}
