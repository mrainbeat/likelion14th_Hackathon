import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup, resolveDestinationAfterAuth } from "./auth";
import backIcon from "../../assets/icons/back.svg";

export default function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || isSubmitting) return;

    setIsSubmitting(true);
    setError("");
    try {
      await signup(email.trim(), password);
      const destination = await resolveDestinationAfterAuth();
      navigate(destination, { replace: true });
    } catch (err) {
      console.error(
        "POST /api/auth/signup 실패:",
        err.response?.status,
        err.response?.data,
      );
      setError(
        err.response?.data?.message ??
          "회원가입에 실패했어요. 잠시 후 다시 시도해주세요.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative h-full w-full select-none overflow-hidden bg-[#F6F8FA]">
      <div className="flex w-full items-center px-[20px] pt-[48px]">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="size-[32px] shrink-0 cursor-pointer bg-transparent border-none p-0 transition-opacity active:opacity-60"
        >
          <img
            src={backIcon}
            alt="뒤로가기"
            className="h-full w-full object-contain"
          />
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex w-full flex-col items-center pt-[27px]"
      >
        <div className="flex w-full flex-col gap-[13px] items-center">
          <div className="flex w-full flex-col gap-[55px] items-start px-[20px]">
            <p className="w-full text-[20px] font-semibold tracking-[-0.2px] text-grey-90">
              회원가입
            </p>

            <div className="flex w-full flex-col gap-[8px] items-start">
              <label
                htmlFor="email"
                className="w-full text-[16px] font-medium text-grey-90"
              >
                이메일
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일을 입력해주세요."
                autoComplete="email"
                className="w-full border-b border-solid border-grey-30 bg-transparent py-[10px] text-[14px] font-medium text-grey-90 placeholder-grey-40 focus:outline-none"
              />
            </div>

            <div className="flex w-full flex-col gap-[8px] items-start">
              <label
                htmlFor="password"
                className="w-full text-[16px] font-medium text-grey-90"
              >
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력해주세요."
                autoComplete="new-password"
                className="w-full border-b border-solid border-grey-30 bg-transparent py-[10px] text-[14px] font-medium text-grey-90 placeholder-grey-40 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex w-[350px] flex-col gap-[17px] items-center">
            {error && (
              <p className="w-full text-[13px] font-medium text-red-500">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="flex w-full items-center justify-center rounded-[12px] bg-grey-70 px-[10px] py-[16px] text-[16px] font-semibold text-grey-0 disabled:bg-grey-20 disabled:text-grey-0"
            >
              {isSubmitting ? "가입 중..." : "회원가입"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/login/email")}
              className="whitespace-nowrap text-[12px] font-medium text-grey-90"
            >
              이미 계정이 있어요
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
