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

export function getExperienceInbox() {
  return apiClient.get("/api/v1/experience-fragments/inbox");
}

export function receiveInboxArrival(arrivalId) {
  return apiClient.post(
    `/api/v1/experience-fragments/inbox/${arrivalId}/receive`,
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

export function getReceivedExperienceFragments() {
  return apiClient.get("/api/v1/experience-fragments/received");
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

function writeReceivedFragments(list) {
  try {
    localStorage.setItem(RECEIVED_KEY, JSON.stringify(list));
  } catch {
    return;
  }
}

export function saveReceivedFragment(fragment) {
  const list = getReceivedFragments().filter(
    (f) => f.shareId !== fragment.shareId,
  );
  list.unshift(fragment);
  writeReceivedFragments(list);
}

export function clearReceivedFragments() {
  try {
    localStorage.removeItem(RECEIVED_KEY);
  } catch {
    return;
  }
}

export function markReceivedFragmentFeedbackSubmitted(deliveryId) {
  const list = getReceivedFragments().map((fragment) =>
    fragment.deliveryId === deliveryId
      ? {
          ...fragment,
          feedbackSubmitted: true,
          feedbackSubmittedAt: new Date().toISOString(),
        }
      : fragment,
  );
  writeReceivedFragments(list);
}

export async function loadReceivedFragments() {
  try {
    const response = await getReceivedExperienceFragments();
    const result = response.data.result;
    const items = Array.isArray(result) ? result : [];
    writeReceivedFragments(items);
    return { fragments: items, failed: false };
  } catch (error) {
    console.error(
      "GET /api/v1/experience-fragments/received 실패:",
      error.response?.status,
      error.response?.data,
    );
    return { fragments: getReceivedFragments(), failed: true };
  }
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

export function formatArrivalTime(iso) {
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

const ONE_DAY_MS = 86400000;

export function isArrivalStale(iso) {
  if (!iso) return false;
  const at = new Date(iso).getTime();
  if (Number.isNaN(at)) return false;
  return Date.now() - at >= ONE_DAY_MS;
}

const ZERO_WIDTH_SPACE = String.fromCharCode(8203);
const LEADING_LABEL_PATTERN = new RegExp("^\\s*\\[[^\\]\\n]*\\]\\s*\\n?");

export function stripLeadingLabel(content) {
  return String(content ?? "")
    .split(ZERO_WIDTH_SPACE)
    .join("")
    .replace(LEADING_LABEL_PATTERN, "")
    .trim();
}

export function fragmentSnippet(content) {
  return stripLeadingLabel(content)
    .replace(/\s+/g, " ")
    .trim();
}

const LABEL_LINE_PATTERN = new RegExp("^\\[([^\\]\\n]+)\\]$", "gm");
const LABEL_SUFFIX = "에 작성한 내용";

export function formatAnonymizedContent(content) {
  return String(content ?? "")
    .split(ZERO_WIDTH_SPACE)
    .join("")
    .replace(LABEL_LINE_PATTERN, (full, label) =>
      label.endsWith(LABEL_SUFFIX) ? full : `[${label}${LABEL_SUFFIX}]`,
    );
}

const SINGLE_LABEL_LINE_PATTERN = new RegExp("^\\[([^\\]\\n]+)\\]$");

export function parseAnonymizedBlocks(content) {
  return formatAnonymizedContent(content)
    .split(/\n{2,}/)
    .map((block) => {
      const [first, ...rest] = block.split("\n");
      const head = (first ?? "").trim();
      const match = head.match(SINGLE_LABEL_LINE_PATTERN);
      if (match) {
        return { time: head, text: rest.join("\n").trim() };
      }
      return { time: "", text: block.trim() };
    })
    .filter((block) => block.time || block.text);
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
    snippet: fragmentSnippet(fragment.anonymizedContent),
    fragment,
  };
}

export function fragmentsToPieceItems(fragments, kind, sortKey) {
  return fragments
    .map((fragment) => ({
      fragment,
      sortedAt: new Date(sortKey(fragment)).getTime(),
    }))
    .sort((a, b) => b.sortedAt - a.sortedAt)
    .map(({ fragment }) => fragmentToPieceItem(fragment, kind));
}

export async function loadExperienceInbox() {
  try {
    const response = await getExperienceInbox();
    const result = response.data.result;
    return { arrivals: Array.isArray(result) ? result : [], failed: false };
  } catch (error) {
    console.error(
      "GET /api/v1/experience-fragments/inbox 실패:",
      error.response?.status,
      error.response?.data,
    );
    return { arrivals: [], failed: true };
  }
}
