import { useNavigate } from "react-router-dom";
import backIcon from "../../assets/icons/back.svg";
import profileIcon from "../../assets/icons/profile.svg";

const MOCK_DIARY_BLOCKS = [
  {
    time: "AM 11:47",
    text: "오전에는 집중이 잘 안 돼서 계속 딴짓만 했다. 결국 할 일은 오후에 몰아서 끝냈는데 생각보다 금방 끝나더라. 괜히 미리 걱정했던 것 같다. 저녁에는 좋아하는 플레이리스트 틀어놓고 방 정리까지 하고 나니 하루가 조금 정돈된 느낌이었다. 잠들기 전에 이렇게 기록을 남기니까 오늘이 조금 더 의미 있게 느껴진다.",
  },
  {
    time: "PM 6:23",
    text: "오늘은 평소보다 조금 일찍 일어났다. 점심에는 오랜만에 친구를 만나 카페에서 이런저런 이야기를 나눴다. 특별한 일은 없었지만 웃을 일이 많아서 기분이 괜찮았다. 집으로 돌아오는 길에 노을이 예뻐서 잠깐 걸음을 멈췄다. 하루가 금방 지나간 것 같아 아쉽지만, 오늘 정도면 충분히 좋은 하루였다.",
  },
  { time: "PM 9:41", text: "이제 자려고 누ㅇ" },
];

const MOCK_REACTIONS = [
  "생각이 되게 많으신 분인것 같아서 본받고 싶고어쩌고저쩌고 ㅇ롤하시는지 궁금함 시간되시면 절아 커피한잔하고 피방가서 바텀듀오해요 자칸이나 루시안 나미같은 ㅋ 장난 ㅋㅋ",
  "생각이 되게 많으신 분인것 같아서 본받고 싶고어쩌고저쩌고 ㅇ롤하시는지 궁금함 시간되시면 절아 커피한잔하고 피방가서 바텀듀오해요 자칸이나 루시안 나미같은 ㅋ 장난 ㅋㅋ",
  "생각이 되게 많으신 분인것 같아서 본받고 싶고어쩌고저쩌고 ㅇ롤하시는지 궁금함 시간되시면 절아 커피한잔하고 피방가서 바텀듀오해요 자칸이나 루시안 나미같은 ㅋ 장난 ㅋㅋ",
];

export default function ExperienceSentDetailPage() {
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

        <p className="text-heading-28 whitespace-nowrap drop-shadow-[0px_0px_1px_rgba(0,0,0,0.05)] text-grey-80">
          9월 24일
        </p>

        <div className="flex w-full flex-col gap-[26px] rounded-[12px] bg-grey-0 px-[16px] py-[20px] shadow-[0_0_10px_0_rgba(77,80,91,0.05),0_0_30px_0_rgba(65,68,80,0.05)]">
          {MOCK_DIARY_BLOCKS.map((block, i) => (
            <div key={i} className="flex w-full flex-col items-start gap-[6px]">
              <p className="whitespace-nowrap text-[16px] font-medium tracking-[-0.32px] text-grey-70">
                {block.time}
              </p>
              <p className="text-16 w-full text-grey-90">{block.text}</p>
            </div>
          ))}
        </div>

        <div className="flex w-full flex-col items-start gap-[10px]">
          <p className="text-[20px] font-semibold tracking-[-0.4px] text-grey-90">
            받은 반응
          </p>
          <div className="flex w-full flex-col items-start gap-[12px]">
            {MOCK_REACTIONS.map((text, i) => (
              <div
                key={i}
                className="w-full rounded-[12px] bg-grey-20 px-[16px] py-[10px]"
              >
                <p className="text-[16px] font-medium tracking-[-0.32px] text-grey-70">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
