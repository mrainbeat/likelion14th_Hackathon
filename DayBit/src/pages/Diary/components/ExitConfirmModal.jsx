export default function ExitConfirmModal({ onContinue, onExit }) {
  return (
    <div
      className="absolute inset-0 z-50 bg-grey-90/25 backdrop-blur-[1px]"
      onClick={onContinue}
    >
      <div
        className="absolute left-1/2 top-[38%] flex w-[calc(100%-32px)] max-w-[358px] -translate-x-1/2 flex-col items-start justify-center gap-[16px] rounded-[12px] bg-[#F6F8FA] px-[16px] py-[20px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-[7px]">
          <p className="text-grey-90 text-[20px] font-semibold tracking-[-0.4px]">
            작성을 중단하시겠어요?
          </p>

          <p className="text-grey-70 text-[16px] font-medium tracking-[-0.32px]">
            내용은 자동저장 돼요 :)
          </p>
        </div>

        <div className="flex gap-[14px] items-center w-full">
          <button
            type="button"
            onClick={onContinue}
            className="flex-1 h-[48px] bg-grey-0 border border-grey-70 rounded-[12px] px-[26px] text-[18px] font-medium tracking-[-0.36px] text-grey-90"
          >
            작성 계속하기
          </button>

          <button
            type="button"
            onClick={onExit}
            className="flex-1 h-[48px] bg-grey-70 rounded-[12px] px-[26px] text-[18px] font-semibold tracking-[-0.18px] text-grey-0"
          >
            작성 중단하기
          </button>
        </div>
      </div>
    </div>
  );
}
