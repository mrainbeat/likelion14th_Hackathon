import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, resolveDestinationAfterAuth } from "./auth";
import backIcon from "../../assets/icons/back.svg";

const TEST_ACCOUNTS = [
  { email: "test1@naver.com", password: "12341234" },
  { email: "test2@naver.com", password: "12341234" },
  { email: "test3@naver.com", password: "12341234" },
  { email: "test4@naver.com", password: "12341234" },
  { email: "test5@naver.com", password: "12341234" },
];

export default function EmailLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAutoLoggingIn, setIsAutoLoggingIn] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || isSubmitting) return;

    setIsSubmitting(true);
    setError("");
    try {
      await login(email.trim(), password);
      const destination = await resolveDestinationAfterAuth();
      navigate(destination, { replace: true });
    } catch (err) {
      console.error(
        "POST /api/auth/login 실패:",
        err.response?.status,
        err.response?.data,
      );
      setError(
        err.response?.data?.message ??
          "이메일 또는 비밀번호를 다시 확인해주세요.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutoLogin = async () => {
    if (isAutoLoggingIn) return;

    setIsAutoLoggingIn(true);
    setError("");
    const account =
      TEST_ACCOUNTS[Math.floor(Math.random() * TEST_ACCOUNTS.length)];
    try {
      await login(account.email, account.password);
      const destination = await resolveDestinationAfterAuth();
      navigate(destination, { replace: true });
    } catch (err) {
      console.error(
        "POST /api/auth/login 실패 (심사용 자동 로그인):",
        err.response?.status,
        err.response?.data,
      );
      setError("자동 로그인에 실패했어요.");
      setIsAutoLoggingIn(false);
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
              로그인
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
                autoComplete="current-password"
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
              {isSubmitting ? "로그인 중..." : "로그인"}
            </button>

            <div className="flex flex-wrap items-center gap-[16px]">
              <button
                type="button"
                onClick={handleAutoLogin}
                disabled={isAutoLoggingIn}
                className="whitespace-nowrap text-[12px] font-medium text-grey-90 disabled:opacity-50"
              >
                {isAutoLoggingIn ? "로그인 중..." : "심사용 자동 로그인"}
              </button>
              <div className="h-[14px] w-px bg-grey-30" />
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="whitespace-nowrap text-[12px] font-medium text-grey-90"
              >
                회원가입
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
