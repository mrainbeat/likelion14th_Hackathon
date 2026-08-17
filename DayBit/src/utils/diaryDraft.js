export function getTodaySeoulDate() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(
    new Date(),
  );
}

const LAST_TIMESTAMP_KEY = "diary_last_timestamp_at";

export function saveDraft(content) {
  localStorage.setItem("diary_content", content);
  localStorage.setItem("diary_content_date", getTodaySeoulDate());
}

export function clearDraft() {
  localStorage.removeItem("diary_content");
  localStorage.removeItem("diary_content_date");
  localStorage.removeItem(LAST_TIMESTAMP_KEY);
}

export function loadTodayDraft() {
  const savedDate = localStorage.getItem("diary_content_date");
  if (savedDate !== getTodaySeoulDate()) {
    clearDraft();
    return null;
  }
  return localStorage.getItem("diary_content");
}

export function getLastTimestampAt() {
  const savedDate = localStorage.getItem("diary_content_date");
  if (savedDate !== getTodaySeoulDate()) return null;
  const raw = localStorage.getItem(LAST_TIMESTAMP_KEY);
  return raw ? Number(raw) : null;
}

export function markTimestampAppended() {
  localStorage.setItem(LAST_TIMESTAMP_KEY, String(Date.now()));
}

export function draftHasContent(html) {
  if (!html) return false;
  const temp = document.createElement("div");
  temp.innerHTML = html;
  return (temp.textContent || temp.innerText || "").trim().length > 0;
}
