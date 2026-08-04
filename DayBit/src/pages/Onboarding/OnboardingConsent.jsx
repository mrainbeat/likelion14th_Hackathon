import { useNavigate } from "react-router-dom";
import OnboardingHeader from "./components/OnboardingHeader";
import { ProgressBar, BottomButton } from "./components/OnboardingUi";
import bubbleTailSvg from "../../assets/icons/tail.svg";

const SECTIONS = [
  {
    title: "기본 정보 활용",
    lines: ["닉네임과 현재 하는일을 질문에 반영해요."],
  },
  {
    title: "기록 속 정보 기억하기",
    lines: [
      "기록에  등장한 사람, 관심사, 이슈등을 기억해요.",
      "새로운 정보를 기억하기 전에는 먼저 물어볼게요:)",
    ],
  },
  {
    title: "이전 기록 활용하기",
    lines: ["최근 기록을 반영해 자연스럽게 이어지는", "질문을 드려요."],
  },
];

function SpeechBubble({ lines }) {
  return (
    <div className="relative flex shrink-0 items-center gap-[10px] rounded-[12px] bg-grey-30 px-[16px] py-[10px]">
      <img
        src={bubbleTailSvg}
        alt=""
        className="pointer-events-none absolute left-[-4px] top-[-9px] h-[18.739px] w-[15.307px]"
      />
      <div className="shrink-0 whitespace-nowrap text-[16px] font-medium leading-[19px] tracking-[-0.32px] text-grey-80">
        {lines.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
    </div>
  );
}

export default function OnboardingConsent() {
  const navigate = useNavigate();

  const handleAgree = () => {
    localStorage.setItem("memoryConsent", "true");
    navigate("/onboarding/done", { replace: true });
  };

  return (
    <div className="relative h-full w-full select-none overflow-hidden bg-[#F6F8FA]">
      <ProgressBar step={3} />

      <OnboardingHeader
        lines={["더 나다운 질문을 위해", "데이빗은 허락한 정보만 기억해요."]}
        caption="설정에서 언제든지 변경 가능해요."
      />

      <div className="absolute inset-x-0 bottom-[115px] top-[288px] overflow-y-auto overscroll-contain pl-[36px] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-[318px] flex-col gap-[16px] pb-[8px]">
          {SECTIONS.map(({ title, lines }) => (
            <div
              key={title}
              className="flex w-full flex-col items-start gap-[8px]"
            >
              <p className="whitespace-nowrap text-[20px] font-semibold leading-[24px] tracking-[-0.4px] text-grey-90">
                {title}
              </p>
              <SpeechBubble lines={lines} />
            </div>
          ))}
        </div>
      </div>

      <BottomButton onClick={handleAgree}>동의하기</BottomButton>
    </div>
  );
}
