export interface VideoScene {
  id: string;
  text: string;
  voiceover: string;
  duration: number;
  visual: string;
  imagePrompt?: string;
  effects: string[];
}

export interface VideoScript {
  title: string;
  description: string;
  scenes: VideoScene[];
  totalDuration: number;
  mood: string;
  style: string;
  backgroundMusic: string;
}

export interface SubtitleItem {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  style?: SubtitleStyle;
}

export interface SubtitleStyle {
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  backgroundColor?: string;
  position?: "top" | "center" | "bottom";
  animation?: "fade" | "pop" | "slide" | "karaoke";
}

export interface MusicTrack {
  id: string;
  name: string;
  category: string;
  mood: string;
  duration: number;
  filePath: string;
}

export interface VideoProject {
  id: string;
  title: string;
  description: string;
  status: VideoStatus;
  script?: VideoScript;
  subtitles?: SubtitleItem[];
  selectedMusic?: MusicTrack;
  outputUrl?: string;
  thumbnailUrl?: string;
  progress: number;
  currentStep: string;
  createdAt: Date;
  updatedAt: Date;
}

export type VideoStatus =
  | "draft"
  | "generating_script"
  | "generating_voice"
  | "generating_visuals"
  | "compositing"
  | "adding_subtitles"
  | "adding_music"
  | "completed"
  | "failed";

export type VideoStyle =
  | "knowledge"
  | "story"
  | "product"
  | "tutorial"
  | "vlog"
  | "news";

export type VideoDuration = 15 | 30 | 60 | 120;

export type VideoResolution = "720p" | "1080p";

export type VoiceStyle =
  | "male"
  | "female"
  | "child"
  | "narrator"
  | "dramatic"
  | "calm";

export interface GenerateVideoRequest {
  prompt: string;
  style: VideoStyle;
  duration: VideoDuration;
  resolution: VideoResolution;
  voiceStyle: VoiceStyle;
  musicCategory?: string;
}

export interface GenerateVideoResponse {
  taskId: string;
  status: VideoStatus;
  estimatedTime: number;
}

export interface TaskStatusResponse {
  taskId: string;
  status: VideoStatus;
  progress: number;
  currentStep: string;
  result?: {
    videoUrl: string;
    thumbnailUrl: string;
    duration: number;
  };
  error?: string;
}
