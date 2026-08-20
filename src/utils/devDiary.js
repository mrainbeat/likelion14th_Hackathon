import apiClient from "../api/apiClient";

const DEV_PASSWORD_HEADER = "X-Daybit-Dev-Password";

function devHeaders(devPassword) {
  return devPassword ? { [DEV_PASSWORD_HEADER]: devPassword } : {};
}

export function verifyDevAccess(devPassword) {
  return apiClient.post("/api/dev/access/verify", null, {
    headers: devHeaders(devPassword),
  });
}

export function createDatedDiary(
  recordedDate,
  content,
  personalizationUsesDiaryContent,
  devPassword,
) {
  return apiClient.post(
    "/api/dev/me/diaries",
    { content, personalizationUsesDiaryContent },
    { params: { recordedDate }, headers: devHeaders(devPassword) },
  );
}

export function getDiaryReward(diaryId) {
  return apiClient.get(`/api/v1/diaries/${diaryId}/reward`);
}

export function generateWeeklyReward(weekStartDate, devPassword) {
  return apiClient.post("/api/dev/me/weekly-rewards/generate", null, {
    params: { weekStartDate },
    headers: devHeaders(devPassword),
  });
}

export function resetTodayDiary() {
  return apiClient.delete("/api/dev/me/diaries/today");
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
