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
