const BUTTON_BASE =
  "flex h-[49px] min-w-px flex-1 items-center justify-center whitespace-nowrap rounded-[12px] border-[1.5px] px-[26px] text-[18px] font-semibold tracking-[-0.36px] text-shadow-[0px_0px_2px_rgba(0,0,0,0.05)]";

export default function AnonymousShareModal({ onDecline, onShare, onClose }) {
  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-grey-90/25 backdrop-blur-[1px]"
      onClick={onClose}
    >
      <div
        className="flex w-[calc(100%-40px)] max-w-[350px] flex-col gap-[16px] rounded-[12px] bg-[#F6F8FA] px-[16px] py-[20px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-full flex-col items-start gap-[10px]">
          <div className="flex w-full flex-col items-start gap-[2px]">
            <div className="w-full text-[20px] font-semibold leading-[normal] tracking-[-0.4px] text-grey-90">
              <p>오늘 일기를 익명으로</p>
              <p>다른사람에게 전해도 될까요?</p>
            </div>
            <p className="w-full text-[14px] font-normal leading-[normal] tracking-[-0.28px] text-grey-70">
              나의 경험을 전달하면, 나도 경험을 받아볼 수 있어요!
            </p>
          </div>
          <p className="w-full text-[14px] font-medium leading-[normal] tracking-[-0.28px] text-grey-70">
            경험조각 주고받기에서{" "}
            <span className="font-semibold text-grey-90">익명화 된</span>{" "}
            일기를 확인할 수 있어요.
          </p>
        </div>
        <div className="flex w-full items-center gap-[14px]">
          <button
            type="button"
            onClick={onDecline}
            className={`${BUTTON_BASE} border-grey-60 bg-grey-0 text-grey-80`}
          >
            전달하지 않기
          </button>
          <button
            type="button"
            onClick={onShare}
            className={`${BUTTON_BASE} border-grey-80 bg-grey-80 text-grey-0`}
          >
            전달하기
          </button>
        </div>
      </div>
    </div>
  );
}
