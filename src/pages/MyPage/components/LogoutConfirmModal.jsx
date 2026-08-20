import { useScrollLock } from "../../../hooks/useScrollLock";

export default function LogoutConfirmModal({ onCancel, onConfirm }) {
  useScrollLock();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(45,48,56,0.25)] backdrop-blur-[1px]"
      onClick={onCancel}
    >
      <div
        className="flex w-[calc(100%-32px)] max-w-[358px] flex-col items-start gap-[16px] rounded-[12px] bg-[#F6F8FA] px-[16px] py-[20px]"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="w-full text-[20px] font-semibold leading-[normal] tracking-[-0.4px] text-grey-90">
          로그아웃 하시겠어요?
        </p>
        <div className="flex w-full items-center gap-[14px]">
          <button
            type="button"
            onClick={onCancel}
            className="flex min-w-px flex-[1_0_0] items-center justify-center rounded-[12px] border-[1.5px] border-solid border-grey-60 bg-white px-[26px] py-[14px]"
          >
            <span className="whitespace-nowrap text-[18px] font-semibold tracking-[-0.36px] text-grey-80">
              로그아웃 하지않기
            </span>
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex min-w-px flex-[1_0_0] items-center justify-center rounded-[12px] bg-grey-80 px-[26px] py-[14px]"
          >
            <span className="whitespace-nowrap text-[18px] font-semibold tracking-[-0.36px] text-white">
              로그아웃
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
