import { useScrollLock } from "../../../hooks/useScrollLock";

const BUTTON_TEXT_SHADOW = { textShadow: "0px 0px 2px rgba(0, 0, 0, 0.05)" };

export default function ExitConfirmModal({ onContinue, onExit }) {
  useScrollLock();

  return (
    <div
      className="fixed inset-0 z-50 bg-grey-90/25 backdrop-blur-[1px]"
      onClick={onContinue}
    >
      <div
        className="absolute left-1/2 top-[38%] flex w-[358px] -translate-x-1/2 flex-col items-start justify-center gap-[16px] overflow-hidden rounded-[12px] bg-[#F6F8FA] px-[16px] py-[20px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-full flex-col items-start gap-[4px]">
          <p className="whitespace-nowrap text-[20px] font-semibold leading-[normal] tracking-[-0.4px] text-grey-90">
            작성을 중단하시겠어요?
          </p>
          <p className="w-full text-[14px] font-normal leading-[normal] tracking-[-0.28px] text-grey-70">
            내용은 자동저장 돼요 :)
          </p>
        </div>

        <div className="flex w-full items-center gap-[14px]">
          <button
            type="button"
            onClick={onContinue}
            style={BUTTON_TEXT_SHADOW}
            className="flex min-w-0 flex-1 items-center justify-center whitespace-nowrap rounded-[12px] border-[1.5px] border-[#787E8C] bg-white px-[26px] py-[14px] text-[18px] font-semibold leading-[normal] tracking-[-0.36px] text-[#4F5563]"
          >
            작성 계속하기
          </button>

          <button
            type="button"
            onClick={onExit}
            style={BUTTON_TEXT_SHADOW}
            className="flex min-w-0 flex-1 items-center justify-center whitespace-nowrap rounded-[12px] bg-[#5F6473] px-[26px] py-[14px] text-[18px] font-semibold leading-[normal] tracking-[-0.36px] text-white"
          >
            작성 중단하기
          </button>
        </div>
      </div>
    </div>
  );
}
