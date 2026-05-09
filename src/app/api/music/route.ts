import { NextRequest, NextResponse } from "next/server";
import { musicLibrary, recommendMusicByMood } from "@/lib/music/library";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mood = searchParams.get("mood");
  const category = searchParams.get("category");

  if (mood) {
    const tracks = recommendMusicByMood(mood);
    return NextResponse.json({ tracks });
  }

  if (category) {
    const tracks = musicLibrary.filter((t) => t.category === category);
    return NextResponse.json({ tracks });
  }

  return NextResponse.json({ tracks: musicLibrary });
}
