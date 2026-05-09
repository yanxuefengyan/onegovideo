import { create } from "zustand";
import type {
  VideoProject,
  VideoScript,
  SubtitleItem,
  MusicTrack,
  VideoStatus,
  VideoStyle,
  VideoDuration,
  VideoResolution,
  VoiceStyle,
} from "@/lib/types";

interface VideoStore {
  currentProject: VideoProject | null;
  projects: VideoProject[];

  prompt: string;
  style: VideoStyle;
  duration: VideoDuration;
  resolution: VideoResolution;
  voiceStyle: VoiceStyle;
  musicCategory: string;

  setPrompt: (prompt: string) => void;
  setStyle: (style: VideoStyle) => void;
  setDuration: (duration: VideoDuration) => void;
  setResolution: (resolution: VideoResolution) => void;
  setVoiceStyle: (voiceStyle: VoiceStyle) => void;
  setMusicCategory: (category: string) => void;

  setCurrentProject: (project: VideoProject | null) => void;
  updateProjectStatus: (
    status: VideoStatus,
    progress: number,
    currentStep: string
  ) => void;
  setProjectScript: (script: VideoScript) => void;
  setProjectSubtitles: (subtitles: SubtitleItem[]) => void;
  setProjectMusic: (music: MusicTrack) => void;
  setProjectOutput: (videoUrl: string, thumbnailUrl: string) => void;
  addProject: (project: VideoProject) => void;

  isGenerating: boolean;
  setIsGenerating: (val: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

export const useVideoStore = create<VideoStore>((set) => ({
  currentProject: null,
  projects: [],

  prompt: "",
  style: "knowledge",
  duration: 30,
  resolution: "1080p",
  voiceStyle: "narrator",
  musicCategory: "",

  setPrompt: (prompt) => set({ prompt }),
  setStyle: (style) => set({ style }),
  setDuration: (duration) => set({ duration }),
  setResolution: (resolution) => set({ resolution }),
  setVoiceStyle: (voiceStyle) => set({ voiceStyle }),
  setMusicCategory: (musicCategory) => set({ musicCategory }),

  setCurrentProject: (project) => set({ currentProject: project }),
  updateProjectStatus: (status, progress, currentStep) =>
    set((state) => ({
      currentProject: state.currentProject
        ? { ...state.currentProject, status, progress, currentStep }
        : null,
    })),
  setProjectScript: (script) =>
    set((state) => ({
      currentProject: state.currentProject
        ? { ...state.currentProject, script }
        : null,
    })),
  setProjectSubtitles: (subtitles) =>
    set((state) => ({
      currentProject: state.currentProject
        ? { ...state.currentProject, subtitles }
        : null,
    })),
  setProjectMusic: (music) =>
    set((state) => ({
      currentProject: state.currentProject
        ? { ...state.currentProject, selectedMusic: music }
        : null,
    })),
  setProjectOutput: (videoUrl, thumbnailUrl) =>
    set((state) => ({
      currentProject: state.currentProject
        ? {
            ...state.currentProject,
            outputUrl: videoUrl,
            thumbnailUrl,
            status: "completed",
            progress: 100,
          }
        : null,
    })),
  addProject: (project) =>
    set((state) => ({
      projects: [...state.projects, project],
    })),

  isGenerating: false,
  setIsGenerating: (val) => set({ isGenerating: val }),
  error: null,
  setError: (error) => set({ error }),
}));
