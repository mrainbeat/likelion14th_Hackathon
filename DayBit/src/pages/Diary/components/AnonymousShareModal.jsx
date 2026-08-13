export default function AnonymousShareModal({ onDecline, onShare }) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-grey-90/25 backdrop-blur-[1px]">
      <div className="w-[calc(100%-40px)] max-w-[350px] bg-[#F6F8FA] rounded-[12px] px-[16px] py-[20px] flex flex-col gap-[16px]">
        <div className="flex flex-col gap-[6px] w-full">
          <p className="text-grey-90 text-[20px] font-semibold tracking-[-0.4px]">
            오늘 일기를 다른사람에게 전해도 될까요?
          </p>
          <div className="text-grey-70 text-[16px] font-medium tracking-[-0.32px]">
            <p className="mb-0">나와 비슷한 경험을 하고있는 사람에게 </p>
            <p>
              <span className="font-semibold text-grey-90">익명화 되어 </span>
              전달돼요 :)
            </p>
          </div>
          <div className="flex flex-col gap-[2px] text-grey-70 text-[14px]">
            <p>나의 경험을 전달하면, 나도 경험을 받아볼 수 있어요!</p>
            <p>경험조각 주고받기에서 익명화된 일기를 확인할 수 있어요.</p>
          </div>
        </div>
        <div className="flex gap-[14px] items-center w-full">
          <button
            type="button"
            onClick={onDecline}
            className="flex-1 h-[48px] bg-grey-0 border-[1.5px] border-grey-60 rounded-[12px] px-[26px] text-[18px] font-semibold tracking-[-0.18px] text-grey-80 text-shadow-[0px_0px_2px_rgba(0,0,0,0.05)]"
          >
            전달하지 않기
          </button>
          <button
            type="button"
            onClick={onShare}
            className="flex-1 h-[48px] bg-grey-70 rounded-[12px] px-[26px] text-[18px] font-semibold tracking-[-0.18px] text-grey-0 text-shadow-[0px_0px_2px_rgba(0,0,0,0.05)]"
          >
            전달하기
          </button>
        </div>
      </div>
    </div>
  );
}
