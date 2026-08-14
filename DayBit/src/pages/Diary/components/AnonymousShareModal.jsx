const BUTTON_BASE =
  "flex h-[49px] min-w-px flex-1 items-center justify-center whitespace-nowrap rounded-[12px] border-[1.5px] px-[26px] text-[18px] font-semibold tracking-[-0.18px] text-shadow-[0px_0px_2px_rgba(0,0,0,0.05)]";

export default function AnonymousShareModal({ onDecline, onShare }) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-grey-90/25 backdrop-blur-[1px]">
      <div className="flex w-[calc(100%-40px)] max-w-[350px] flex-col gap-[16px] rounded-[12px] bg-[#F6F8FA] px-[16px] py-[20px]">
        <div className="flex w-full flex-col gap-[6px]">
          <p className="w-full text-[20px] font-semibold tracking-[-0.4px] text-grey-90">
            오늘 일기를 다른사람에게 전해도 될까요?
          </p>
          <div className="w-full text-[16px] font-medium tracking-[-0.32px] text-grey-70">
            <p>나와 비슷한 경험을 하고있는 사람에게 </p>
            <p>
              <span className="font-semibold text-grey-90">익명화 되어 </span>
              전달돼요 :)
            </p>
          </div>
          <div className="flex w-full flex-col gap-[2px] text-[14px] text-grey-70">
            <p>나의 경험을 전달하면, 나도 경험을 받아볼 수 있어요!</p>
            <p>경험조각 주고받기에서 익명화된 일기를 확인할 수 있어요.</p>
          </div>
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
            className={`${BUTTON_BASE} border-grey-70 bg-grey-70 text-grey-0`}
          >
            전달하기
          </button>
        </div>
      </div>
    </div>
  );
}
