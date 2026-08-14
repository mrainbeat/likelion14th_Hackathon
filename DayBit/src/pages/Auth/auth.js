import apiClient from "../../api/apiClient";

export function clearLocalSession() {
  try {
    localStorage.clear();
  } catch (error) {
    console.error("localStorage 정리 실패:", error);
  }

  try {
    sessionStorage.clear();
  } catch (error) {
    console.error("sessionStorage 정리 실패:", error);
  }
}

export async function logout() {
  try {
    await apiClient.post("/api/logout");
  } catch (error) {
    console.error(
      "POST /api/logout 실패:",
      error.response?.status,
      error.response?.data,
    );
  } finally {
    clearLocalSession();
  }
}
