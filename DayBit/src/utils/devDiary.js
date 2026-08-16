import apiClient from "../api/apiClient";

export function createDatedDiary(
  recordedDate,
  content,
  personalizationUsesDiaryContent,
) {
  return apiClient.post(
    "/api/dev/me/diaries",
    { content, personalizationUsesDiaryContent },
    { params: { recordedDate } },
  );
}

export function getDiaryReward(diaryId) {
  return apiClient.get(`/api/v1/diaries/${diaryId}/reward`);
}

export function generateWeeklyReward(weekStartDate) {
  return apiClient.post("/api/dev/me/weekly-rewards/generate", null, {
    params: { weekStartDate },
  });
}

export function resetTodayDiary() {
  return apiClient.delete("/api/dev/me/diaries/today");
}

export const DEV_UNLOCK_KEY = "dev_tools_unlocked";
const DEV_PASSCODE = "0825";

export function isDevToolsUnlocked() {
  try {
    return localStorage.getItem(DEV_UNLOCK_KEY) === "true";
  } catch {
    return false;
  }
}

export function unlockDevTools(passcode) {
  if (passcode.trim() !== DEV_PASSCODE) return false;
  try {
    localStorage.setItem(DEV_UNLOCK_KEY, "true");
  } catch {
    return true;
  }
  return true;
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

export function formatDate(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function getSeoulTodayStr() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(
    new Date(),
  );
}

export function getMondayOf(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return formatDate(d);
}

export function addDays(dateStr, days) {
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  d.setDate(d.getDate() + days);
  return formatDate(d);
}
