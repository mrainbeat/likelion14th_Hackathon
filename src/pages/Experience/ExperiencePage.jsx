import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ExperienceNotificationBubble from "./components/ExperienceNotificationBubble";
import ExperiencePieceSection, {
  Collapsible,
  LIST_FADE_GRADIENT,
  LIST_FADE_HEIGHT,
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
  isArrivalStale,
  fragmentsToPieceItems,
  fragmentTopic,
  getReceivedFragments,
  loadReceivedFragments,
  saveReceivedFragment,
  getCachedMyFragments,
  saveCachedMyFragments,
} from "../../utils/experienceFragments";
import { fetchMe } from "../../utils/me";
import { useNickname } from "../MyPage/useNickname";

const NAVIGATE_THRESHOLD = 8;
const TOAST_DURATION_MS = 2500;

export default function ExperiencePage() {
  const navigate = useNavigate();
  const [fragments, setFragments] = useState(() => getCachedMyFragments());
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
    if (!receiveError) return;
    const timer = setTimeout(() => setReceiveError(""), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [receiveError]);

  useEffect(() => {
    let alive = true;
    fetchMe()
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
        const list = response.data.result ?? [];
        setFragments(list);
        saveCachedMyFragments(list);
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
        failed
          ? "경험조각을 불러오지 못했어요. 잠시 후 다시 시도해주세요."
          : "",
      );
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    loadReceivedFragments().then(({ fragments }) => {
      if (alive) setReceivedFragments(fragments);
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
          ? "나의 경험조각을 전달하면 받아볼 수 있어요!"
          : "경험조각을 받아오지 못했어요. 잠시 후 다시 시도해주세요.",
      );
      setConfirmTarget(null);
    } finally {
      setIsReceiving(false);
    }
  };

  const notificationItems = useMemo(
    () =>
      matches.map((m) => {
        const keyword = fragmentTopic(m) || "새로운 경험";
        return {
          id: m.arrivalId,
          arrivalId: m.arrivalId,
          keyword,
          message: `${keyword}과 관련된 경험조각이 도착했어요.`,
          relativeTime: formatArrivalTime(m.arrivedAt),
          stale: isArrivalStale(m.arrivedAt),
        };
      }),
    [matches],
  );

  const notificationsTotal = notificationItems.length;
  const useNavigateNotifications = notificationsTotal >= NAVIGATE_THRESHOLD;

  const handleNotificationsMoreClick = () =>
    setNotificationsExpanded((prev) => !prev);

  const nickname = useNickname();

  const receivedAll = useMemo(
    () =>
      fragmentsToPieceItems(receivedFragments, "received", (f) => f.receivedAt),
    [receivedFragments],
  );

  const { pendingAll, sentAll } = useMemo(() => {
    const pending = [];
    const sent = [];
    fragments.forEach((fragment) => {
      if (
        fragment.status === "REQUESTED" ||
        fragment.status === "REVIEW_REQUIRED"
      ) {
        pending.push(fragment);
      } else if (fragment.status === "APPROVED") {
        sent.push(fragment);
      }
    });
    return {
      pendingAll: fragmentsToPieceItems(pending, "pending", (f) => f.createdAt),
      sentAll: fragmentsToPieceItems(
        sent,
        "sent",
        (f) => f.approvedAt ?? f.createdAt,
      ),
    };
  }, [fragments]);

  return (
    <div className="relative flex h-full w-full select-none flex-col overflow-y-auto bg-[#f6f8fa] px-[16px] pb-[36px] pt-[16px] scrollbar-hide [overflow-anchor:none]">
      <div className="flex w-full flex-col items-start gap-[24px]">
        <div className="flex w-full flex-col items-start gap-[16px]">
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
            <div className="flex items-center justify-center gap-[10px]">
              <img
                src={logoImage}
                alt=""
                className="h-[28px] w-[22px] object-cover"
              />
              <p className="break-words text-[24px] font-bold text-black">
                경험조각 주고받기
              </p>
            </div>
            <p className="w-full break-words text-[14px] font-medium text-[#787E8C]">
              비슷한 경험을 한 사람의 익명 일기를 받고, <br />
              나의 익명 일기도 나눌 수 있어요.
            </p>
          </div>
        </div>

        <div className="relative w-full shrink-0 overflow-hidden rounded-[12px] bg-grey-0 p-[16px] shadow-[0_0_10px_0_rgba(77,80,91,0.05),0_0_30px_0_rgba(65,68,80,0.05)]">
          <div className="flex w-full flex-col items-start gap-[24px]">
            <div className="flex w-full flex-col items-start gap-[16px]">
              <div className="flex w-full flex-col items-start gap-[4px]">
                <p className="text-[20px] font-semibold leading-[normal] tracking-[-0.4px] text-grey-90">
                  경험조각 받아보기
                </p>
                <p className="w-full text-[14px] font-medium leading-[normal] tracking-[-0.28px] text-[#787E8C]">
                  {nickname ? `${nickname}님은 ` : ""}"{credits ?? 0}번"
                  경험조각을 받을 수 있어요
                </p>
              </div>

              {notificationItems.length > 0 && (
                <div className="flex w-full flex-col items-start gap-[16px]">
                  {notificationItems.slice(0, 2).map((n) => (
                    <ExperienceNotificationBubble
                      key={n.id}
                      {...n}
                      onConfirm={() => setConfirmTarget(n)}
                    />
                  ))}
                  {notificationItems.length > 2 && (
                    <Collapsible open={notificationsExpanded}>
                      <div className="flex w-full flex-col items-start gap-[16px]">
                        {notificationItems.slice(2).map((n) => (
                          <ExperienceNotificationBubble
                            key={n.id}
                            {...n}
                            onConfirm={() => setConfirmTarget(n)}
                          />
                        ))}
                      </div>
                    </Collapsible>
                  )}
                </div>
              )}

              {notificationItems.length > 2 && (
                <MoreButton
                  expanded={notificationsExpanded}
                  onClick={handleNotificationsMoreClick}
                  onNavigate={
                    useNavigateNotifications
                      ? () => navigate("/experience/incoming")
                      : undefined
                  }
                />
              )}
            </div>

            {notificationItems.length === 0 &&
              (matchError ? (
                <p className="w-full text-[14px] font-medium leading-[1.5] tracking-[-0.28px] text-[#787E8C]">
                  {matchError}
                </p>
              ) : (
                <div className="flex w-full flex-col items-center justify-center">
                  <div className="flex shrink-0 items-center justify-center rounded-[32px] bg-[#EFF1F6] p-[10px]">
                    <p className="whitespace-nowrap text-[14px] font-medium leading-[normal] tracking-[-0.28px] text-grey-80">
                      경험조각을 찾는중..
                    </p>
                  </div>
                </div>
              ))}
          </div>

          {notificationItems.length > 2 && !notificationsExpanded && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0"
              style={{
                height: LIST_FADE_HEIGHT,
                background: LIST_FADE_GRADIENT,
              }}
            />
          )}
        </div>

        <ExperiencePieceSection
          title="받은 경험조각"
          emptyText="아직 받은 경험 조각이 없어요 -_-"
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
          subtitle={`5일동안 익명화된 내용을 확인하고 전달을 취소할 수 있어요.
이후에는 다른 사람에게 전달될 수 있어요.`}
          hideTag
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
          emptyText="나의 경험조각을 전달할 사람을 찾고있어요:)"
          hideTag
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
        <div className="pointer-events-none fixed inset-x-0 top-[24px] z-50 flex justify-center px-[16px]">
          <p className="animate-fade-in max-w-full rounded-[100px] bg-grey-90/90 px-[20px] py-[10px] text-center text-[14px] font-medium tracking-[-0.28px] text-grey-0 shadow-[0_4px_16px_0_rgba(65,68,80,0.16)]">
            {receiveError}
          </p>
        </div>
      )}

      {isReceiving && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-grey-90/10" />
      )}
    </div>
  );
}
