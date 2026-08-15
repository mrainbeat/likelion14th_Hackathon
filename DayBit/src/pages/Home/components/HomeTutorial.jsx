const DIM_COLOR = "rgba(45, 48, 56, 0.35)";

const STEPS = [
  {
    title: "이번 주의 색을 모아볼까요?",
    desc: [
      "일주일에 일기를 3번 이상 작성한다면 그 주에 나온 색들을",
      "이용해 나만의 이미지를 만들 수 있어요.",
    ],
  },
  {
    title: "작성한 기록도 다시 관리할 수 있어요.",
    desc: ["일기를 삭제하거나 숨길 수 있어요."],
  },
  {
    title: "내 하루와 닮은 조각을 만나보세요",
    desc: [
      "나와 비슷한 경험을 한 사람의 이야기가 경험조각이 되어",
      "나에게 전달돼요.",
      "다른 사람의 경험을 보며 나를 돌아볼 수 있어요.",
    ],
  },
];

function StepDots({ current, total }) {
  return (
    <div className="flex items-center gap-[8px]">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className="h-[4px] w-[8px] rounded-[2px]"
          style={{ backgroundColor: i === current ? "#5F6473" : "#CDD1DA" }}
        />
      ))}
    </div>
  );
}

export default function HomeTutorial({ step, spot, onNext }) {
  const current = STEPS[step];

  return (
    <div className="absolute inset-0 z-50">
      {spot ? (
        <div
          className="pointer-events-auto absolute"
          style={{
            top: spot.top,
            left: spot.left,
            width: spot.width,
            height: spot.height,
            borderRadius: spot.radius,
            boxShadow: `0 0 0 9999px ${DIM_COLOR}`,
          }}
        />
      ) : (
        <div
          className="pointer-events-auto absolute inset-0"
          style={{ backgroundColor: DIM_COLOR }}
        />
      )}

      <div className="absolute inset-x-0 bottom-0 flex h-[312px] w-full flex-col items-start justify-between rounded-t-[8px] bg-grey-0 px-[16px] pb-[30px] pt-[16px]">
        <div className="flex w-full flex-1 flex-col items-start justify-between">
          <div className="flex w-full flex-col items-start gap-[6px]">
            <p className="w-full text-[20px] font-semibold leading-[normal] tracking-[-0.4px] text-grey-90">
              {current.title}
            </p>
            <div className="w-full text-[16px] font-medium leading-[normal] tracking-[-0.32px] text-grey-70">
              {current.desc.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>

          <div className="flex w-full flex-col items-center gap-[20px]">
            <StepDots current={step} total={STEPS.length} />

            <button
              type="button"
              onClick={onNext}
              className="w-full cursor-pointer rounded-[12px] bg-grey-80 px-[26px] py-[14px] text-[18px] font-semibold leading-[normal] tracking-[-0.36px] text-shadow-[0px_0px_2px_rgba(0,0,0,0.05)] text-grey-0"
            >
              다음
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
