import { useState } from "react";
import clearEmptyIcon from "../../assets/icons/clear1.svg";
import clearFilledIcon from "../../assets/icons/clear2.svg";
import eyeOffIcon from "../../assets/icons/eye-off.svg";
import eyeOnIcon from "../../assets/icons/eye-on.svg";

export default function AuthTextField({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  helperText,
}) {
  const isPassword = type === "password";
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="flex w-full flex-col items-start gap-[8px]">
      <div className="flex w-full flex-col items-start gap-[6px]">
        <label
          htmlFor={id}
          className="w-full text-[14px] font-medium leading-[normal] tracking-[-0.28px] text-grey-70"
        >
          {label}
        </label>

        <div className="flex w-full flex-col items-center gap-[6px]">
          <div className="flex w-full items-center justify-between gap-[8px]">
            <input
              id={id}
              type={isPassword && !revealed ? "password" : "text"}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              autoComplete={autoComplete}
              className="min-w-0 flex-1 bg-transparent text-[16px] font-semibold leading-[normal] text-grey-90 placeholder:font-semibold placeholder:text-[#D6D9E2] focus:outline-none"
            />

            {isPassword ? (
              <button
                type="button"
                onClick={() => setRevealed((prev) => !prev)}
                className="size-[16px] shrink-0 cursor-pointer border-none bg-transparent p-0"
              >
                <img
                  src={eyeOffIcon}
                  alt={revealed ? "비밀번호 숨기기" : "비밀번호 보기"}
                  className={`h-full w-full object-contain ${
                    revealed ? "opacity-100" : "opacity-40"
                  }`}
                />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onChange("")}
                disabled={!value}
                className="size-[16px] shrink-0 cursor-pointer border-none bg-transparent p-0 disabled:cursor-default"
              >
                <img
                  src={value ? clearFilledIcon : clearEmptyIcon}
                  alt="지우기"
                  className="h-full w-full object-contain"
                />
              </button>
            )}
          </div>

          <div className="h-[1.5px] w-full shrink-0 bg-grey-30" />
        </div>
      </div>

      {helperText && (
        <p className="w-full text-[14px] font-normal leading-[normal] tracking-[-0.28px] text-grey-50">
          {helperText}
        </p>
      )}
    </div>
  );
}
