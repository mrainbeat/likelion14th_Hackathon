import MiniProgressBar from "./MiniProgressBar";

export default function DiaryTutorial({ step, onNext }) {
  const STEPS = [
    {
      title: "무엇을 쓸지 막막한가요?",
      desc: ["데이빗이 오늘의 기록을 도와줄 질문을", "나에게 맞춰서 건네요."],
    },
    {
      title: "작성 시간이 매번 자동으로 기록돼요.",
      desc: ["같은 하루라도 시간에 따라 달라지는", "생각을 기록할 수 있어요."],
    },
    {
      title: "다 적었다면 오늘의 기록을 완성해보세요.",
      desc: [
        "기록을 바탕으로 오늘의 색과",
        "나를 돌아볼 수 있는 질문을 만나게 돼요.",
      ],
    },
    {
      title: "하루의 기록은 기본적으로 자정에 넘어가요.",
      desc: ["마이페이지의 설정에서 하루 전환 시간을 변경할 수 있어요."],
    },
  ];

  const current = STEPS[step];

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end bg-grey-90/40">
      <div className="flex h-[312px] w-full flex-col items-start justify-between rounded-t-[8px] bg-grey-0 px-[16px] pb-[30px] pt-[16px]">
        <div className="flex w-full flex-1 flex-col items-start justify-between">
          <div className="flex w-full flex-col items-start gap-[6px]">
            <p className="w-full text-[20px] font-semibold tracking-[-0.4px] text-grey-90">
              {current.title}
            </p>
            <div className="w-full text-[16px] font-medium leading-[normal] tracking-[-0.32px] text-grey-70">
              {current.desc.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>

          <div className="flex w-full flex-col items-center gap-[20px]">
            <MiniProgressBar current={step} />

            <button
              type="button"
              onClick={onNext}
              className="w-full rounded-[12px] bg-grey-80 px-[26px] py-[14px] text-[18px] font-semibold tracking-[-0.36px] text-shadow-[0px_0px_2px_rgba(0,0,0,0.05)] text-grey-0"
            >
              다음
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
