import type { MusicTrack } from "@/lib/types";

export const musicLibrary: MusicTrack[] = [
  {
    id: "music_001",
    name: "科技感轻快",
    category: "technology",
    mood: "积极",
    duration: 60,
    filePath: "/music/tech_upbeat.mp3",
  },
  {
    id: "music_002",
    name: "温暖治愈钢琴",
    category: "healing",
    mood: "温暖",
    duration: 90,
    filePath: "/music/healing_piano.mp3",
  },
  {
    id: "music_003",
    name: "激昂奋进",
    category: "epic",
    mood: "激昂",
    duration: 120,
    filePath: "/music/epic_motivation.mp3",
  },
  {
    id: "music_004",
    name: "轻松日常",
    category: "daily",
    mood: "轻松",
    duration: 60,
    filePath: "/music/daily_casual.mp3",
  },
  {
    id: "music_005",
    name: "悬疑紧张",
    category: "suspense",
    mood: "紧张",
    duration: 90,
    filePath: "/music/suspense_tense.mp3",
  },
  {
    id: "music_006",
    name: "古风中国",
    category: "chinese",
    mood: "古典",
    duration: 80,
    filePath: "/music/chinese_classic.mp3",
  },
  {
    id: "music_007",
    name: "电子动感",
    category: "electronic",
    mood: "动感",
    duration: 70,
    filePath: "/music/electronic_dynamic.mp3",
  },
  {
    id: "music_008",
    name: "浪漫抒情",
    category: "romantic",
    mood: "浪漫",
    duration: 100,
    filePath: "/music/romantic_lyrical.mp3",
  },
];

const moodMapping: Record<string, string[]> = {
  积极向上: ["technology", "epic", "electronic"],
  温暖治愈: ["healing", "romantic", "daily"],
  激昂奋进: ["epic", "electronic", "technology"],
  轻松愉快: ["daily", "healing", "technology"],
  紧张悬疑: ["suspense", "electronic"],
  古典优雅: ["chinese", "healing"],
  浪漫抒情: ["romantic", "healing"],
};

export function recommendMusicByMood(mood: string): MusicTrack[] {
  const categories = moodMapping[mood] || ["daily", "healing"];
  return musicLibrary.filter((track) =>
    categories.includes(track.category)
  );
}

export function getMusicById(id: string): MusicTrack | undefined {
  return musicLibrary.find((track) => track.id === id);
}

export function getMusicByCategory(category: string): MusicTrack[] {
  return musicLibrary.filter((track) => track.category === category);
}
