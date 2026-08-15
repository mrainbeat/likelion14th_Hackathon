import apiClient, { refreshCsrfToken } from "../../api/apiClient";

export function login(email, password) {
  return apiClient.post("/api/auth/login", { email, password });
}

export function signup(email, password) {
  return apiClient.post("/api/auth/signup", { email, password });
}

export async function resolveDestinationAfterAuth() {
  const response = await apiClient.get("/api/me");
  const user = response.data.result;

  try {
    await refreshCsrfToken();
  } catch (csrfError) {
    console.error("GET /api/auth/csrf 실패:", csrfError);
  }

  return user.onboardingCompleted ? "/home" : "/onboarding";
}

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
