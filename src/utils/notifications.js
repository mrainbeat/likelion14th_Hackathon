import apiClient from "../api/apiClient";

export function getNotifications() {
  return apiClient.get("/api/v1/notifications");
}

export function getUnreadNotificationCount() {
  return apiClient.get("/api/v1/notifications/unread-count");
}

export function markNotificationRead(notificationId) {
  return apiClient.patch(`/api/v1/notifications/${notificationId}/read`);
}

export function markAllNotificationsRead() {
  return apiClient.patch("/api/v1/notifications/read-all");
}

const TITLE_BY_TYPE = {
  DIARY_REMINDER: "일기 작성 알림",
  EXPERIENCE_FRAGMENT_ARRIVED: "다른사람의 경험조각 도착",
  EXPERIENCE_FRAGMENT_FEEDBACK: "내 경험조각에 대한 반응 도착",
  WEEKLY_REWARD_COMPLETED: "주간 이미지 도착",
};

export function notificationTitle(type) {
  return TITLE_BY_TYPE[type] ?? "알림";
}

export function notificationRoute({ type, referenceId }) {
  switch (type) {
    case "DIARY_REMINDER":
      return "/diary";
    case "EXPERIENCE_FRAGMENT_ARRIVED":
      return "/experience/incoming";
    case "EXPERIENCE_FRAGMENT_FEEDBACK":
      return referenceId ? `/experience/sent/${referenceId}` : "/experience";
    case "WEEKLY_REWARD_COMPLETED":
      return referenceId ? `/home/weekly-rewards/${referenceId}` : null;
    default:
      return null;
  }
}

export function formatNotificationTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const diffMs = Date.now() - d.getTime();
  if (diffMs < 60000) return "방금 전";
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
}

export async function loadNotifications() {
  try {
    const response = await getNotifications();
    const result = response.data.result;
    return { items: Array.isArray(result) ? result : [], failed: false };
  } catch (error) {
    console.error(
      "GET /api/v1/notifications 실패:",
      error.response?.status,
      error.response?.data,
    );
    return { items: [], failed: true };
  }
}

export async function loadUnreadNotificationCount() {
  try {
    const response = await getUnreadNotificationCount();
    return response.data.result?.unreadCount ?? 0;
  } catch (error) {
    console.error(
      "GET /api/v1/notifications/unread-count 실패:",
      error.response?.status,
      error.response?.data,
    );
    return 0;
  }
}
