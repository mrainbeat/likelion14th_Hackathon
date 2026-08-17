import { useEffect, useRef, useState } from "react";
import MiniProgressBar from "./MiniProgressBar";

const DIM_COLOR = "rgba(45, 48, 56, 0.25)";

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

function StepPanel({ stepIndex, onNext }) {
  const data = STEPS[stepIndex];
  return (
    <div className="flex w-full flex-1 flex-col items-start justify-between">
      <div className="flex w-full flex-col items-start gap-[6px]">
        <p className="w-full text-[20px] font-semibold tracking-[-0.4px] text-grey-90">
          {data.title}
        </p>
        <div className="w-full text-[16px] font-medium leading-[normal] tracking-[-0.32px] text-grey-70">
          {data.desc.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      </div>

      <div className="flex w-full flex-col items-center gap-[20px]">
        <MiniProgressBar current={stepIndex} />

        <button
          type="button"
          onClick={onNext}
          className="w-full rounded-[12px] bg-grey-80 px-[26px] py-[14px] text-[18px] font-semibold tracking-[-0.36px] text-shadow-[0px_0px_2px_rgba(0,0,0,0.05)] text-grey-0"
        >
          다음
        </button>
      </div>
    </div>
  );
}

export default function DiaryTutorial({ step, spot, onNext }) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  return (
    <div className="absolute inset-0 z-50 overflow-hidden">
      {spot ? (
        <div
          className="pointer-events-auto absolute transition-[top,left,width,height] duration-300 ease-out"
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
          className="absolute inset-x-0 bottom-0 h-[312px]"
          style={{ animation: "tutorial-push-out 300ms ease-out forwards" }}
        >
          <div className="flex h-full w-full flex-col items-start justify-between rounded-t-[8px] bg-grey-0 px-[16px] pb-[30px] pt-[16px]">
            <StepPanel stepIndex={outgoingStep} onNext={onNext} />
          </div>
        </div>
      )}
      <div
        key={`in-${displayedStep}`}
        className="absolute inset-x-0 bottom-0 h-[312px]"
        style={
          outgoingStep !== null
            ? { animation: "tutorial-push-in 300ms ease-out forwards" }
            : undefined
        }
      >
        <div className="flex h-full w-full flex-col items-start justify-between rounded-t-[8px] bg-grey-0 px-[16px] pb-[30px] pt-[16px]">
          <StepPanel stepIndex={displayedStep} onNext={onNext} />
        </div>
      </div>

      <style>{`
        @keyframes tutorial-push-in {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes tutorial-push-out {
          from { transform: translateX(0); }
          to { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
}
