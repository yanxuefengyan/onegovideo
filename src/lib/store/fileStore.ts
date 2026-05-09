import fs from "fs/promises";
import path from "path";

const STORE_DIR = path.join(process.cwd(), "tmp", "store");
const TASKS_FILE = path.join(STORE_DIR, "tasks.json");

async function ensureStoreDir() {
  try {
    await fs.mkdir(STORE_DIR, { recursive: true });
  } catch (e) {
    // ignore
  }
}

interface TaskInfo {
  status: string;
  progress: number;
  currentStep: string;
  result?: { videoUrl: string; thumbnailUrl: string; duration: number };
  createdAt: number;
}

interface TaskData {
  [taskId: string]: TaskInfo;
}

async function loadTasks(): Promise<TaskData> {
  await ensureStoreDir();
  try {
    const data = await fs.readFile(TASKS_FILE, "utf-8");
    const parsed = JSON.parse(data);
    if (parsed && typeof parsed === "object") {
      return parsed as TaskData;
    }
    return {};
  } catch (e) {
    return {};
  }
}

async function saveTasks(tasks: TaskData) {
  await ensureStoreDir();
  try {
    await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2));
  } catch (e) {
    console.error("Failed to save tasks:", e);
  }
}

export async function getTaskStatus(
  taskId: string
): Promise<TaskInfo | undefined> {
  try {
    const tasks = await loadTasks();
    return tasks[taskId];
  } catch (e) {
    return undefined;
  }
}

export async function updateTaskStatus(
  taskId: string,
  status: string,
  progress: number,
  currentStep: string,
  result?: { videoUrl: string; thumbnailUrl: string; duration: number }
) {
  try {
    const tasks = await loadTasks();
    tasks[taskId] = {
      status,
      progress,
      currentStep,
      result,
      createdAt: tasks[taskId]?.createdAt || Date.now(),
    };
    await saveTasks(tasks);
  } catch (e) {
    console.error("Failed to update task status:", e);
  }
}

export async function cleanupOldTasks(maxAgeHours: number = 24) {
  try {
    const tasks = await loadTasks();
    const now = Date.now();
    const maxAgeMs = maxAgeHours * 60 * 60 * 1000;

    const cleaned: TaskData = {};
    for (const [taskId, task] of Object.entries(tasks)) {
      if (task && task.createdAt && now - task.createdAt < maxAgeMs) {
        cleaned[taskId] = task;
      }
    }

    await saveTasks(cleaned);
  } catch (e) {
    console.error("Failed to cleanup old tasks:", e);
  }
}
