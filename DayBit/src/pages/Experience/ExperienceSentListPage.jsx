import { useNavigate } from "react-router-dom";
import ExperiencePieceSection from "./components/ExperiencePieceSection";
import backIcon from "../../assets/icons/back.svg";
import profileIcon from "../../assets/icons/profile.svg";
import logoImage from "../../assets/logos/logo-symbol.png";

const MOCK_SENT_ALL = [
  {
    id: 1,
    dateLabel: "9월 14일에 전달한 조각",
    tag: "알바",
    time: "PM 1:00",
    snippet: "오늘 알바할때 배가 아파서 몰래 똥을 싸...",
  },
  {
    id: 2,
    dateLabel: "9월 15일에 전달한 조각",
    tag: "주말 알바",
    time: "PM 2:00",
    snippet: "주말 알바하면서 손님이 너무 많아...",
  },
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

export default function ExperienceSentListPage() {
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
          title="전달된 나의 경험조각"
          items={MOCK_SENT_ALL}
          kebabMode="link"
          onItemKebabClick={(item) => navigate(`/experience/sent/${item.id}`)}
        />
      </div>
    </div>
  );
}
