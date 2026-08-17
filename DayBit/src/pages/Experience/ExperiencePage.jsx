import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../api/apiClient";
import ExperienceNotificationBubble from "./components/ExperienceNotificationBubble";
import ExperiencePieceSection, {
  MoreButton,
} from "./components/ExperiencePieceSection";
import IncomingConfirmModal from "./components/IncomingConfirmModal";
import backIcon from "../../assets/icons/back.svg";
import profileIcon from "../../assets/icons/profile.svg";
import logoImage from "../../assets/logos/logo-symbol.svg";
import {
  getMyExperienceFragments,
  receiveExperienceMatch,
  findExperienceMatches,
  fragmentToPieceItem,
  fragmentTopic,
  getReceivedFragments,
  saveReceivedFragment,
  removeReceivedFragment,
} from "../../utils/experienceFragments";

const NAVIGATE_THRESHOLD = 8;

export default function ExperiencePage() {
  const navigate = useNavigate();
  const [fragments, setFragments] = useState([]);
  const [receivedFragments, setReceivedFragments] = useState(() =>
    getReceivedFragments(),
  );
  const [matches, setMatches] = useState([]);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [notificationsExpanded, setNotificationsExpanded] = useState(false);
  const [isReceiving, setIsReceiving] = useState(false);
  const [receiveError, setReceiveError] = useState("");
  const [matchError, setMatchError] = useState("");

  useEffect(() => {
    let alive = true;
    getMyExperienceFragments()
      .then((response) => {
        if (!alive) return;
        setFragments(response.data.result ?? []);
      })
      .catch((error) => {
        console.error(
          "GET /api/v1/experience-fragments/mine 실패:",
          error.response?.status,
          error.response?.data,
        );
      });
    return () => {
      alive = false;
    };
  }, []);

  // 공유한 일기뿐 아니라 최근 일기까지 매칭 기준으로 넣어 후보를 넓힌다
  useEffect(() => {
    if (fragments.length === 0) return;
    let alive = true;

    const run = async () => {
      const diaryIds = fragments.map((f) => f.diaryId);

      try {
        const now = new Date();
        const response = await apiClient.get("/api/v1/diaries", {
          params: { year: now.getFullYear(), month: now.getMonth() + 1 },
        });
        const result = response.data.result;
        const items = Array.isArray(result) ? result : (result?.items ?? []);
        items.forEach((item) => {
          if (item.diaryId) diaryIds.push(item.diaryId);
        });
      } catch (error) {
        console.error(
          "GET /api/v1/diaries(매칭 후보) 실패:",
          error.response?.status,
          error.response?.data,
        );
      }
      if (!alive) return;

      const { matches: found, errorCount } = await findExperienceMatches(
        diaryIds,
        10,
      );
      if (!alive) return;

      setMatches(found);
      setMatchError(
        errorCount > 0 && found.length === 0
          ? "경험조각을 찾지 못했어요. 잠시 후 다시 시도해주세요."
          : "",
      );
    };

    run();
    return () => {
      alive = false;
    };
  }, [fragments]);

  const handleConfirmView = async () => {
    if (!confirmTarget) return;
    setIsReceiving(true);
    setReceiveError("");
    try {
      const response = await receiveExperienceMatch(confirmTarget.shareId);
      const result = response.data.result;
      const fragment = {
        shareId: confirmTarget.shareId,
        deliveryId: result?.deliveryId ?? null,
        anonymizedContent: result?.anonymizedContent ?? "",
        generalTopic: result?.generalTopic ?? confirmTarget.keyword,
        keywords: result?.keywords ?? [],
        receivedAt: new Date().toISOString(),
      };
      saveReceivedFragment(fragment);
      setReceivedFragments(getReceivedFragments());
      setMatches((prev) =>
        prev.filter((m) => m.shareId !== confirmTarget.shareId),
      );
      setConfirmTarget(null);
      navigate(`/experience/diary/${fragment.shareId}`, {
        state: { mode: "incoming", fragment },
      });
    } catch (error) {
      console.error(
        "POST /api/v1/experience-fragments/matches/{shareId}/receive 실패:",
        error.response?.status,
        error.response?.data,
      );
      setReceiveError("경험조각을 받아오지 못했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsReceiving(false);
    }
  };

  const notificationItems = matches.map((m) => ({
    id: m.shareId,
    shareId: m.shareId,
    keyword: fragmentTopic(m) || "새로운 경험",
    message: `"${fragmentTopic(m) || "새로운 경험"}"와 관련된 경험 조각이 도착했어요.`,
    relativeTime: "지금 확인 가능",
    isToday: true,
  }));

  const notificationsTotal = notificationItems.length;
  const useNavigateNotifications = notificationsTotal >= NAVIGATE_THRESHOLD;
  const visibleNotifications = notificationsExpanded
    ? notificationItems
    : notificationItems.slice(0, 2);

  const handleNotificationsMoreClick = () => {
    if (useNavigateNotifications) {
      navigate("/experience/incoming");
      return;
    }
    setNotificationsExpanded((prev) => !prev);
  };

  const approvedCount = fragments.filter(
    (f) => f.status === "APPROVED",
  ).length;
  const credits = Math.max(
    0,
    Math.floor(approvedCount / 3) - receivedFragments.length,
  );
  const nickname = localStorage.getItem("nickname") || "";

  const receivedAll = receivedFragments
    .slice()
    .sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt))
    .map((f) => fragmentToPieceItem(f, "received"));

  const pendingAll = fragments
    .filter((f) => f.status === "REQUESTED" || f.status === "REVIEW_REQUIRED")
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((f) => fragmentToPieceItem(f, "pending"));

  const sentAll = fragments
    .filter((f) => f.status === "APPROVED")
    .sort(
      (a, b) =>
        new Date(b.approvedAt ?? b.createdAt) -
        new Date(a.approvedAt ?? a.createdAt),
    )
    .map((f) => fragmentToPieceItem(f, "sent"));

  const handleDeleteReceived = (item) => {
    removeReceivedFragment(item.id);
    setReceivedFragments(getReceivedFragments());
  };

  return (
    <div className="relative flex h-full w-full select-none flex-col overflow-y-auto bg-[#f6f8fa] px-[16px] py-[16px] scrollbar-hide">
      <div className="flex w-full flex-col items-start gap-[24px] pb-[16px]">
        <div className="flex w-full items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="size-[32px] shrink-0 cursor-pointer"
          >
            <img
              src={backIcon}
              alt="뒤로가기"
              className="h-full w-full object-contain"
            />
          </button>
          <button className="size-[38px] shrink-0 cursor-pointer bg-transparent border-none p-0">
            <img
              src={profileIcon}
              alt="프로필"
              className="h-full w-full object-contain [filter:drop-shadow(0_0_9.938px_rgba(65,68,80,0.16))]"
            />
          </button>
        </div>

        <div className="flex w-full flex-col items-start gap-[4px]">
          <div className="flex items-center gap-[10px]">
            <img
              src={logoImage}
              alt=""
              className="h-[28px] w-[22px] object-cover"
            />
            <p className="text-[24px] font-bold tracking-[-0.48px] text-grey-90">
              경험조각 주고받기
            </p>
          </div>
          <div className="text-[14px] font-medium tracking-[-0.28px] text-grey-60">
            <p className="mb-0">비슷한 경험을 한 사람의 익명 일기를 받고, </p>
            <p>나의 익명 일기도 나눌 수 있어요.</p>
          </div>
        </div>

        <div className="w-full shrink-0 rounded-[12px] bg-grey-0 px-[16px] py-[14px] shadow-[0_0_10px_0_rgba(77,80,91,0.05),0_0_30px_0_rgba(65,68,80,0.05)]">
          <div className="flex w-full flex-col items-start gap-[16px]">
            <div className="flex w-full flex-col items-start gap-[2px]">
              <p className="text-[20px] font-semibold tracking-[-0.4px] text-grey-90">
                경험조각 받아보기
              </p>
              <p className="text-[14px] font-medium tracking-[-0.28px] text-grey-60">
                {nickname ? `${nickname}님은 ` : ""}"{credits}번" 경험조각을
                받을 수 있어요
              </p>
            </div>

            {visibleNotifications.length > 0 ? (
              <div className="flex w-full flex-col items-start gap-[12px]">
                {visibleNotifications.map((n) => (
                  <ExperienceNotificationBubble
                    key={n.id}
                    {...n}
                    onConfirm={() => setConfirmTarget(n)}
                  />
                ))}
              </div>
            ) : (
              <p className="w-full text-[14px] font-medium leading-[1.5] tracking-[-0.28px] text-grey-60">
                {matchError ||
                  "아직 나와 비슷한 경험조각이 도착하지 않았어요. 새로운 일기를 쓰면 다시 찾아볼게요."}
              </p>
            )}

            {notificationItems.length > 2 && (
              <MoreButton
                expanded={
                  useNavigateNotifications ? false : notificationsExpanded
                }
                onClick={handleNotificationsMoreClick}
              />
            )}
          </div>
        </div>

        <ExperiencePieceSection
          title="받은 경험조각"
          items={receivedAll.slice(0, 2)}
          moreItems={receivedAll.slice(2)}
          kebabMode="options"
          onItemClick={(item) =>
            navigate(`/experience/diary/${item.id}`, {
              state: { mode: "incoming", fragment: item.fragment },
            })
          }
          onHideItem={handleDeleteReceived}
          onDeleteItem={handleDeleteReceived}
          onNavigateMore={() => navigate("/experience/gotten")}
        />

        <ExperiencePieceSection
          title="전달 대기중인 경험조각"
          subtitle="5일동안 익명화된 내용을 확인하고 전달을 취소할 수 있어요. 이후에는 다른 사람에게 전달될 수 있어요."
          items={pendingAll.slice(0, 2)}
          moreItems={pendingAll.slice(2)}
          kebabMode="link"
          onItemKebabClick={(item) =>
            navigate(`/experience/diary/${item.id}`, {
              state: { mode: "pending", fragment: item.fragment },
            })
          }
        />

        <ExperiencePieceSection
          title="전달한 나의 경험조각"
          items={sentAll.slice(0, 2)}
          moreItems={sentAll.slice(2)}
          kebabMode="link"
          onItemKebabClick={(item) =>
            navigate(`/experience/sent/${item.id}`, {
              state: { fragment: item.fragment },
            })
          }
          onNavigateMore={() => navigate("/experience/sent")}
        />
      </div>

      {confirmTarget && (
        <IncomingConfirmModal
          keyword={confirmTarget.keyword}
          onDecline={() => {
            setConfirmTarget(null);
            setReceiveError("");
          }}
          onConfirm={handleConfirmView}
        />
      )}

      {receiveError && !confirmTarget && (
        <div className="absolute inset-x-[16px] bottom-[16px] z-50 rounded-[12px] bg-grey-90/90 px-[16px] py-[12px] text-center text-[14px] font-medium text-grey-0">
          {receiveError}
        </div>
      )}

      {isReceiving && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-grey-90/10" />
      )}
    </div>
  );
}
