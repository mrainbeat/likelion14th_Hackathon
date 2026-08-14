import { useState } from "react";
import { useNavigate } from "react-router-dom";
import OnboardingHeader from "./components/OnboardingHeader";
import BubbleTail from "../../components/BubbleTail";
import apiClient from "../../api/apiClient";
import {
  ProgressBar,
  BackButton,
  BottomButton,
} from "./components/OnboardingUi";

const SECTIONS = [
  {
    title: "기본 정보 활용",
    lines: ["닉네임과 현재 하는일을 질문에 반영해요."],
  },
  {
    title: "기록 속 정보 기억하기",
    lines: [
      "기록에 등장한 사람, 관심사, 이슈등을 기억해요.",
      "새로운 정보를 기억하기 전에 먼저 물어볼게요:)",
    ],
    fullWidth: true,
  },
  {
    title: "이전 기록 활용하기",
    lines: ["최근 기록을 반영해 자연스럽게 이어지는", "질문을 드려요."],
  },
];

function renderWithTightSpaces(text) {
  const words = text.split(" ");
  return words.map((word, i) => (
    <span key={i}>
      {word}
      {i < words.length - 1 && <span className="tracking-[-0.8px]"> </span>}
    </span>
  ));
}

function SpeechBubble({ lines, fullWidth }) {
  return (
    <div
      className={`relative flex items-center gap-[10px] rounded-[12px] bg-grey-20 px-[16px] py-[10px] ${
        fullWidth ? "w-full shrink-0" : "shrink-0"
      }`}
    >
      <BubbleTail color="#E7E9EE" className="!left-[-4.5px] !top-[-11px]" />
      <div className="shrink-0 whitespace-nowrap text-[16px] font-medium tracking-[-0.32px] text-grey-70">
        {lines.map((line, i) => (
          <p key={i}>{renderWithTightSpaces(line)}</p>
        ))}
      </div>
    </div>
  );
}

function toServerTime(label) {
  if (!label) return null;

  const match = label.match(/^(오전|오후)(\d{1,2})시(?:\s*(\d{1,2})분)?$/);
  if (!match) return null;

  const [, period, hourStr, minuteStr] = match;
  let hour = Number(hourStr);
  const minute = minuteStr ? Number(minuteStr) : 0;

  if (period === "오후" && hour !== 12) hour += 12;
  if (period === "오전" && hour === 12) hour = 0;

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export default function OnboardingConsent() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleAgree = async () => {
    if (isSubmitting) return;

    const nickname = localStorage.getItem("nickname") || "";
    const job = localStorage.getItem("job") || "";
    const alarmLabel = localStorage.getItem("alarmTime") || "";
    const reminderTime = toServerTime(alarmLabel);

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await apiClient.patch("/api/me", {
        nickname,
        job,
        reminderTime,
        aiMemoryConsent: true,
      });

      navigate("/onboarding/done", { replace: true });
    } catch (error) {
      console.error(
        "PATCH /api/me 실패:",
        error.response?.status,
        error.response?.data,
      );
      setErrorMessage("저장 중 문제가 생겼어요. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative h-full w-full select-none overflow-hidden bg-[#F6F8FA]">
      <ProgressBar step={3} />
      <BackButton onClick={() => navigate(-1)} />
      <OnboardingHeader
        lines={["더 나다운 질문을 위해", "데이빗은 허락한 정보만 기억해요."]}
        caption="설정에서 언제든지 변경 가능해요."
      />

      <div className="absolute inset-x-0 bottom-[115px] top-[244px] overflow-y-auto overscroll-contain pl-[9.23%] pr-[9.23%] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-full flex-col gap-[16px] pb-[8px]">
          {SECTIONS.map(({ title, lines, fullWidth }) => (
            <div
              key={title}
              className="flex w-full flex-col items-start gap-[6px]"
            >
              <p className="whitespace-nowrap text-[18px] font-semibold tracking-[-0.36px] text-grey-80">
                {title}
              </p>
              <SpeechBubble lines={lines} fullWidth={fullWidth} />
            </div>
          ))}
        </div>
      </div>

      {errorMessage && (
        <p className="absolute inset-x-[9.23%] bottom-[95px] text-[13px] font-medium text-red-500">
          {errorMessage}
        </p>
      )}

      <BottomButton disabled={isSubmitting} onClick={handleAgree}>
        {isSubmitting ? "저장 중..." : "동의하기"}
      </BottomButton>
    </div>
  );
}
