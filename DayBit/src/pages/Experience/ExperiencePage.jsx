import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ExperienceNotificationBubble from "./components/ExperienceNotificationBubble";
import ExperiencePieceSection, {
  MoreButton,
} from "./components/ExperiencePieceSection";
import IncomingConfirmModal from "./components/IncomingConfirmModal";
import backIcon from "../../assets/icons/back.svg";
import profileIcon from "../../assets/icons/profile.svg";
import logoImage from "../../assets/logos/logo-symbol.svg";
const NAVIGATE_THRESHOLD = 8;

const MOCK_NOTIFICATIONS = [
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
];

const MOCK_NOTIFICATIONS_MORE = [
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

const MOCK_RECEIVED = [
  {
    id: 1,
    dateLabel: "9월 1일에 받은 조각",
    tag: "알바",
    time: "PM 1:00",
    snippet: "산책하면서 공원에서 자연을 느꼈다.",
  },
  {
    id: 2,
    dateLabel: "8월 14일에 받은 조각",
    tag: "수능공부",
    time: "AM 10:05",
    snippet: "새로운 레시피로 요리를 시도해 보았다.",
  },
];

const MOCK_RECEIVED_MORE = [
  {
    id: 3,
    dateLabel: "8월 14일에 받은 조각",
    tag: "수능공부",
    time: "AM 10:05",
    snippet: "새로운 레시피로 요리를 시도해 보았다.",
  },
  {
    id: 4,
    dateLabel: "8월 14일에 받은 조각",
    tag: "수능공부",
    time: "AM 10:05",
    snippet: "새로운 레시피로 요리를 시도해 보았다.",
  },
  {
    id: 5,
    dateLabel: "8월 14일에 받은 조각",
    tag: "수능공부",
    time: "AM 10:05",
    snippet: "새로운 레시피로 요리를 시도해 보았다.",
  },
  {
    id: 6,
    dateLabel: "8월 14일에 받은 조각",
    tag: "수능공부",
    time: "AM 10:05",
    snippet: "새로운 레시피로 요리를 시도해 보았다.",
  },
  {
    id: 7,
    dateLabel: "8월 14일에 받은 조각",
    tag: "수능공부",
    time: "AM 10:05",
    snippet: "새로운 레시피로 요리를 시도해 보았다.",
  },
  {
    id: 8,
    dateLabel: "8월 14일에 받은 조각",
    tag: "수능공부",
    time: "AM 10:05",
    snippet: "새로운 레시피로 요리를 시도해 보았다.",
  },
];

const MOCK_PENDING = [
  {
    id: 1,
    dateLabel: "9월 1일에 익명화 됨 • 4일남음",
    time: "PM 1:00",
    snippet: "산책하면서 공원에서 자연을 느꼈다.",
  },
  {
    id: 2,
    dateLabel: "8월 30일에 익명화 됨 • 3일남음",
    time: "AM 10:05",
    snippet: "새로운 레시피로 요리를 시도해 보았다.",
  },
];

const MOCK_PENDING_MORE = [
  {
    id: 3,
    dateLabel: "8월 29일에 익명화 됨 • 2일남음",
    time: "PM 3:20",
    snippet: "친구랑 오랜만에 만나서 이야기했다.",
  },
  {
    id: 4,
    dateLabel: "8월 28일에 익명화 됨 • 1일남음",
    time: "AM 9:15",
    snippet: "아침 일찍 일어나서 운동을 했다.",
  },
];

const MOCK_SENT = [
  {
    id: 1,
    dateLabel: "9월 14일에 전달한 조각",
    tag: "알바",
    time: "PM 1:00",
    snippet: "오늘 알바할때 배가 아파서 몰래 똥을 싸...",
  },
  {
    id: 2,
    dateLabel: "8월 24일에 받은 조각",
    tag: "수능공부",
    time: "AM 10:05",
    snippet: "새로운 레시피로 요리를 시도해 보았다.",
  },
];

const MOCK_SENT_MORE = [
  {
    id: 3,
    dateLabel: "9월 16일에 전달한 조각",
    tag: "부업",
    time: "PM 3:00",
    snippet: "부업으로 웹사이트를 만들며 시간 가...",
  },
  {
    id: 4,
    dateLabel: "9월 17일에 전달한 조각",
    tag: "정규직",
    time: "AM 9:00",
    snippet: "정규직 면접에서 긴장이 너무 되어 실...",
  },
  {
    id: 5,
    dateLabel: "9월 18일에 전달한 조각",
    tag: "프리랜서",
    time: "PM 5:00",
    snippet: "프리랜서 프로젝트 마감일이 다가와서...",
  },
  {
    id: 6,
    dateLabel: "9월 19일에 전달한 조각",
    tag: "아르바이트",
    time: "AM 11:00",
    snippet: "아르바이트 중 친구와 재미있는 이야...",
  },
  {
    id: 7,
    dateLabel: "9월 20일에 전달한 조각",
    tag: "인턴십",
    time: "PM 4:00",
    snippet: "인턴십에서 귀여운 강아지를 만나서 기...",
  },
  {
    id: 8,
    dateLabel: "9월 21일에 전달한 조각",
    tag: "여름 알바",
    time: "PM 6:00",
    snippet: "여름 알바하면서 시원한 음료수를 마셨다.",
  },
];

export default function ExperiencePage() {
  const navigate = useNavigate();
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [notificationsExpanded, setNotificationsExpanded] = useState(false);

  const handleConfirmView = () => {
    if (!confirmTarget) return;
    navigate(`/experience/diary/${confirmTarget.id}`, {
      state: { mode: "incoming", keyword: confirmTarget.keyword },
    });
    setConfirmTarget(null);
  };

  const notificationsTotal =
    MOCK_NOTIFICATIONS.length + MOCK_NOTIFICATIONS_MORE.length;
  const useNavigateNotifications = notificationsTotal >= NAVIGATE_THRESHOLD;

  const visibleNotifications = notificationsExpanded
    ? [...MOCK_NOTIFICATIONS, ...MOCK_NOTIFICATIONS_MORE]
    : MOCK_NOTIFICATIONS;

  const handleNotificationsMoreClick = () => {
    if (useNavigateNotifications) {
      navigate("/experience/incoming");
      return;
    }
    setNotificationsExpanded((prev) => !prev);
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
                한재이님은 "3번" 경험조각을 받을 수 있어요
              </p>
            </div>

            <div className="flex w-full flex-col items-start gap-[12px]">
              {visibleNotifications.map((n) => (
                <ExperienceNotificationBubble
                  key={n.id}
                  {...n}
                  onConfirm={() => setConfirmTarget(n)}
                />
              ))}
            </div>

            <MoreButton
              expanded={
                useNavigateNotifications ? false : notificationsExpanded
              }
              onClick={handleNotificationsMoreClick}
            />
          </div>
        </div>

        <ExperiencePieceSection
          title="받은 경험조각"
          items={MOCK_RECEIVED}
          moreItems={MOCK_RECEIVED_MORE}
          kebabMode="options"
          onNavigateMore={() => navigate("/experience/gotten")}
        />

        <ExperiencePieceSection
          title="전달 대기중인 경험조각"
          subtitle="5일동안 익명화된 내용을 확인하고 전달을 취소할 수 있어요. 이후에는 다른 사람에게 전달될 수 있어요."
          items={MOCK_PENDING}
          moreItems={MOCK_PENDING_MORE}
          kebabMode="link"
          onItemKebabClick={(item) =>
            navigate(`/experience/diary/${item.id}`, {
              state: { mode: "pending" },
            })
          }
        />

        <ExperiencePieceSection
          title="전달된 나의 경험조각"
          items={MOCK_SENT}
          moreItems={MOCK_SENT_MORE}
          kebabMode="link"
          onItemKebabClick={(item) => navigate(`/experience/sent/${item.id}`)}
          onNavigateMore={() => navigate("/experience/sent")}
        />
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
