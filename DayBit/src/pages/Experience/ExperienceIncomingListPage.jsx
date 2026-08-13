import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ExperienceNotificationBubble from "./components/ExperienceNotificationBubble";
import IncomingConfirmModal from "./components/IncomingConfirmModal";
import backIcon from "../../assets/icons/back.svg";
import profileIcon from "../../assets/icons/profile.svg";
import logoImage from "../../assets/logos/logo-symbol.png";

const MOCK_ALL_NOTIFICATIONS = [
  {
    id: 1,
    keyword: "다이어트",
    message: `"다이어트"와 관련된 경험 조각이 도착했어요.`,
    relativeTime: "12분 전",
    isToday: true,
  },
  {
    id: 2,
    keyword: "다이어트",
    message: `"다이어트"와 관련된 경험 조각이 도착했어요.`,
    relativeTime: "21시간 전",
    isToday: true,
  },
  {
    id: 3,
    keyword: "다이어트",
    message: `"다이어트"와 관련된 경험 조각이 도착했어요.`,
    relativeTime: "1일 전",
    isToday: false,
  },
  {
    id: 4,
    keyword: "다이어트",
    message: `"다이어트"와 관련된 경험 조각이 도착했어요.`,
    relativeTime: "3일 전",
    isToday: false,
  },
  {
    id: 5,
    keyword: "다이어트",
    message: `"다이어트"와 관련된 경험 조각이 도착했어요.`,
    relativeTime: "3일 전",
    isToday: false,
  },
  {
    id: 6,
    keyword: "다이어트",
    message: `"다이어트"와 관련된 경험 조각이 도착했어요.`,
    relativeTime: "5일 전",
    isToday: false,
  },
  {
    id: 7,
    keyword: "다이어트",
    message: `"다이어트"와 관련된 경험 조각이 도착했어요.`,
    relativeTime: "5일 전",
    isToday: false,
  },
];

export default function ExperienceIncomingListPage() {
  const navigate = useNavigate();
  const [confirmTarget, setConfirmTarget] = useState(null);

  const handleConfirmView = () => {
    if (!confirmTarget) return;
    navigate(`/experience/diary/${confirmTarget.id}`, {
      state: { mode: "incoming", keyword: confirmTarget.keyword },
    });
    setConfirmTarget(null);
  };

  return (
    <div className="relative flex h-full w-full select-none flex-col overflow-y-auto bg-[#f6f8fa] px-[20px] py-[16px] scrollbar-hide">
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
              <p className="text-[14px] font-medium tracking-[-0.28px] text-grey-60">
                한재이님은 "3번" 경험조각을 받을 수 있어요
              </p>
            </div>
            <div className="flex w-full flex-col items-start gap-[16px]">
              {MOCK_ALL_NOTIFICATIONS.map((n) => (
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
          onDecline={() => setConfirmTarget(null)}
          onConfirm={handleConfirmView}
        />
      )}
    </div>
  );
}
