import type { SubtitleItem, VideoScene } from "@/lib/types";

export function generateSubtitlesFromScenes(
  scenes: VideoScene[]
): SubtitleItem[] {
  const subtitles: SubtitleItem[] = [];
  let currentTime = 0;

  for (const scene of scenes) {
    const lines = splitTextIntoLines(scene.voiceover, 15);
    const lineDuration = scene.duration / lines.length;

    for (let i = 0; i < lines.length; i++) {
      subtitles.push({
        id: `sub_${scene.id}_${i}`,
        text: lines[i],
        startTime: currentTime + i * lineDuration,
        endTime: currentTime + (i + 1) * lineDuration,
      });
    }

    currentTime += scene.duration;
  }

  return subtitles;
}

function splitTextIntoLines(text: string, maxChars: number): string[] {
  if (text.length <= maxChars) {
    return [text];
  }

  const lines: string[] = [];
  const punctuation = /[，。！？、；：,\.!\?;:]/;
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= maxChars) {
      lines.push(remaining);
      break;
    }

    let splitIndex = -1;
    for (let i = maxChars; i >= maxChars / 2; i--) {
      if (punctuation.test(remaining[i])) {
        splitIndex = i + 1;
        break;
      }
    }

    if (splitIndex === -1) {
      splitIndex = maxChars;
    }

    lines.push(remaining.substring(0, splitIndex).trim());
    remaining = remaining.substring(splitIndex).trim();
  }

  return lines.filter((line) => line.length > 0);
}

export function generateSRT(subtitles: SubtitleItem[]): string {
  return subtitles
    .map(
      (sub, index) =>
        `${index + 1}\n${formatSRTTime(sub.startTime)} --> ${formatSRTTime(
          sub.endTime
        )}\n${sub.text}\n`
    )
    .join("\n");
}

function formatSRTTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);

  return `${pad(hours)}:${pad(minutes)}:${pad(secs)},${pad3(ms)}`;
}

function pad(num: number): string {
  return num.toString().padStart(2, "0");
}

function pad3(num: number): string {
  return num.toString().padStart(3, "0");
}

export function generateASS(subtitles: SubtitleItem[]): string {
  const header = `[Script Info]
Title: OneGoVideo Subtitles
ScriptType: v4.00+
WrapStyle: 0
PlayResX: 1920
PlayResY: 1080

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,PingFang SC,52,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,3,1,2,20,20,40,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text`;

  const events = subtitles
    .map(
      (sub) =>
        `Dialogue: 0,${formatASSTime(sub.startTime)},${formatASSTime(
          sub.endTime
        )},Default,,0,0,0,,${sub.text}`
    )
    .join("\n");

  return `${header}\n${events}`;
}

function formatASSTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${hours}:${pad(minutes)}:${secs.toFixed(2).padStart(5, "0")}`;
}
