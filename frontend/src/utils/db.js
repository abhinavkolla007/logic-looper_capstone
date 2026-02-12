import { openDB } from "idb";

const DB_NAME = "logic-looper-db";
const DB_VERSION = 2;

export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("dailyProgress")) {
        db.createObjectStore("dailyProgress", { keyPath: "date" });
      }

      if (!db.objectStoreNames.contains("streakData")) {
        db.createObjectStore("streakData", { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains("settings")) {
        db.createObjectStore("settings", { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains("scoreSyncQueue")) {
        db.createObjectStore("scoreSyncQueue", { keyPath: "id", autoIncrement: true });
      }
    },
  });
};

export const saveDailyProgress = async (progress) => {
  const db = await initDB();
  await db.put("dailyProgress", progress);
};

export const getDailyProgress = async (date) => {
  const db = await initDB();
  return db.get("dailyProgress", date);
};

export const saveStreakState = async (state) => {
  const db = await initDB();
  await db.put("streakData", { id: "main", ...state });
};

export const getStreakState = async () => {
  const db = await initDB();
  return db.get("streakData", "main");
};

export const getProgressRange = async () => {
  const db = await initDB();
  return db.getAll("dailyProgress");
};

export const saveSetting = async (id, value) => {
  const db = await initDB();
  await db.put("settings", { id, value });
};

export const getSetting = async (id, fallback = null) => {
  const db = await initDB();
  const record = await db.get("settings", id);
  return record?.value ?? fallback;
};

export const queueScoreForSync = async (payload) => {
  const db = await initDB();
  await db.add("scoreSyncQueue", payload);
};

export const getQueuedScores = async (limit = 5) => {
  const db = await initDB();
  const tx = db.transaction("scoreSyncQueue", "readonly");
  const store = tx.objectStore("scoreSyncQueue");
  const items = [];
  let cursor = await store.openCursor();

  while (cursor && items.length < limit) {
    items.push({ id: cursor.primaryKey, ...cursor.value });
    cursor = await cursor.continue();
  }

  await tx.done;
  return items;
};

export const clearQueuedScores = async (ids) => {
  const db = await initDB();
  const tx = db.transaction("scoreSyncQueue", "readwrite");
  await Promise.all(ids.map((id) => tx.store.delete(id)));
  await tx.done;
};
