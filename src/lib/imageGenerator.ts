interface GenerationOptions {
  prompt: string;
  negativePrompt?: string;
  style: string;
  width: number;
  height: number;
  creativity: number;
  colorPalette: string;
  seed: number;
}

const colorPalettes = {
  vibrant: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9'],
  pastel: ['#ff9a9e', '#fecfef', '#a18cd1', '#fbc2eb', '#a6c1ee', '#84fab0'],
  warm: ['#ff758c', '#ff7eb3', '#ff8e53', '#ffd89b', '#19547b', '#ff6b6b'],
  cool: ['#00c6ff', '#0072ff', '#00f260', '#0575e6', '#021b79', '#43cea2'],
  dark: ['#1a1a2e', '#16213e', '#0f3460', '#e94560', '#533483', '#7b2cbf'],
  neon: ['#00f5ff', '#bf00ff', '#ff006e', '#00ff88', '#ffaa00', '#ffff00'],
};

const stylePresets = {
  'realistic': {
    name: '写实风格',
    colors: ['#3d3d3d', '#5a5a5a', '#7a7a7a', '#9a9a9a', '#bababa'],
    lineWidth: 1,
    shadowOpacity: 0.3,
  },
  'anime': {
    name: '动漫风格',
    colors: ['#ff9a9e', '#fecfef', '#a18cd1', '#fbc2eb', '#a6c1ee'],
    lineWidth: 3,
    shadowOpacity: 0.2,
  },
  'cartoon': {
    name: '卡通风格',
    colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'],
    lineWidth: 4,
    shadowOpacity: 0.15,
  },
  'digital-art': {
    name: '数字艺术',
    colors: ['#00c6ff', '#0072ff', '#00f260', '#0575e6', '#021b79'],
    lineWidth: 2,
    shadowOpacity: 0.4,
  },
  'oil-painting': {
    name: '油画风格',
    colors: ['#8e0e00', '#1f1c18', '#f12711', '#f5af19', '#daa520'],
    lineWidth: 5,
    shadowOpacity: 0.25,
  },
  'watercolor': {
    name: '水彩风格',
    colors: ['#74ebd5', '#ACB6E5', '#96c93d', '#a8e063', '#56ab2f'],
    lineWidth: 1.5,
    shadowOpacity: 0.1,
  },
  '3d': {
    name: '3D渲染',
    colors: ['#2c3e50', '#3498db', '#e74c3c', '#2ecc71', '#f1c40f'],
    lineWidth: 2,
    shadowOpacity: 0.5,
  },
  'pixel': {
    name: '像素风格',
    colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'],
    lineWidth: 1,
    shadowOpacity: 0,
  },
};

