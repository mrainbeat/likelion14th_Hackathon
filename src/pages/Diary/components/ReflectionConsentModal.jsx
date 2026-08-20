import { useScrollLock } from "../../../hooks/useScrollLock";

const BUTTON_BASE =
  "flex h-[49px] min-w-px flex-1 items-center justify-center whitespace-nowrap rounded-[12px] border-[1.5px] px-[26px] text-[18px] font-semibold tracking-[-0.36px] text-shadow-[0px_0px_2px_rgba(0,0,0,0.05)]";

export default function ReflectionConsentModal({ onSkip, onUse, onClose }) {
  useScrollLock();

  return (
    <div
      className="fixed inset-0 z-50 bg-grey-90/25 backdrop-blur-[1px]"
      onClick={onClose}
    >
      <div
        className="absolute left-1/2 top-[38%] flex w-[calc(100%-32px)] max-w-[358px] -translate-x-1/2 flex-col items-start justify-center gap-[16px] rounded-[12px] bg-[#F6F8FA] px-[16px] py-[20px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-full flex-col items-start gap-[10px]">
          <div className="flex w-full flex-col items-start gap-[2px]">
            <p className="w-full text-[20px] font-semibold leading-[normal] tracking-[-0.4px] text-grey-90">
              일기내용을 질문에 반영할까요?
            </p>

            <p className="text-[16px] font-medium leading-[normal] tracking-[-0.32px] text-grey-70">
              좀 더 개인화된 질문을 받아볼 수 있어요 :)
            </p>
          </div>

          <p className="w-full text-[14px] font-normal leading-[normal] tracking-[-0.28px] text-grey-70">
            작성 완료후 내용 수정은 어려워요!
          </p>
        </div>

        <div className="flex w-full items-center gap-[14px]">
          <button
            type="button"
            onClick={onSkip}
            className={`${BUTTON_BASE} border-grey-60 bg-grey-0 text-grey-80`}
          >
            반영하지 않기
          </button>

          <button
            type="button"
            onClick={onUse}
            className={`${BUTTON_BASE} border-grey-80 bg-grey-80 text-grey-0`}
          >
            반영하기
          </button>
        </div>
      </div>
    </div>
  );
}
