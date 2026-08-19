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

const DETAIL_CACHE_PREFIX = "weekly_reward_detail_";

export function getCachedWeeklyRewardDetail(weeklyRewardId) {
  try {
    const raw = localStorage.getItem(`${DETAIL_CACHE_PREFIX}${weeklyRewardId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveCachedWeeklyRewardDetail(weeklyRewardId, reward) {
  try {
    localStorage.setItem(
      `${DETAIL_CACHE_PREFIX}${weeklyRewardId}`,
      JSON.stringify(reward),
    );
  } catch {
    return;
  }
}

export function clearCachedWeeklyRewardDetails() {
  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(DETAIL_CACHE_PREFIX))
      .forEach((key) => localStorage.removeItem(key));
  } catch {
    return;
  }
}
