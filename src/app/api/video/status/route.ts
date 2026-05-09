import { NextRequest, NextResponse } from "next/server";
import { getTaskStatus } from "@/lib/store/fileStore";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get("taskId");

  if (!taskId) {
    return NextResponse.json(
      { error: "缺少taskId参数" },
      { status: 400 }
    );
  }

  const task = await getTaskStatus(taskId);

  if (!task) {
    return NextResponse.json(
      {
        taskId,
        status: "unknown",
        progress: 0,
        currentStep: "任务不存在或已过期",
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    taskId,
    ...task,
  });
}
