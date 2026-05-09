import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs/promises";

const execAsync = promisify(exec);

export interface CompositeOptions {
  sceneImagePaths: string[];
  audioPaths: string[];
  musicPath?: string;
  subtitlePath?: string;
  outputPath: string;
  width: number;
  height: number;
  fps: number;
}

export async function compositeVideo(options: CompositeOptions): Promise<string> {
  const {
    sceneImagePaths,
    audioPaths,
    musicPath,
    subtitlePath,
    outputPath,
    width,
    height,
    fps,
  } = options;

  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  const tempDir = path.join(path.dirname(outputPath), "temp");
  await fs.mkdir(tempDir, { recursive: true });

  try {
    const sceneVideos: string[] = [];

    for (let i = 0; i < sceneImagePaths.length; i++) {
      const imagePath = sceneImagePaths[i];
      const audioPath = audioPaths[i];
      const sceneVideoPath = path.join(tempDir, `scene_${i}.mp4`);

      const audioDuration = await getAudioDuration(audioPath);
      const duration = Math.max(audioDuration, 3);

      const ffmpegCmd = [
        "ffmpeg",
        "-y",
        `-loop 1 -i "${imagePath}"`,
        `-i "${audioPath}"`,
        `-c:v libx264`,
        `-t ${duration}`,
        `-pix_fmt yuv420p`,
        `-vf "scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2"`,
        `-r ${fps}`,
        `-c:a aac`,
        `-b:a 192k`,
        `-shortest`,
        `"${sceneVideoPath}"`,
      ].join(" ");

      await execAsync(ffmpegCmd);
      sceneVideos.push(sceneVideoPath);
    }

    const concatListPath = path.join(tempDir, "concat.txt");
    const concatContent = sceneVideos
      .map((v) => `file '${v.replace(/\\/g, "/")}'`)
      .join("\n");
    await fs.writeFile(concatListPath, concatContent);

    const concatOutputPath = path.join(tempDir, "concat_output.mp4");
    await execAsync(
      `ffmpeg -y -f concat -safe 0 -i "${concatListPath}" -c copy "${concatOutputPath}"`
    );

    const finalInput = concatOutputPath;
    const ffmpegFilters: string[] = [];

    if (subtitlePath) {
      ffmpegFilters.push(
        `subtitles='${subtitlePath.replace(/\\/g, "/").replace(/:/g, "\\:")}'`
      );
    }

    const finalCmd = [
      "ffmpeg",
      "-y",
      `-i "${finalInput}"`,
      ...(musicPath ? [`-i "${musicPath}"`] : []),
      ...(ffmpegFilters.length > 0
        ? [`-vf "${ffmpegFilters.join(",")}"`]
        : []),
      ...(musicPath
        ? [
            '-filter_complex "[0:a]volume=1[a1];[1:a]volume=0.3[a2];[a1][a2]amix=inputs=2:duration=first[aout]"',
            "-map 0:v",
            '-map "[aout]"',
          ]
        : []),
      "-c:v libx264",
      "-c:a aac",
      "-b:a 192k",
      `"${outputPath}"`,
    ].join(" ");

    await execAsync(finalCmd);

    return outputPath;
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
}

async function getAudioDuration(audioPath: string): Promise<number> {
  try {
    const { stdout } = await execAsync(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${audioPath}"`
    );
    return parseFloat(stdout.trim()) || 5;
  } catch {
    return 5;
  }
}

export async function generateThumbnail(
  videoPath: string,
  outputPath: string,
  timeOffset: number = 1
): Promise<string> {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  await execAsync(
    `ffmpeg -y -i "${videoPath}" -ss ${timeOffset} -vframes 1 -vf "scale=1280:720" "${outputPath}"`
  );

  return outputPath;
}
