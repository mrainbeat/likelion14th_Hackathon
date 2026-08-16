import apiClient from "../api/apiClient";

export function createExperienceFragment(diaryId) {
  return apiClient.post(`/api/v1/experience-fragments/diaries/${diaryId}`);
}

export function getMyExperienceFragments() {
  return apiClient.get("/api/v1/experience-fragments/mine");
}

export function approveExperienceFragment(shareId) {
  return apiClient.post(`/api/v1/experience-fragments/${shareId}/approve`);
}

export function rejectExperienceFragment(shareId) {
  return apiClient.post(`/api/v1/experience-fragments/${shareId}/reject`);
}

export function findExperienceMatch(diaryId) {
  return apiClient.post("/api/v1/experience-fragments/matches", { diaryId });
}

export function receiveExperienceMatch(shareId) {
  return apiClient.post(
    `/api/v1/experience-fragments/matches/${shareId}/receive`,
  );
}

export function getExperienceFragmentReview(shareId) {
  return apiClient.get(`/api/v1/experience-fragments/${shareId}/review`);
}

export function sendDeliveryFeedback(deliveryId, content) {
  return apiClient.post(
    `/api/v1/experience-fragments/deliveries/${deliveryId}/feedback`,
    { content },
  );
}

export function getExperienceFragmentFeedbacks(shareId) {
  return apiClient.get(`/api/v1/experience-fragments/${shareId}/feedbacks`);
}

const AUTO_APPROVE_DAYS = 5;

export function getAutoApproveAt(reviewAvailableAt) {
  if (!reviewAvailableAt) return null;
  const base = new Date(reviewAvailableAt);
  if (Number.isNaN(base.getTime())) return null;
  base.setDate(base.getDate() + AUTO_APPROVE_DAYS);
  return base;
}

export function describeAutoApprove(reviewAvailableAt) {
  const at = getAutoApproveAt(reviewAvailableAt);
  if (!at) return "";
  const diffMs = at.getTime() - Date.now();
  if (diffMs <= 0) return "곧 전달";
  const days = Math.ceil(diffMs / 86400000);
  if (days >= 1) return `${days}일남음`;
  const hours = Math.max(1, Math.ceil(diffMs / 3600000));
  return `${hours}시간남음`;
}

const RECEIVED_KEY = "received_experience_fragments";

export function getReceivedFragments() {
  try {
    const raw = localStorage.getItem(RECEIVED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveReceivedFragment(fragment) {
  const list = getReceivedFragments().filter(
    (f) => f.shareId !== fragment.shareId,
  );
  list.unshift(fragment);
  localStorage.setItem(RECEIVED_KEY, JSON.stringify(list));
}

export function removeReceivedFragment(shareId) {
  const list = getReceivedFragments().filter((f) => f.shareId !== shareId);
  localStorage.setItem(RECEIVED_KEY, JSON.stringify(list));
}

export function formatFragmentDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export function formatFragmentTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const hours = d.getHours();
  const period = hours < 12 ? "AM" : "PM";
  const h12 = hours % 12 === 0 ? 12 : hours % 12;
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${period} ${h12}:${minutes}`;
}

export function fragmentTopic(fragment) {
  return fragment.generalTopic || fragment.keywords?.[0] || "";
}

export function fragmentToPieceItem(fragment, kind) {
  const dateSource =
    kind === "sent"
      ? (fragment.approvedAt ?? fragment.createdAt)
      : kind === "received"
        ? (fragment.receivedAt ?? fragment.createdAt)
        : fragment.createdAt;

  let dateLabel;
  if (kind === "sent") {
    dateLabel = `${formatFragmentDate(dateSource)}에 전달한 조각`;
  } else if (kind === "received") {
    dateLabel = `${formatFragmentDate(dateSource)}에 받은 조각`;
  } else if (fragment.status === "REQUESTED") {
    dateLabel = `${formatFragmentDate(dateSource)} 익명화 처리 중`;
  } else {
    const auto = describeAutoApprove(
      fragment.reviewAvailableAt ?? fragment.createdAt,
    );
    dateLabel = auto
      ? `${formatFragmentDate(dateSource)}에 익명화 됨 • ${auto}`
      : `${formatFragmentDate(dateSource)}에 익명화 됨`;
  }

  return {
    id: fragment.shareId,
    shareId: fragment.shareId,
    diaryId: fragment.diaryId,
    status: fragment.status,
    dateLabel,
    tag: fragmentTopic(fragment),
    time: formatFragmentTime(dateSource),
    snippet: fragment.anonymizedContent || "",
    fragment,
  };
}

export async function findExperienceMatches(fragments, cap = 5) {
  const diaryIds = [...new Set(fragments.map((f) => f.diaryId))].slice(
    0,
    cap,
  );
  const results = await Promise.allSettled(
    diaryIds.map((diaryId) => findExperienceMatch(diaryId)),
  );
  const matches = [];
  results.forEach((r) => {
    if (r.status === "fulfilled") {
      const match = r.value.data.result;
      if (match) matches.push(match);
    } else {
      console.error(
        "POST /api/v1/experience-fragments/matches 실패:",
        r.reason?.response?.status,
        r.reason?.response?.data,
      );
    }
  });
  return matches;
}
