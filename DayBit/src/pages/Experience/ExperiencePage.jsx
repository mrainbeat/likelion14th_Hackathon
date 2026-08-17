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
  receiveInboxArrival,
  loadExperienceInbox,
  formatArrivalTime,
  fragmentToPieceItem,
  fragmentTopic,
  getReceivedFragments,
  saveReceivedFragment,
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
  const [credits, setCredits] = useState(null);

  useEffect(() => {
    let alive = true;
    apiClient
      .get("/api/me")
      .then((response) => {
        if (alive) setCredits(response.data.result?.credit ?? null);
      })
      .catch((error) => {
        console.error(
          "GET /api/me 실패:",
          error.response?.status,
          error.response?.data,
        );
      });
    return () => {
      alive = false;
    };
  }, []);

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

  useEffect(() => {
    let alive = true;
    loadExperienceInbox().then(({ arrivals, failed }) => {
      if (!alive) return;
      setMatches(arrivals);
      setMatchError(
        failed ? "경험조각을 불러오지 못했어요. 잠시 후 다시 시도해주세요." : "",
      );
    });
    return () => {
      alive = false;
    };
  }, []);

  const handleConfirmView = async () => {
    if (!confirmTarget) return;
    setIsReceiving(true);
    setReceiveError("");
    try {
      const response = await receiveInboxArrival(confirmTarget.arrivalId);
      const result = response.data.result;
      const fragment = {
        shareId: result?.shareId ?? confirmTarget.arrivalId,
        deliveryId: result?.deliveryId ?? null,
        anonymizedContent: result?.anonymizedContent ?? "",
        generalTopic: result?.generalTopic ?? confirmTarget.keyword,
        keywords: result?.keywords ?? [],
        receivedAt: new Date().toISOString(),
      };
      saveReceivedFragment(fragment);
      setReceivedFragments(getReceivedFragments());
      if (typeof result?.remainingCredit === "number") {
        setCredits(result.remainingCredit);
      }
      setMatches((prev) =>
        prev.filter((m) => m.arrivalId !== confirmTarget.arrivalId),
      );
      setConfirmTarget(null);
      navigate(`/experience/diary/${fragment.shareId}`, {
        state: { mode: "incoming", fragment },
      });
    } catch (error) {
      console.error(
        "POST /api/v1/experience-fragments/inbox/{arrivalId}/receive 실패:",
        error.response?.status,
        error.response?.data,
      );
      setReceiveError(
        error.response?.data?.code === "CREDIT409_1"
          ? "크레딧이 부족해요. 경험조각을 더 전달하면 다시 받아볼 수 있어요."
          : "경험조각을 받아오지 못했어요. 잠시 후 다시 시도해주세요.",
      );
      setConfirmTarget(null);
    } finally {
      setIsReceiving(false);
    }
  };

  const notificationItems = matches.map((m) => ({
    id: m.arrivalId,
    arrivalId: m.arrivalId,
    keyword: fragmentTopic(m) || "새로운 경험",
    message: `${fragmentTopic(m) || "새로운 경험"}과 관련된 경험조각이 도착했어요.`,
    relativeTime: formatArrivalTime(m.arrivedAt),
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
          <button
            type="button"
            onClick={() => navigate("/mypage")}
            className="size-[38px] shrink-0 cursor-pointer bg-transparent border-none p-0 transition-opacity active:opacity-60"
          >
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
                {nickname ? `${nickname}님은 ` : ""}"{credits ?? 0}번" 경험조각을
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
          onItemClick={(item) =>
            navigate(`/experience/diary/${item.id}`, {
              state: { mode: "incoming", fragment: item.fragment },
            })
          }
          onNavigateMore={() => navigate("/experience/gotten")}
        />

        <ExperiencePieceSection
          title="전달 대기중인 경험조각"
          subtitle="5일동안 익명화된 내용을 확인하고 전달을 취소할 수 있어요. 이후에는 다른 사람에게 전달될 수 있어요."
          items={pendingAll.slice(0, 2)}
          moreItems={pendingAll.slice(2)}
          onItemClick={(item) =>
            navigate(`/experience/diary/${item.id}`, {
              state: { mode: "pending", fragment: item.fragment },
            })
          }
        />

        <ExperiencePieceSection
          title="전달한 나의 경험조각"
          items={sentAll.slice(0, 2)}
          moreItems={sentAll.slice(2)}
          onItemClick={(item) =>
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
