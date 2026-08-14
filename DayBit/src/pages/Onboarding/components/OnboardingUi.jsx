import arrowIcon from "../../../assets/icons/arrow.svg";
export function ProgressBar({ step = 1, total = 4 }) {
  return (
    <div className="absolute left-[4.10%] right-[4.10%] top-[12px] flex items-center gap-[8px]">
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
      className={`flex h-[35px] shrink-0 items-center rounded-[17px] border border-solid px-[12px] text-[16px] leading-none transition-colors ${
        selected
          ? "border-grey-80 font-semibold text-grey-90"
          : "border-grey-30 font-medium tracking-[-0.32px] text-grey-50"
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
      className={`absolute bottom-[30px] left-[4.10%] right-[4.10%] flex h-[49px] items-center justify-center rounded-[12px] text-[18px] font-semibold leading-none tracking-[-0.36px] text-white text-shadow-[0px_0px_2px_rgba(0,0,0,0.05)] transition-all ${
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
      className={`flex h-[49px] w-full items-center justify-center rounded-[12px] text-[18px] font-semibold leading-none tracking-[-0.36px] text-grey-0 text-shadow-[0px_0px_2px_rgba(0,0,0,0.05)] transition-all ${
        disabled
          ? "cursor-not-allowed bg-grey-40"
          : "cursor-pointer bg-grey-70 active:scale-[0.98]"
      }`}
    >
      {children}
    </button>
  );
}
export function BackButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="이전으로"
      className="absolute left-[4.10%] top-[26px] flex size-[32px] items-center justify-center"
    >
      <img src={arrowIcon} alt="" className="h-[16px] w-[10px]" />
    </button>
  );
}
