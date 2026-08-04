import { useEffect, useRef, useState } from "react";
import { ModalButton } from "./OnboardingUI";

const LINE_H = 26;
const MAX_LENGTH = 40;

export default function JobInputModal({
  open,
  initialValue = "",
  onConfirm,
  onClose,
}) {
  const [value, setValue] = useState(initialValue);
  const textareaRef = useRef(null);

  // 줄 수에 맞춰 높이 자동 확장
  const resize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(el.scrollHeight, LINE_H)}px`;
  };

  useEffect(() => {
    if (open) resize();
  }, [open, value]);

  if (!open) return null;

  const isValid = value.trim().length > 0;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-[#2D3038]/25 backdrop-blur-[1px]"
      />

      <div className="relative flex w-[350px] flex-col items-start gap-[16px] overflow-hidden rounded-[12px] bg-[#F6F8FA] px-[16px] py-[16px]">
        <p className="whitespace-nowrap text-[20px] font-semibold leading-[1.19] tracking-[-0.4px] text-[#2D3038]">
          현재 어떤 일을 하고 있나요?
        </p>

        <div
          className="w-full shrink-0 rounded-[12px] bg-white px-[16px] py-[20px]"
          style={{
            boxShadow:
              "0 0 10px 0 rgba(77,80,91,0.05), 0 0 30px 0 rgba(65,68,80,0.05)",
          }}
        >
          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            autoFocus
            maxLength={MAX_LENGTH}
            onChange={(e) => setValue(e.target.value)}
            className="block h-[26px] w-full resize-none overflow-hidden bg-transparent text-[16px] font-normal leading-[26px] tracking-[-0.32px] text-black focus:outline-none"
          />
        </div>

        {/* 입력값이 있을 때만 완료 버튼 보이기 */}
        {isValid && (
          <div className="h-[49px] w-[318px] shrink-0">
            <ModalButton onClick={() => onConfirm(value.trim())}>
              완료
            </ModalButton>
          </div>
        )}
      </div>
    </div>
  );
}
