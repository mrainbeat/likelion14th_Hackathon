const BUTTON_TEXT_SHADOW = { textShadow: "0px 0px 2px rgba(0, 0, 0, 0.05)" };

export default function ResumeDraftModal({ onDiscard, onResume, onClose }) {
  return (
    <div
      className="absolute inset-0 z-50 bg-grey-90/25 backdrop-blur-[1px]"
      onClick={onClose}
    >
      <div
        className="absolute left-1/2 top-[calc(50%-25px)] flex w-[350px] -translate-x-1/2 -translate-y-1/2 flex-col items-start justify-center gap-[16px] overflow-hidden rounded-[12px] bg-[#F6F8FA] px-[16px] py-[20px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-full flex-col items-start gap-[6px]">
          <p className="w-full text-[20px] font-semibold leading-[normal] tracking-[-0.4px] text-[#2D3038]">
            작성하던 일기가 있어요.
          </p>
          <p className="w-full text-[16px] font-medium leading-[normal] tracking-[-0.32px] text-[#5F6473]">
            작성하던 일기를 계속 작성하시겠어요?
          </p>
        </div>

        <div className="flex w-full items-center gap-[14px]">
          <button
            type="button"
            onClick={onDiscard}
            style={BUTTON_TEXT_SHADOW}
            className="flex min-w-0 flex-1 items-center justify-center whitespace-nowrap rounded-[12px] border-[1.5px] border-[#787E8C] bg-white px-[26px] py-[14px] text-[18px] font-semibold leading-[normal] tracking-[-0.36px] text-[#4F5563]"
          >
            나중에 작성하기
          </button>

          <button
            type="button"
            onClick={onResume}
            style={BUTTON_TEXT_SHADOW}
            className="flex min-w-0 flex-1 items-center justify-center whitespace-nowrap rounded-[12px] bg-[#5F6473] px-[26px] py-[14px] text-[18px] font-semibold leading-[normal] tracking-[-0.36px] text-white"
          >
            이어 작성하기
          </button>
        </div>
      </div>
    </div>
  );
}
