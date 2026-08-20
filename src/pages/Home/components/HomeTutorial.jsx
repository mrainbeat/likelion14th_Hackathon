import { useEffect, useRef, useState } from "react";
import MiniProgressBar from "../../Diary/components/MiniProgressBar";

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

function StepPanel({ stepIndex, onNext }) {
  const data = STEPS[stepIndex];
  return (
    <div className="flex w-full flex-1 flex-col items-start justify-between">
      <div className="flex w-full flex-col items-start gap-[6px]">
        <p className="w-full text-[22px] font-semibold tracking-[-0.66px] text-grey-90">
          {data.title}
        </p>
        <div className="w-full text-[16px] font-medium leading-[22px] tracking-[-0.32px] text-grey-70">
          {data.desc.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      </div>

      <div className="flex w-full flex-col items-center gap-[20px]">
        <MiniProgressBar current={stepIndex} total={STEPS.length} />

        <button
          type="button"
          onClick={onNext}
          className="w-full cursor-pointer rounded-[12px] bg-grey-80 px-[26px] py-[14px] text-[18px] font-semibold tracking-[-0.36px] text-shadow-[0px_0px_2px_rgba(0,0,0,0.05)] text-grey-0"
        >
          다음
        </button>
      </div>
    </div>
  );
}

export default function HomeTutorial({ step, spot, onNext }) {
  const [displayedStep, setDisplayedStep] = useState(step);
  const [outgoingStep, setOutgoingStep] = useState(null);
  const lastStepRef = useRef(step);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (step === lastStepRef.current) return;
    lastStepRef.current = step;

    setOutgoingStep(displayedStep);
    setDisplayedStep(step);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setOutgoingStep(null);
    }, 300);

    return () => clearTimeout(timeoutRef.current);
  }, [step]);

  return (
    <div className="absolute inset-0 z-50 overflow-hidden">
      {spot ? (
        <div
          data-tutorial-spot
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

      {outgoingStep !== null && (
        <div
          key={`out-${outgoingStep}`}
          className="absolute inset-x-0 bottom-0 h-[282px]"
          style={{
            animation: "home-tutorial-push-out 300ms ease-out forwards",
          }}
        >
          <div className="flex h-full w-full flex-col items-start justify-between rounded-t-[8px] bg-grey-0 px-[16px] pb-[30px] pt-[16px]">
            <StepPanel stepIndex={outgoingStep} onNext={onNext} />
          </div>
        </div>
      )}
      <div
        key={`in-${displayedStep}`}
        className="absolute inset-x-0 bottom-0 h-[282px]"
        style={
          outgoingStep !== null
            ? { animation: "home-tutorial-push-in 300ms ease-out forwards" }
            : undefined
        }
      >
        <div className="flex h-full w-full flex-col items-start justify-between rounded-t-[8px] bg-grey-0 px-[16px] pb-[30px] pt-[16px]">
          <StepPanel stepIndex={displayedStep} onNext={onNext} />
        </div>
      </div>

      <style>{`
        @keyframes home-tutorial-push-in {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes home-tutorial-push-out {
          from { transform: translateX(0); }
          to { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
}
