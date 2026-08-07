export default function DiaryTutorial({ step, onNext }) {
  const STEPS = [
    {
      title: "무엇을 쓸지 막막한가요?",
      desc: ["데이빗이 오늘의 기록을 도와줄 질문을", "나에게 맞춰서 건네요."],
    },
    {
      title: "작성 시간이 자동으로 기록돼요.",
      desc: ["같은 하루라도 시간에 따라 달라지는", "생각을 기록할 수 있어요."],
    },
    {
      title: "다 적었다면 오늘의 기록을 완성해보세요.",
      desc: [
        "기록을 바탕으로 오늘의 색과",
        "나를 돌아볼 수 있는 질문을 만나게 돼요.",
      ],
    },
  ];

  const current = STEPS[step];

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end bg-[#2D3038]/40">
      <div className="flex w-full flex-col gap-[64px] rounded-t-[20px] bg-white px-[20px] pt-[16px] pb-[50px]">
        <div className="flex flex-col gap-[8px]">
          <p className="text-[22px] font-semibold tracking-[-0.44px] text-[#2D3038]">
            {current.title}
          </p>
          <div className="text-[18px] font-medium tracking-[-0.36px] text-[#5F6473]">
            {current.desc.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </div>

        <div className="flex w-full flex-col items-center gap-[16px]">
          <div className="flex h-[6px] items-center justify-center gap-[8px]">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-[4px] w-[8px] rounded-[65px] ${
                  i === step ? "bg-[#5F6473]" : "bg-[#CDD1DA]"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={onNext}
            className="w-full rounded-[12px] bg-[#5F6473] px-[26px] py-[14px] text-[18px] font-semibold tracking-[-0.18px] text-white"
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
}
