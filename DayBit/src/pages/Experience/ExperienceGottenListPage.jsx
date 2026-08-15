import { useNavigate } from "react-router-dom";
import ExperiencePieceSection from "./components/ExperiencePieceSection";
import backIcon from "../../assets/icons/back.svg";
import profileIcon from "../../assets/icons/profile.svg";
import logoImage from "../../assets/logos/logo-symbol.svg";
const MOCK_RECEIVED_ALL = [
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

export default function ExperienceGottenListPage() {
  const navigate = useNavigate();
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

        <ExperiencePieceSection
          title="받은 경험조각"
          items={MOCK_RECEIVED_ALL}
          kebabMode="options"
        />
      </div>
    </div>
  );
}
