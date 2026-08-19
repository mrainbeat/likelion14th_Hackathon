export default function ResumeDraftModal({ onDiscard, onResume, onClose }) {
  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-grey-90/25 backdrop-blur-[1px]"
      onClick={onClose}
    >
      <div
        className="flex w-[calc(100%-32px)] max-w-[358px] flex-col gap-[16px] rounded-[12px] bg-[#F6F8FA] px-[16px] py-[20px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-full flex-col items-start gap-[6px]">
          <p className="w-full text-[20px] font-semibold tracking-[-0.4px] text-grey-90">
            작성하던 일기가 있어요.
          </p>
          <p className="w-full text-[16px] font-medium tracking-[-0.32px] text-grey-70">
            이어서 작성하시겠어요?
          </p>
        </div>
        <div className="flex w-full items-center gap-[14px]">
          <button
            type="button"
            onClick={onDiscard}
            className="h-[49px] flex-1 rounded-[12px] border-[1.5px] border-grey-60 bg-grey-0 text-[18px] font-semibold tracking-[-0.18px] text-grey-80"
          >
            새로 작성하기
          </button>
          <button
            type="button"
            onClick={onResume}
            className="h-[49px] flex-1 rounded-[12px] bg-grey-70 text-[18px] font-semibold tracking-[-0.18px] text-grey-0"
          >
            이어서 작성하기
          </button>
        </div>
      </div>
    </div>
  );
}
