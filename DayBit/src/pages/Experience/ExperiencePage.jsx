import { useNavigate } from "react-router-dom";
import ExperienceNotificationBubble from "./components/ExperienceNotificationBubble";
import ExperiencePieceSection from "./components/ExperiencePieceSection";
import backIcon from "../../assets/icons/back.svg";
import profileIcon from "../../assets/icons/profile.svg";
import logoImage from "../../assets/logos/logo-symbol.png";

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    message: `"다이어트"와 관련된 경험 조각이 도착했어요.`,
    relativeTime: "12분 전",
    isToday: true,
  },
  {
    id: 2,
    message: `"다이어트"와 관련된 경험 조각이 도착했어요.`,
    relativeTime: "21시간 전",
    isToday: true,
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

export default function ExperiencePage() {
  const navigate = useNavigate();

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
              {MOCK_NOTIFICATIONS.map((n) => (
                <ExperienceNotificationBubble key={n.id} {...n} />
              ))}
            </div>
          </div>
        </div>

        <ExperiencePieceSection
          title="받은 경험조각"
          items={MOCK_RECEIVED}
          hasMore
        />

        <ExperiencePieceSection
          title="전달 대기중인 경험조각"
          subtitle="5일동안 익명화된 내용을 확인하고 전달을 취소할 수 있어요. 이후에는 다른 사람에게 전달될 수 있어요."
          items={MOCK_PENDING}
          hasMore
        />

        <ExperiencePieceSection
          title="전달된 나의 경험조각"
          items={MOCK_SENT}
          hasMore
        />
      </div>
    </div>
  );
}
