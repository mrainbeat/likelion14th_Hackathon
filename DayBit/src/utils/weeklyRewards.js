import apiClient from "../api/apiClient";

export function getWeeklyRewards(year, month) {
  return apiClient.get("/api/v1/weekly-rewards", { params: { year, month } });
}

export function getWeeklyRewardDetail(weeklyRewardId) {
  return apiClient.get(`/api/v1/weekly-rewards/${weeklyRewardId}`);
}

export function markWeeklyRewardViewed(weeklyRewardId) {
  return apiClient.patch(`/api/v1/weekly-rewards/${weeklyRewardId}/view`);
}

const NOTIFIED_KEY = "weekly_reward_notified_ids";

function scopedKey(key, userId) {
  return `${key}_${userId}`;
}

function readIdSet(key, userId) {
  try {
    const raw = localStorage.getItem(scopedKey(key, userId));
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function addId(key, userId, id) {
  const set = readIdSet(key, userId);
  set.add(id);
  localStorage.setItem(scopedKey(key, userId), JSON.stringify(Array.from(set)));
}

export function isWeeklyRewardNotified(userId, id) {
  return readIdSet(NOTIFIED_KEY, userId).has(id);
}

export function markWeeklyRewardNotified(userId, id) {
  addId(NOTIFIED_KEY, userId, id);
}
