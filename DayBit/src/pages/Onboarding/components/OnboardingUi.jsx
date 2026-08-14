/* 진행 바 */
export function ProgressBar({ step = 1, total = 4 }) {
  return (
    <div className="absolute left-[20px] top-[12px] flex w-[350px] items-center gap-[8px]">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-[4px] min-w-px flex-1 rounded-full ${
            i < step ? "bg-grey-70" : "bg-grey-40"
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
          ? "border-2 border-solid border-grey-60 text-grey-80"
          : "border border-solid border-grey-30 text-grey-50"
      }`}
    >
      {label}
    </button>
  );
}

/* 하단 버튼 */
export function BottomButton({ children = "다음", disabled = false, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`absolute bottom-[30px] left-[20px] flex h-[49px] w-[350px] items-center justify-center rounded-[12px] text-[18px] font-semibold leading-none tracking-[-0.18px] text-grey-0 transition-all ${
        disabled
          ? "cursor-not-allowed bg-grey-40"
          : "cursor-pointer bg-grey-70 active:scale-[0.98]"
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
      className={`flex h-[49px] w-full items-center justify-center rounded-[12px] text-[18px] font-semibold leading-none tracking-[-0.18px] text-grey-0 text-shadow-[0px_0px_2px_rgba(0,0,0,0.05)] transition-all ${
        disabled
          ? "cursor-not-allowed bg-grey-40"
          : "cursor-pointer bg-grey-70 active:scale-[0.98]"
      }`}
    >
      {children}
    </button>
  );
}
