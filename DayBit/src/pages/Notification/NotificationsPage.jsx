import { useNavigate } from "react-router-dom";
import backIcon from "../../assets/icons/back.svg";
import profileIcon from "../../assets/icons/profile.svg";
import NotificationCard from "./components/NotificationCard";

const UNREAD_SECTION = [
  {
    title: "다른사람의 경험조각 도착",
    time: "12분 전",
    body: "나의 일기와 닿아 있는 조각이 도착했어요.",
    unread: true,
  },
  {
    title: "일기 작성 알림",
    time: "52분 전",
    body: "일기 작성을 완료해 오늘의 색을 받아보세요 :)",
    unread: true,
  },
  {
    title: "일기 작성 알림",
    time: "1일 전",
    body: "일기 작성을 완료해 오늘의 색을 받아보세요 :)",
    unread: false,
  },
];

const READ_SECTION = [
  {
    title: "내 경험조각에 대한 반응 도착",
    time: "3시간 전",
    body: "내가 전달한 조각에 대한 반응을 확인해보세요!",
    unread: true,
  },
  {
    title: "다른사람의 경험조각 도착",
    time: "2일 전",
    body: "나에게 도착한 새로운 경험조각이 있어요.",
    unread: false,
  },
  {
    title: "일기 작성 알림",
    time: "3일 전",
    body: "일기 작성을 완료해 오늘의 색을 받아보세요 :)",
    unread: false,
  },
  {
    title: "다른사람의 경험조각 도착",
    time: "3일 전",
    body: "나에게 도착한 새로운 경험조각이 있어요.",
    unread: false,
  },
];

export default function NotificationsPage() {
  const navigate = useNavigate();

  return (
    <div className="flex h-full w-full select-none flex-col gap-[24px] overflow-y-auto bg-[#F6F8FA] p-[16px] scrollbar-hide">
      <div className="flex w-full shrink-0 items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="size-[32px] shrink-0 cursor-pointer bg-transparent p-0 transition-opacity active:opacity-60"
        >
          <img src={backIcon} alt="뒤로가기" className="h-full w-full" />
        </button>
        <img
          src={profileIcon}
          alt="프로필"
          className="size-[38px] shrink-0 rounded-full object-contain"
          style={{
            filter: "drop-shadow(0 0 9.938px rgba(65, 68, 80, 0.16))",
          }}
        />
      </div>
      <div className="flex w-full flex-col items-start gap-[18px]">
        <p className="whitespace-nowrap text-[22px] font-semibold leading-[normal] tracking-[-0.66px] text-[#4F5563]">
          알림
        </p>
        <div className="flex w-full flex-col items-start gap-[20px]">
          <div className="flex w-full flex-col items-start gap-[8px]">
            <p className="whitespace-nowrap text-[14px] font-semibold leading-[normal] tracking-[-0.28px] text-grey-70">
              확인하지 않은 알림
            </p>
            <div className="flex w-full flex-col items-start gap-[16px]">
              {UNREAD_SECTION.map((item, i) => (
                <NotificationCard key={i} {...item} />
              ))}
            </div>
          </div>
          <div className="flex w-full flex-col items-start gap-[8px]">
            <p className="whitespace-nowrap text-[14px] font-semibold leading-[normal] tracking-[-0.28px] text-grey-70">
              확인한 알림
            </p>
            <div className="flex w-full flex-col items-start gap-[16px]">
              {READ_SECTION.map((item, i) => (
                <NotificationCard key={i} {...item} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
