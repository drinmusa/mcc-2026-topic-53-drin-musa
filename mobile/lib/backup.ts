import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { apiGet, apiPost } from "./api";

export type BackupTask = {
  id: string;
  fileName: string;
  mimeType: string;
  base64: string;
  // "error" kept as alias for "failed" for UI compatibility
  status: "pending" | "uploading" | "failed" | "error" | "uploaded";
  error?: string;
  retryCount: number;
  createdAt: number;
};

export type UploadedImage = {
  id: number;
  file_name: string;
  original_url: string;
  thumbnail_url: string;
  uploaded_at: string;
};

const MAX_RETRIES = 5;

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

function getQueueKey(userId: number) {
  return `mcc_photo_backup_queue:${userId}`;
}

async function loadQueueByKey(queueKey: string): Promise<BackupTask[]> {
  const raw = await AsyncStorage.getItem(queueKey);
  return raw ? (JSON.parse(raw) as BackupTask[]) : [];
}

async function saveQueueByKey(queueKey: string, tasks: BackupTask[]) {
  await AsyncStorage.setItem(queueKey, JSON.stringify(tasks));
}

export async function addBackupTask(payload: {
  userId: number;
  fileName: string;
  mimeType: string;
  base64: string;
}): Promise<BackupTask> {
  const task: BackupTask = {
    id: createId(),
    fileName: payload.fileName,
    mimeType: payload.mimeType,
    base64: payload.base64,
    status: "pending",
    retryCount: 0,
    createdAt: Date.now(),
  };
  const queueKey = getQueueKey(payload.userId);
  const queue = await loadQueueByKey(queueKey);
  queue.push(task);
  await saveQueueByKey(queueKey, queue);
  return task;
}

export async function loadBackupQueue(userId: number): Promise<BackupTask[]> {
  return loadQueueByKey(getQueueKey(userId));
}

/** Returns true when the device has an active internet connection. */
async function isOnline(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return state.isConnected === true && state.isInternetReachable !== false;
}

/** Exponential backoff delay: 2^n seconds, capped at 32 s. */
function backoffMs(retryCount: number): number {
  return Math.min(2 ** retryCount * 1000, 32_000);
}

export async function processBackupQueue(
  userId: number,
): Promise<BackupTask[]> {
  // ── Offline guard ──────────────────────────────────────────────────────────
  if (!(await isOnline())) {
    console.log("📴 Device is offline — skipping queue processing.");
    return loadQueueByKey(getQueueKey(userId));
  }

  const queueKey = getQueueKey(userId);
  console.log("📦 Loading queue:", queueKey);

  const queue = await loadQueueByKey(queueKey);
  console.log("📦 Queue items:", queue.length);

  const remainingTasks: BackupTask[] = [];

  for (const task of queue) {
    // Skip tasks that have permanently exhausted retries
    if (task.retryCount >= MAX_RETRIES) {
      console.log(
        `⛔ Task ${task.id} exceeded max retries (${MAX_RETRIES}), skipping.`,
      );
      remainingTasks.push({ ...task, status: "error" });
      continue;
    }

    // Exponential backoff: honour the delay since last attempt
    if (task.retryCount > 0 && task.createdAt) {
      const waitUntil = task.createdAt + backoffMs(task.retryCount);
      if (Date.now() < waitUntil) {
        console.log(
          `⏳ Task ${task.id} is in backoff until ${new Date(waitUntil).toISOString()}`,
        );
        remainingTasks.push(task);
        continue;
      }
    }

    console.log("━━━━━━━━━━━━━━━━━━━━━━");
    console.log("⬆️ Starting upload");
    console.log("🆔 Task ID:", task.id);
    console.log("📄 File:", task.fileName);
    console.log("🧪 Mime:", task.mimeType);
    console.log("📏 Base64 length:", task.base64?.length);
    console.log("🔄 Retry count:", task.retryCount);

    try {
      console.log("📡 Sending request to /api/uploads");

      const payload = {
        fileName: task.fileName,
        mimeType: task.mimeType,
        base64: task.base64,
      };

      const result = await apiPost<UploadedImage>("/api/uploads", payload);

      console.log("✅ Upload response:", result);

      if (!result?.original_url) {
        console.log("❌ Invalid response:", result);
        throw new Error("Upload succeeded but response was invalid.");
      }

      console.log("🎉 Upload success:", result.original_url);
      // Successful — do NOT add to remainingTasks; task is done.
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      const nextRetryCount = task.retryCount + 1;
      const permanent = nextRetryCount >= MAX_RETRIES;

      console.log(
        `💥 Upload failed (attempt ${nextRetryCount}/${MAX_RETRIES}): ${msg}`,
      );

      remainingTasks.push({
        ...task,
        // Mark permanent failures as "error" so the UI retry button picks them up
        status: permanent ? "error" : "failed",
        error: msg,
        retryCount: nextRetryCount,
        // Reset createdAt to now so backoff is measured from last failure
        createdAt: Date.now(),
      });
    }
  }

  console.log("📦 Remaining tasks:", remainingTasks.length);
  await saveQueueByKey(queueKey, remainingTasks);
  return remainingTasks;
}

export async function fetchUploadedImages(): Promise<UploadedImage[]> {
  return apiGet<UploadedImage[]>("/api/uploads");
}
