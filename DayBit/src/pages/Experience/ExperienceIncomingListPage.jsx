import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ExperienceNotificationBubble from "./components/ExperienceNotificationBubble";
import IncomingConfirmModal from "./components/IncomingConfirmModal";
import backIcon from "../../assets/icons/back.svg";
import profileIcon from "../../assets/icons/profile.svg";
import logoImage from "../../assets/logos/logo-symbol.svg";
import {
  getMyExperienceFragments,
  receiveExperienceMatch,
  findExperienceMatches,
  fragmentTopic,
  saveReceivedFragment,
} from "../../utils/experienceFragments";

export default function ExperienceIncomingListPage() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [isReceiving, setIsReceiving] = useState(false);
  const [receiveError, setReceiveError] = useState("");

  useEffect(() => {
    let alive = true;
    getMyExperienceFragments()
      .then((response) => {
        const fragments = response.data.result ?? [];
        if (!alive || fragments.length === 0) return [];
        return findExperienceMatches(fragments, 10);
      })
      .then((found) => {
        if (alive && found) setMatches(found);
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

  const notificationItems = matches.map((m) => ({
    id: m.shareId,
    shareId: m.shareId,
    keyword: fragmentTopic(m) || "새로운 경험",
    message: `"${fragmentTopic(m) || "새로운 경험"}"와 관련된 경험 조각이 도착했어요.`,
    relativeTime: "지금 확인 가능",
    isToday: true,
  }));

  const handleConfirmView = async () => {
    if (!confirmTarget) return;
    setIsReceiving(true);
    setReceiveError("");
    try {
      const response = await receiveExperienceMatch(confirmTarget.shareId);
      const result = response.data.result;
      const fragment = {
        shareId: confirmTarget.shareId,
        anonymizedContent: result?.anonymizedContent ?? "",
        generalTopic: result?.generalTopic ?? confirmTarget.keyword,
        keywords: result?.keywords ?? [],
        receivedAt: new Date().toISOString(),
      };
      saveReceivedFragment(fragment);
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

  return (
    <div className="relative flex h-full w-full select-none flex-col overflow-y-auto bg-[#f6f8fa] px-[16px] py-[16px] scrollbar-hide">
      <div className="flex w-full flex-col items-start gap-[16px] pb-[16px]">
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

        <div className="w-full shrink-0 rounded-[12px] bg-grey-0 px-[16px] py-[14px] shadow-[0_0_10px_0_rgba(77,80,91,0.05),0_0_30px_0_rgba(65,68,80,0.05)]">
          <div className="flex w-full flex-col items-start gap-[16px]">
            <div className="flex w-full flex-col items-start gap-[2px]">
              <div className="flex w-full items-center justify-between">
                <p className="text-[20px] font-semibold tracking-[-0.4px] text-grey-90">
                  경험조각 받아보기
                </p>
                <span className="text-[14px] font-semibold text-grey-70">
                  최신순
                </span>
              </div>
            </div>
            <div className="flex w-full flex-col items-start gap-[16px]">
              {notificationItems.map((n) => (
                <ExperienceNotificationBubble
                  key={n.id}
                  {...n}
                  onConfirm={() => setConfirmTarget(n)}
                />
              ))}
            </div>
          </div>
        </div>
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
