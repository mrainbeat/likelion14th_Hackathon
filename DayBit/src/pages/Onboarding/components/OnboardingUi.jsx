/* 진행 바 */
export function ProgressBar({ step = 1, total = 4 }) {
  return (
    <div className="absolute left-[20px] top-[12px] flex w-[350px] items-center gap-[8px]">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-[4px] min-w-px flex-1 rounded-full ${
            i < step ? "bg-[#5F6473]" : "bg-[#CDD1DA]"
          }`}
        />
      ))}
    </div>
  );
}

/* 알약 상자 */
export function Chip({ label, selected = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-[35px] shrink-0 items-center rounded-[17px] px-[12px] text-[16px] font-medium leading-none tracking-[-0.32px] transition-colors ${
        selected
          ? "border-2 border-solid border-[#858C9C] text-[#4F5563]"
          : "border border-solid border-[#DFE2EA] text-[#AFB6C4]"
      }`}
    >
      {label}
    </button>
  );
}

/* 하단 버튼 (bottom 50px 고정) */
export function BottomButton({ children = "다음", disabled = false, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`absolute bottom-[50px] left-[20px] flex h-[49px] w-[350px] items-center justify-center rounded-[12px] text-[18px] font-semibold leading-none tracking-[-0.18px] text-white transition-all ${
        disabled
          ? "cursor-not-allowed bg-[#CDD1DA]"
          : "bg-[#5F6473] active:scale-[0.98]"
      }`}
    >
      {children}
    </button>
  );
}

/* 모달 내부 확인 버튼 */
export function ModalButton({ children = "완료", disabled = false, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex h-[49px] w-full items-center justify-center rounded-[12px] text-[18px] font-semibold leading-none tracking-[-0.18px] text-white transition-all ${
        disabled
          ? "cursor-not-allowed bg-[#CDD1DA]"
          : "bg-[#5F6473] active:scale-[0.98]"
      }`}
    >
      {children}
    </button>
  );
}
