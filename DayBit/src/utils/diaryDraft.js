import { getServiceTodayStr } from "./serviceDate";

export function getTodaySeoulDate() {
  return getServiceTodayStr();
}

const LAST_TIMESTAMP_KEY = "diary_last_timestamp_at";
const QUESTIONS_KEY = "diary_questions";
const QUESTIONS_DATE_KEY = "diary_questions_date";

export function saveDraft(content) {
  localStorage.setItem("diary_content", content);
  localStorage.setItem("diary_content_date", getTodaySeoulDate());
}

export function clearDraft() {
  localStorage.removeItem("diary_content");
  localStorage.removeItem("diary_content_date");
  localStorage.removeItem(LAST_TIMESTAMP_KEY);
}

export function loadTodayQuestions() {
  try {
    const raw = localStorage.getItem(QUESTIONS_KEY);
    if (!raw) return [];

    const savedDate = localStorage.getItem(QUESTIONS_DATE_KEY);
    if (savedDate && savedDate !== getTodaySeoulDate()) {
      clearQuestions();
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    if (!savedDate) {
      localStorage.setItem(QUESTIONS_DATE_KEY, getTodaySeoulDate());
    }
    return parsed;
  } catch {
    return [];
  }
}

export function saveQuestions(questions) {
  try {
    localStorage.setItem(QUESTIONS_KEY, JSON.stringify(questions));
    localStorage.setItem(QUESTIONS_DATE_KEY, getTodaySeoulDate());
  } catch {
    return;
  }
}

export function clearQuestions() {
  localStorage.removeItem(QUESTIONS_KEY);
  localStorage.removeItem(QUESTIONS_DATE_KEY);
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