function seededRandom(seed: number) {
  let value = seed;
  return function () {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

function analyzePrompt(prompt: string) {
  const lowerPrompt = prompt.toLowerCase();
  
  const keywords = {
    person: ['女孩', '女人', '男人', '男孩', '人物', '人', 'girl', 'woman', 'man', 'boy', 'person'],
    nature: ['花园', '花', '树', '山', '天空', '自然', 'garden', 'flower', 'tree', 'mountain', 'sky', 'nature'],
    city: ['城市', '建筑', '街道', '未来', '赛博', 'city', 'building', 'street', 'future', 'cyber'],
    animal: ['猫', '狗', '动物', '猫咪', 'cat', 'dog', 'animal'],
    fantasy: ['魔法', '龙', '城堡', '星空', 'magic', 'dragon', 'castle', 'star', 'fantasy'],
  };

  const analysis = {
    hasPerson: false,
    hasNature: false,
    hasCity: false,
    hasAnimal: false,
    hasFantasy: false,
  };

  for (const [category, words] of Object.entries(keywords)) {
    for (const word of words) {
      if (lowerPrompt.includes(word)) {
        (analysis as any)[`has${category.charAt(0).toUpperCase() + category.slice(1)}`] = true;
      }
    }
  }

  return analysis;
}

function drawBackground(ctx: CanvasRenderingContext2D, width: number, height: number, colors: string[], random: () => number, style: string) {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  
  for (let i = 0; i < colors.length; i++) {
    gradient.addColorStop(i / (colors.length - 1), colors[i]);
  }
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  if (style === 'pixel') {
    for (let i = 0; i < width * height / 64; i++) {
      const x = Math.floor(random() * width / 8) * 8;
      const y = Math.floor(random() * height / 8) * 8;
      ctx.fillStyle = colors[Math.floor(random() * colors.length)];
      ctx.globalAlpha = 0.3;
      ctx.fillRect(x, y, 8, 8);
    }
    ctx.globalAlpha = 1;
  } else if (style === 'watercolor') {
    for (let i = 0; i < 20; i++) {
      const x = random() * width;
      const y = random() * height;
      const radius = random() * 150 + 50;
      const color = colors[Math.floor(random() * colors.length)];
      
      const watercolor = ctx.createRadialGradient(x, y, 0, x, y, radius);
      watercolor.addColorStop(0, color + '60');
      watercolor.addColorStop(1, 'transparent');
      
      ctx.fillStyle = watercolor;
      ctx.fillRect(0, 0, width, height);
    }
  } else {
    for (let i = 0; i < 50; i++) {
      const x = random() * width;
      const y = random() * height;
      const radius = random() * 100 + 20;
      const color = colors[Math.floor(random() * colors.length)];
      
      const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
      glow.addColorStop(0, color + '30');
      glow.addColorStop(1, 'transparent');
      
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);
    }
  }
}

function drawCharacter(ctx: CanvasRenderingContext2D, width: number, height: number, colors: string[], random: () => number, style: string) {
  const centerX = width / 2;
  const centerY = height / 2;
  
  const scale = Math.min(width, height) / 500;
  
  ctx.save();
  ctx.translate(centerX, centerY);
  
  ctx.fillStyle = colors[1];
  ctx.strokeStyle = style === 'cartoon' || style === 'anime' ? '#000' : colors[2];
  ctx.lineWidth = stylePresets[style as keyof typeof stylePresets]?.lineWidth || 2;

  const headRadius = 60 * scale;
  
  const headGradient = ctx.createRadialGradient(-10 * scale, -10 * scale, 0, 0, 0, headRadius);
  headGradient.addColorStop(0, '#ffd5c8');
  headGradient.addColorStop(0.7, '#f5c6b9');
  headGradient.addColorStop(1, '#e8b5a8');
  
  ctx.fillStyle = headGradient;
  ctx.beginPath();
  ctx.arc(0, -80 * scale, headRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = colors[3];
  ctx.beginPath();
  ctx.arc(0, -100 * scale, headRadius * 0.85, Math.PI, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = colors[2];
  ctx.beginPath();
  ctx.ellipse(-40 * scale, -70 * scale, 20 * scale, 35 * scale, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(40 * scale, -70 * scale, 20 * scale, 35 * scale, 0.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.ellipse(-20 * scale, -80 * scale, 15 * scale, 18 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(20 * scale, -80 * scale, 15 * scale, 18 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = style === 'anime' ? colors[0] : '#333';
  ctx.beginPath();
  ctx.arc(-18 * scale, -78 * scale, 8 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(22 * scale, -78 * scale, 8 * scale, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-22 * scale, -82 * scale, 3 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(18 * scale, -82 * scale, 3 * scale, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffb6c1';
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.ellipse(-40 * scale, -65 * scale, 12 * scale, 8 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(40 * scale, -65 * scale, 12 * scale, 8 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.strokeStyle = '#e57373';
  ctx.lineWidth = 2 * scale;
  ctx.beginPath();
  ctx.arc(0, -60 * scale, 12 * scale, 0.2, Math.PI - 0.2);
  ctx.stroke();

  const bodyGradient = ctx.createLinearGradient(-40 * scale, 0, 40 * scale, 100 * scale);
  bodyGradient.addColorStop(0, colors[1]);
  bodyGradient.addColorStop(1, colors[2]);
  
  ctx.fillStyle = bodyGradient;
  ctx.beginPath();
  ctx.moveTo(-40 * scale, -20 * scale);
  ctx.lineTo(-50 * scale, 100 * scale);
  ctx.lineTo(50 * scale, 100 * scale);
  ctx.lineTo(40 * scale, -20 * scale);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#ffd5c8';
  ctx.beginPath();
  ctx.ellipse(-60 * scale, 30 * scale, 15 * scale, 12 * scale, 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  
  ctx.beginPath();
  ctx.ellipse(60 * scale, 30 * scale, 15 * scale, 12 * scale, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-20 * scale, 100 * scale);
  ctx.lineTo(-25 * scale, 180 * scale);
  ctx.lineTo(-5 * scale, 180 * scale);
  ctx.lineTo(-10 * scale, 100 * scale);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(20 * scale, 100 * scale);
  ctx.lineTo(25 * scale, 180 * scale);
  ctx.lineTo(5 * scale, 180 * scale);
  ctx.lineTo(10 * scale, 100 * scale);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = colors[0];
  ctx.beginPath();
  ctx.ellipse(-15 * scale, 185 * scale, 20 * scale, 10 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(15 * scale, 185 * scale, 20 * scale, 10 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

function drawNatureScene(ctx: CanvasRenderingContext2D, width: number, height: number, colors: string[], random: () => number) {
  const skyGradient = ctx.createLinearGradient(0, 0, 0, height * 0.6);
  skyGradient.addColorStop(0, '#87CEEB');
  skyGradient.addColorStop(1, '#E0F6FF');
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, width, height * 0.6);

  const grassGradient = ctx.createLinearGradient(0, height * 0.5, 0, height);
  grassGradient.addColorStop(0, '#90EE90');
  grassGradient.addColorStop(1, colors[0]);
  ctx.fillStyle = grassGradient;
  ctx.fillRect(0, height * 0.5, width, height * 0.5);

  for (let i = 0; i < 8; i++) {
    const x = width * 0.1 + (i / 7) * width * 0.8;
    const y = height * 0.5;
    const size = 60 + random() * 40;
    
    ctx.fillStyle = colors[2];
    ctx.fillRect(x - size * 0.1, y - size * 0.5, size * 0.2, size * 0.5);
    
    ctx.fillStyle = colors[1];
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x - size * 0.4, y - size * 0.3);
    ctx.lineTo(x + size * 0.4, y - size * 0.3);
    ctx.closePath();
    ctx.fill();
  }

  for (let i = 0; i < 15; i++) {
    const x = random() * width;
    const y = height * 0.55 + random() * height * 0.35;
    const size = 10 + random() * 15;
    
    ctx.fillStyle = colors[3 + Math.floor(random() * 2)];
    for (let j = 0; j < 5; j++) {
      const angle = (j / 5) * Math.PI * 2;
      ctx.beginPath();
      ctx.ellipse(
        x + Math.cos(angle) * size * 0.7,
        y + Math.sin(angle) * size * 0.7,
        size * 0.5,
        size * 0.3,
        angle,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawElements(ctx: CanvasRenderingContext2D, width: number, height: number, colors: string[], random: () => number, analysis: any, style: string) {
  if (analysis.hasNature) {
    drawNatureScene(ctx, width, height, colors, random);
  }
  
  if (analysis.hasPerson) {
    drawCharacter(ctx, width, height, colors, random, style);
  } else if (analysis.hasAnimal) {
    drawAnimal(ctx, width, height, colors, random, style);
  } else if (analysis.hasCity) {
    drawCityscape(ctx, width, height, colors, random, style);
  } else if (analysis.hasFantasy) {
    drawFantasyElements(ctx, width, height, colors, random, style);
  } else {
    drawAbstractArt(ctx, width, height, colors, random, style);
  }
}

function drawAnimal(ctx: CanvasRenderingContext2D, width: number, height: number, colors: string[], random: () => number, style: string) {
  const centerX = width / 2;
  const centerY = height / 2;
  const scale = Math.min(width, height) / 400;

  ctx.save();
  ctx.translate(centerX, centerY);

  ctx.fillStyle = colors[2];
  ctx.strokeStyle = style === 'cartoon' ? '#000' : colors[3];
  ctx.lineWidth = stylePresets[style as keyof typeof stylePresets]?.lineWidth || 2;

  ctx.beginPath();
  ctx.ellipse(0, 20 * scale, 80 * scale, 50 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(70 * scale, -20 * scale, 45 * scale, 40 * scale, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(100 * scale, -50 * scale);
  ctx.lineTo(120 * scale, -90 * scale);
  ctx.lineTo(90 * scale, -40 * scale);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(55 * scale, -45 * scale);
  ctx.lineTo(50 * scale, -95 * scale);
  ctx.lineTo(75 * scale, -50 * scale);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = colors[3];
  ctx.beginPath();
  ctx.ellipse(95 * scale, -30 * scale, 18 * scale, 20 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(95 * scale, -30 * scale, 14 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(98 * scale, -28 * scale, 7 * scale, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FF69B4';
  ctx.beginPath();
  ctx.ellipse(115 * scale, -5 * scale, 10 * scale, 8 * scale, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = colors[2];
  for (let i = 0; i < 4; i++) {
    const legX = -40 * scale + i * 30 * scale;
    ctx.beginPath();
    ctx.roundRect(legX, 50 * scale, 20 * scale, 45 * scale, 8 * scale);
    ctx.fill();
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.moveTo(-60 * scale, 30 * scale);
  ctx.quadraticCurveTo(-100 * scale, 0, -90 * scale, -30 * scale);
  ctx.quadraticCurveTo(-85 * scale, -35 * scale, -80 * scale, -25 * scale);
  ctx.quadraticCurveTo(-95 * scale, 0, -55 * scale, 35 * scale);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

function drawCityscape(ctx: CanvasRenderingContext2D, width: number, height: number, colors: string[], random: () => number, style: string) {
  const nightGradient = ctx.createLinearGradient(0, 0, 0, height);
  nightGradient.addColorStop(0, '#0a0a2e');
  nightGradient.addColorStop(1, '#1a1a4e');
  ctx.fillStyle = nightGradient;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#fff';
  for (let i = 0; i < 100; i++) {
    ctx.beginPath();
    ctx.arc(random() * width, random() * height * 0.4, random() * 2 + 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  let x = 0;
  while (x < width) {
    const buildingWidth = 50 + random() * 100;
    const buildingHeight = 100 + random() * 250;
    
    const buildingGradient = ctx.createLinearGradient(x, height - buildingHeight, x + buildingWidth, height);
    buildingGradient.addColorStop(0, colors[2]);
    buildingGradient.addColorStop(1, colors[3]);
    
    ctx.fillStyle = buildingGradient;
    ctx.fillRect(x, height - buildingHeight, buildingWidth, buildingHeight);
    ctx.strokeStyle = colors[4];
    ctx.strokeRect(x, height - buildingHeight, buildingWidth, buildingHeight);

    for (let wy = height - buildingHeight + 20; wy < height - 30; wy += 35) {
      for (let wx = x + 15; wx < x + buildingWidth - 15; wx += 25) {
        if (random() > 0.3) {
          ctx.fillStyle = random() > 0.5 ? '#ffff00' : '#00f5ff';
          ctx.globalAlpha = 0.5 + random() * 0.5;
          ctx.fillRect(wx, wy, 12, 18);
        }
      }
    }
    ctx.globalAlpha = 1;
    
    x += buildingWidth + 10 + random() * 20;
  }

  if (style === 'digital-art' || style === 'neon') {
    ctx.strokeStyle = colors[0];
    ctx.lineWidth = 2;
    for (let i = 0; i < 10; i++) {
      ctx.beginPath();
      ctx.moveTo(random() * width, height);
      ctx.lineTo(random() * width, height - 200);
      ctx.stroke();
    }
  }
}

function drawFantasyElements(ctx: CanvasRenderingContext2D, width: number, height: number, colors: string[], random: () => number, style: string) {
  const skyGradient = ctx.createLinearGradient(0, 0, 0, height);
  skyGradient.addColorStop(0, '#0f0c29');
  skyGradient.addColorStop(0.5, '#302b63');
  skyGradient.addColorStop(1, '#24243e');
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < 200; i++) {
    const x = random() * width;
    const y = random() * height * 0.7;
    const size = random() * 3 + 0.5;
    const twinkle = random() * 0.5 + 0.5;
    
    ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  const castleX = width / 2;
  const castleY = height * 0.65;
  
  const castleColors = ['#667eea', '#764ba2', '#f093fb', '#f5576c'];
  
  ctx.fillStyle = castleColors[0];
  ctx.beginPath();
  ctx.moveTo(castleX - 120, castleY + 80);
  ctx.lineTo(castleX - 120, castleY);
  ctx.lineTo(castleX - 80, castleY - 60);
  ctx.lineTo(castleX - 40, castleY);
  ctx.lineTo(castleX + 40, castleY);
  ctx.lineTo(castleX + 80, castleY - 60);
  ctx.lineTo(castleX + 120, castleY);
  ctx.lineTo(castleX + 120, castleY + 80);
  ctx.closePath();
  ctx.fill();

  for (let i = 0; i < 3; i++) {
    const towerX = castleX - 80 + i * 80;
    const towerHeight = 100 + i * 30;
    
    ctx.fillStyle = castleColors[i % castleColors.length];
    ctx.fillRect(towerX - 25, castleY - towerHeight, 50, towerHeight);
    
    ctx.beginPath();
    ctx.moveTo(towerX - 35, castleY - towerHeight);
    ctx.lineTo(towerX, castleY - towerHeight - 40);
    ctx.lineTo(towerX + 35, castleY - towerHeight);
    ctx.closePath();
    ctx.fill();
  }

  for (let i = 0; i < 10; i++) {
    const x = random() * width;
    const y = random() * height;
    const radius = random() * 20 + 10;
    
    const fairyGlow = ctx.createRadialGradient(x, y, 0, x, y, radius);
    fairyGlow.addColorStop(0, colors[4]);
    fairyGlow.addColorStop(0.5, colors[3] + '80');
    fairyGlow.addColorStop(1, 'transparent');
    
    ctx.fillStyle = fairyGlow;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawAbstractArt(ctx: CanvasRenderingContext2D, width: number, height: number, colors: string[], random: () => number, style: string) {
  for (let i = 0; i < 15; i++) {
    const x = random() * width;
    const y = random() * height;
    const size = random() * 200 + 50;
    const color = colors[Math.floor(random() * colors.length)];
    
    ctx.fillStyle = color + '40';
    ctx.beginPath();
    
    if (random() > 0.5) {
      ctx.arc(x, y, size, 0, Math.PI * 2);
    } else {
      ctx.ellipse(x, y, size, size * (random() * 0.5 + 0.5), random() * Math.PI, 0, Math.PI * 2);
    }
    ctx.fill();
  }

  ctx.strokeStyle = colors[0];
  ctx.lineWidth = 3;
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.moveTo(random() * width, random() * height);
    for (let j = 0; j < 5; j++) {
      ctx.quadraticCurveTo(
        random() * width,
        random() * height,
        random() * width,
        random() * height
      );
    }
    ctx.stroke();
  }

  for (let i = 0; i < 20; i++) {
    const x = random() * width;
    const y = random() * height;
    const size = random() * 30 + 10;
    
    ctx.fillStyle = colors[Math.floor(random() * colors.length)];
    ctx.globalAlpha = random() * 0.7 + 0.3;
    
    ctx.beginPath();
    for (let j = 0; j < 6; j++) {
      const angle = (j / 6) * Math.PI * 2;
      const px = x + Math.cos(angle) * size;
      const py = y + Math.sin(angle) * size;
      if (j === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function addArtisticEffects(ctx: CanvasRenderingContext2D, width: number, height: number, colors: string[], random: () => number, style: string) {
  if (style === 'oil-painting') {
    for (let i = 0; i < 5000; i++) {
      const x = random() * width;
      const y = random() * height;
      const size = random() * 8 + 2;
      const color = colors[Math.floor(random() * colors.length)];
      
      ctx.fillStyle = color + '30';
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (style === 'pixel') {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const pixelSize = 8;
    
    for (let y = 0; y < height; y += pixelSize) {
      for (let x = 0; x < width; x += pixelSize) {
        let r = 0, g = 0, b = 0;
        let count = 0;
        
        for (let py = y; py < y + pixelSize && py < height; py++) {
          for (let px = x; px < x + pixelSize && px < width; px++) {
            const idx = (py * width + px) * 4;
            r += data[idx];
            g += data[idx + 1];
            b += data[idx + 2];
            count++;
          }
        }
        
        r = Math.floor(r / count);
        g = Math.floor(g / count);
        b = Math.floor(b / count);
        
        for (let py = y; py < y + pixelSize && py < height; py++) {
          for (let px = x; px < x + pixelSize && px < width; px++) {
            const idx = (py * width + px) * 4;
            data[idx] = r;
            data[idx + 1] = g;
            data[idx + 2] = b;
          }
        }
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }

  const vignette = ctx.createRadialGradient(
    width / 2, height / 2, Math.min(width, height) * 0.3,
    width / 2, height / 2, Math.max(width, height) * 0.7
  );
  vignette.addColorStop(0, 'transparent');
  vignette.addColorStop(1, 'rgba(0,0,0,0.3)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);
}

export async function generateImageWithPrompt(options: GenerationOptions): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = options.width;
    canvas.height = options.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve('');
      return;
    }

    const random = seededRandom(options.seed);
    const analysis = analyzePrompt(options.prompt);
    const styleConfig = stylePresets[options.style as keyof typeof stylePresets] || stylePresets.anime;
    const colors = (colorPalettes as any)[options.colorPalette] || colorPalettes.vibrant;

    drawBackground(ctx, options.width, options.height, colors, random, options.style);
    drawElements(ctx, options.width, options.height, colors, random, analysis, options.style);
    addArtisticEffects(ctx, options.width, options.height, colors, random, options.style);

    resolve(canvas.toDataURL('image/png'));
  });
}
