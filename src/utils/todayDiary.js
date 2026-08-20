import apiClient from "../api/apiClient";
import { getServiceToday } from "./serviceDate";

const WRITTEN_DATE_KEY = "diary_written_date";

export function isWrittenTodayCached() {
  try {
    return localStorage.getItem(WRITTEN_DATE_KEY) === getServiceToday().dateStr;
  } catch {
    return false;
  }
}

export function markWrittenToday() {
  try {
    localStorage.setItem(WRITTEN_DATE_KEY, getServiceToday().dateStr);
  } catch {
    return;
  }
}

export function clearWrittenToday() {
  try {
    localStorage.removeItem(WRITTEN_DATE_KEY);
  } catch {
    return;
  }
}

function hasToday(result, todayStr) {
  const items = Array.isArray(result) ? result : (result?.items ?? []);
  return items.some((item) => item.recordedDate === todayStr);
}

async function anyHasToday(requests, todayStr) {
  const results = await Promise.allSettled(requests);
  return results.some(
    (result) =>
      result.status === "fulfilled" &&
      hasToday(result.value.data?.result, todayStr),
  );
}

export async function fetchWrittenTodayInArchive() {
  if (isWrittenTodayCached()) return true;

  const written = await anyHasToday(
    [
      apiClient.get("/api/v1/diaries/trash"),
      apiClient.get("/api/v1/diaries/hidden"),
    ],
    getServiceToday().dateStr,
  );

  if (written) markWrittenToday();
  return written;
}

export async function fetchWrittenToday() {
  if (isWrittenTodayCached()) return true;

  const { year, month, dateStr } = getServiceToday();
  const inMonth = await anyHasToday(
    [apiClient.get("/api/v1/diaries", { params: { year, month } })],
    dateStr,
  );

  if (inMonth) {
    markWrittenToday();
    return true;
  }

  return fetchWrittenTodayInArchive();
}
