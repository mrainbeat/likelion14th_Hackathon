import apiClient, { refreshCsrfToken } from "../../api/apiClient";
import { clearDraft, clearQuestions } from "../../utils/diaryDraft";
import { clearDraftId } from "../../utils/diaryDraftApi";
import { clearCachedMonthItems } from "../../utils/monthDiariesCache";
import { clearCachedWeeklyRewards } from "../../utils/weeklyRewardsCache";
import { clearCachedWeeklyRewardDetails } from "../../utils/weeklyRewards";
import { clearCachedNotifications } from "../../utils/notificationsCache";
import {
  clearReceivedFragments,
  clearCachedMyFragments,
} from "../../utils/experienceFragments";
import { resetHomeSessionFlags } from "../../utils/homeSessionFlags";
import { clearCachedNickname } from "../../utils/nickname";
import { clearWrittenToday } from "../../utils/todayDiary";

export async function login(email, password) {
  clearLocalSession();
  const response = await apiClient.post("/api/auth/login", { email, password });
  clearLocalSession();
  return response;
}

export function signup(email, password) {
  return apiClient.post("/api/auth/signup", { email, password });
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
  clearQuestions();
  clearDraftId();
  clearCachedMonthItems();
  clearCachedWeeklyRewards();
  clearCachedWeeklyRewardDetails();
  clearCachedMyFragments();
  clearCachedNotifications();
  clearCachedNickname();
  clearWrittenToday();
  resetHomeSessionFlags();
  clearReceivedFragments();
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
