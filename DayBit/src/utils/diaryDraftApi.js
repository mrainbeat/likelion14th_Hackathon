import apiClient from "../api/apiClient";

export function putServerDraft(plainText, personalizationUsesDiaryContent = false) {
  return apiClient.put("/api/v1/diaries/draft", {
    content: plainText,
    personalizationUsesDiaryContent,
  });
}

export async function getServerDraft() {
  const response = await apiClient.get("/api/v1/diaries/draft");
  return response.data.result ?? null;
}

export async function getPendingAutoCompletionNotices() {
  const response = await apiClient.get(
    "/api/v1/diaries/auto-completion-notices/pending",
  );
  const result = response.data.result;
  if (Array.isArray(result)) return result;
  return result?.notices ?? [];
}

export function markAutoCompletionNoticeViewed(noticeId) {
  return apiClient.patch(
    `/api/v1/diaries/auto-completion-notices/${noticeId}/view`,
  );
}
