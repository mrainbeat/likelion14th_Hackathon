import apiClient from "../api/apiClient";

export function getWeeklyRewards(year, month) {
  return apiClient.get("/api/v1/weekly-rewards", { params: { year, month } });
}

export function getWeeklyRewardDetail(weeklyRewardId) {
  return apiClient.get(`/api/v1/weekly-rewards/${weeklyRewardId}`);
}

const VIEWED_KEY = "weekly_reward_viewed_ids";
const NOTIFIED_KEY = "weekly_reward_notified_ids";

function readIdSet(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function addId(key, id) {
  const set = readIdSet(key);
  set.add(id);
  localStorage.setItem(key, JSON.stringify(Array.from(set)));
}

export function isWeeklyRewardViewed(id) {
  return readIdSet(VIEWED_KEY).has(id);
}

export function markWeeklyRewardViewed(id) {
  addId(VIEWED_KEY, id);
}

export function isWeeklyRewardNotified(id) {
  return readIdSet(NOTIFIED_KEY).has(id);
}

export function markWeeklyRewardNotified(id) {
  addId(NOTIFIED_KEY, id);
}
