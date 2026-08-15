import { useEffect, useRef, useState } from "react";
import { ModalButton } from "./OnboardingUi";

const LINE_H = 26;
const MAX_LENGTH = 40;
const GAP_ABOVE_KEYBOARD = 20;

export default function JobInputModal({
  open,
  initialValue = "",
  onConfirm,
  onClose,
}) {
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);
  const [value, setValue] = useState(initialValue);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (open) {
      setMounted(true);
      setValue(initialValue);
      const id = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(id);
    }
    setShown(false);
    const timer = setTimeout(() => setMounted(false), 200);
    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(el.scrollHeight, LINE_H)}px`;
  }, [mounted, value]);

  useEffect(() => {
    if (!open || !window.visualViewport) return;
    const vv = window.visualViewport;
    const handleResize = () => {
      const kb = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      setKeyboardHeight(kb);
    };
    vv.addEventListener("resize", handleResize);
    vv.addEventListener("scroll", handleResize);
    handleResize();
    return () => {
      vv.removeEventListener("resize", handleResize);
      vv.removeEventListener("scroll", handleResize);
    };
  }, [open]);

  if (!mounted) return null;

  const isValid = value.trim().length > 0;
  const hasKeyboard = keyboardHeight > 0;

  return (
    <div
      className={`absolute inset-0 z-50 flex justify-center transition-[padding] duration-150 ease-out ${
        hasKeyboard ? "items-end" : "items-center"
      }`}
      style={
        hasKeyboard
          ? { paddingBottom: keyboardHeight + GAP_ABOVE_KEYBOARD }
          : undefined
      }
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-grey-90/25 backdrop-blur-[1px] transition-opacity duration-200 ease-out ${
          shown ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        className={`relative flex w-[350px] flex-col items-start gap-[16px] overflow-hidden rounded-[12px] bg-[#F6F8FA] px-[16px] py-[16px] transition-all duration-200 ease-out ${
          shown ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <p className="whitespace-nowrap text-[20px] font-semibold leading-[1.19] tracking-[-0.4px] text-grey-90">
          현재 어떤 일을 하고 있나요?
        </p>

        <div
          className="w-full shrink-0 rounded-[12px] bg-grey-0 px-[16px] py-[20px]"
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
            className="block h-[26px] w-full resize-none overflow-hidden bg-transparent text-[16px] font-normal leading-[26px] tracking-[-0.32px] text-grey-90 transition-[height] duration-150 ease-out focus:outline-none"
          />
        </div>

        <div className="h-[49px] w-full">
          <ModalButton
            disabled={!isValid}
            onClick={() => isValid && onConfirm(value.trim())}
          >
            완료
          </ModalButton>
        </div>
      </div>
    </div>
  );
}
