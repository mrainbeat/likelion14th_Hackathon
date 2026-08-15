import backIcon from "../../../assets/icons/back.svg";
export function ProgressBar({ step = 1, total = 4 }) {
  return (
    <div className="flex w-full items-center gap-[8px]">
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
        selected ? "border-grey-80 text-grey-90" : "border-grey-30 text-grey-50"
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
      className="size-[32px] shrink-0 cursor-pointer bg-transparent p-0 transition-opacity active:opacity-60"
    >
      <img src={backIcon} alt="" className="h-full w-full" />
    </button>
  );
}
