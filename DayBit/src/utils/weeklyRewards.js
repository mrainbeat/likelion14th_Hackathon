import apiClient from "../api/apiClient";

export function getWeeklyRewards(year, month) {
  return apiClient.get("/api/v1/weekly-rewards", { params: { year, month } });
}

export function getWeeklyRewardDetail(weeklyRewardId) {
  return apiClient.get(`/api/v1/weekly-rewards/${weeklyRewardId}`);
}

const VIEWED_KEY = "weekly_reward_viewed_ids";
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

export function isWeeklyRewardViewed(userId, id) {
  return readIdSet(VIEWED_KEY, userId).has(id);
}

export function markWeeklyRewardViewed(userId, id) {
  addId(VIEWED_KEY, userId, id);
}

export function isWeeklyRewardNotified(userId, id) {
  return readIdSet(NOTIFIED_KEY, userId).has(id);
}

export function markWeeklyRewardNotified(userId, id) {
  addId(NOTIFIED_KEY, userId, id);
}
