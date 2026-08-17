import apiClient, { refreshCsrfToken } from "../../api/apiClient";
import { clearDraft } from "../../utils/diaryDraft";
import { clearCachedMonthItems } from "../../utils/monthDiariesCache";
import { clearCachedWeeklyRewards } from "../../utils/weeklyRewardsCache";
import { clearCachedNotifications } from "../../utils/notificationsCache";

export function login(email, password) {
  return apiClient.post("/api/auth/login", { email, password });
}

export function signup(email, password) {
  return apiClient.post("/api/auth/signup", { email, password });
}

const REVIEW_PASSWORD = "12341234";
const REVIEW_SEQ_KEY = "review_account_seq";
const REVIEW_SEQ_START = 6;
const REVIEW_MAX_TRIES = 50;

export async function signupNextReviewAccount() {
  const saved = Number(localStorage.getItem(REVIEW_SEQ_KEY));
  let seq =
    Number.isFinite(saved) && saved >= REVIEW_SEQ_START
      ? saved
      : REVIEW_SEQ_START;

  for (let attempt = 0; attempt < REVIEW_MAX_TRIES; attempt += 1, seq += 1) {
    const email = `test${seq}@gmail.com`;
    try {
      await signup(email, REVIEW_PASSWORD);
      localStorage.setItem(REVIEW_SEQ_KEY, String(seq + 1));
      return email;
    } catch (error) {
      const status = error.response?.status;
      if (status === 400 || status === 409) continue;
      throw error;
    }
  }

  throw new Error("사용 가능한 심사용 계정 번호를 찾지 못했어요.");
}

export async function resolveDestinationAfterAuth(authUser) {
  let user = authUser;
  if (!user) {
    const response = await apiClient.get("/api/me");
    user = response.data.result;
  }

  try {
    await refreshCsrfToken();
  } catch (csrfError) {
    console.error("GET /api/auth/csrf 실패:", csrfError);
  }

  return user?.onboardingCompleted ? "/home" : "/onboarding";
}

export function clearLocalSession() {
  try {
    sessionStorage.clear();
  } catch (error) {
    console.error("sessionStorage 정리 실패:", error);
  }
  clearDraft();
  clearCachedMonthItems();
  clearCachedWeeklyRewards();
  clearCachedNotifications();
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
