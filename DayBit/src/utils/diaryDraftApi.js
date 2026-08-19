import apiClient from "../api/apiClient";

export function putServerDraft(plainText) {
  return apiClient.put("/api/v1/diaries/draft", {
    content: plainText,
    personalizationUsesDiaryContent: false,
  });
}

export async function getServerDraft() {
  const response = await apiClient.get("/api/v1/diaries/draft");
  return response.data.result ?? null;
}
