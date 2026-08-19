import apiClient from "../api/apiClient";

const DRAFT_ID_KEY = "diary_draft_id";

export function getStoredDraftId() {
  try {
    const raw = localStorage.getItem(DRAFT_ID_KEY);
    if (!raw) return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveDraftId(draftId) {
  if (draftId == null) return;
  try {
    localStorage.setItem(DRAFT_ID_KEY, String(draftId));
  } catch {
    return;
  }
}

export function clearDraftId() {
  try {
    localStorage.removeItem(DRAFT_ID_KEY);
  } catch {
    return;
  }
}

export async function putServerDraft(
  plainText,
  personalizationUsesDiaryContent = false,
  draftId = getStoredDraftId(),
) {
  const payload = {
    content: plainText,
    personalizationUsesDiaryContent,
  };
  if (draftId != null) payload.draftId = draftId;

  const response = await apiClient.put("/api/v1/diaries/draft", payload);
  const result = response.data.result ?? null;
  if (result?.draftId != null) saveDraftId(result.draftId);
  return result;
}

export async function getServerDraft() {
  const response = await apiClient.get("/api/v1/diaries/draft");
  const result = response.data.result ?? null;
  if (result?.draftId != null) saveDraftId(result.draftId);
  return result;
}

export function sendDraftHeartbeat(draftId) {
  if (draftId == null) return Promise.resolve(null);
  return apiClient.patch(
    `/api/v1/diaries/draft/${draftId}/editing/heartbeat`,
  );
}

export function stopDraftEditing(draftId) {
  if (draftId == null) return Promise.resolve(null);
  return apiClient.patch(`/api/v1/diaries/draft/${draftId}/editing/stop`);
}

export async function getPendingAutoCompletionNotice() {
  const response = await apiClient.get(
    "/api/v1/diaries/auto-completion-notices/pending",
  );
  return response.data.result ?? null;
}

export function markAutoCompletionNoticeViewed(noticeId) {
  return apiClient.patch(
    `/api/v1/diaries/auto-completion-notices/${noticeId}/view`,
  );
}

export function createDiaryComment(diaryId, content) {
  return apiClient.post(`/api/v1/diaries/${diaryId}/comments`, { content });
}

export async function getDiaryComments(diaryId) {
  const response = await apiClient.get(`/api/v1/diaries/${diaryId}/comments`);
  const result = response.data.result;
  return Array.isArray(result) ? result : [];
}
