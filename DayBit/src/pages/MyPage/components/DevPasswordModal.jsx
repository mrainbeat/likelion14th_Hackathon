import { useState } from "react";

export default function DevPasswordModal({ onClose, onSubmit }) {
  const [value, setValue] = useState("");
  const [hasError, setHasError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!value.trim()) return;
    if (!onSubmit(value)) {
      setHasError(true);
      setValue("");
    }
  };

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-[rgba(45,48,56,0.25)] backdrop-blur-[1px]"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="flex w-[350px] flex-col items-start gap-[16px] rounded-[12px] bg-[#F6F8FA] px-[16px] py-[20px]"
      >
        <p className="w-full text-[20px] font-semibold leading-[normal] tracking-[-0.4px] text-grey-90">
          암호를 입력해주세요
        </p>

        <input
          type="password"
          inputMode="numeric"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setHasError(false);
          }}
          placeholder="암호"
          className={`w-full rounded-[8px] border border-solid bg-white px-[12px] py-[10px] text-[16px] font-medium tracking-[0.2em] text-grey-90 placeholder-grey-40 placeholder:tracking-normal focus:outline-none ${
            hasError ? "border-red-400" : "border-grey-30"
          }`}
        />

        {hasError && (
          <p className="text-[13px] font-medium text-red-500">
            암호가 맞지 않아요.
          </p>
        )}

        <div className="flex w-full items-center gap-[14px]">
          <button
            type="button"
            onClick={onClose}
            className="flex h-[46px] min-w-px flex-[1_0_0] items-center justify-center rounded-[12px] border-[1.5px] border-solid border-grey-60 bg-white px-[26px]"
          >
            <span className="whitespace-nowrap text-[16px] font-semibold tracking-[-0.32px] text-grey-80">
              닫기
            </span>
          </button>
          <button
            type="submit"
            disabled={!value.trim()}
            className="flex h-[46px] min-w-px flex-[1_0_0] items-center justify-center rounded-[12px] bg-grey-80 px-[26px] disabled:bg-grey-20"
          >
            <span className="whitespace-nowrap text-[16px] font-semibold tracking-[-0.32px] text-white">
              확인
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
