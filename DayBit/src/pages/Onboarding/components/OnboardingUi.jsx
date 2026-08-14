export function ProgressBar({ step = 1, total = 4 }) {
  return (
    <div className="absolute left-[5.13%] right-[5.13%] top-[12px] flex items-center gap-[8px]">
      {" "}
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

export function Chip({ label, selected = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-[35px] shrink-0 items-center rounded-[17px] border border-solid px-[12px] text-[16px] font-medium leading-none tracking-[-0.32px] transition-colors ${
        selected ? "border-grey-70 text-grey-80" : "border-grey-30 text-grey-50"
      }`}
    >
      {label}
    </button>
  );
}

export function BottomButton({ children = "다음", disabled = false, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`absolute bottom-[30px] left-[5.13%] right-[5.13%] flex h-[49px] items-center justify-center rounded-[12px] text-[18px] font-semibold leading-none tracking-[-0.18px] text-white transition-all ${
        disabled
          ? "cursor-not-allowed bg-grey-40"
          : "cursor-pointer bg-grey-70 active:scale-[0.98]"
      }`}
    >
      {children}
    </button>
  );
}

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
