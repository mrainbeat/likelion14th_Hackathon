import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup, resolveDestinationAfterAuth } from "./auth";
import AuthTextField from "./AuthTextField";
import backIcon from "../../assets/icons/back.svg";

export default function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length >= 8;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || isSubmitting) return;

    setIsSubmitting(true);
    setError("");
    try {
      const response = await signup(email.trim(), password);
      const destination = await resolveDestinationAfterAuth(
        response.data.result,
      );
      navigate(destination, { replace: true });
    } catch (err) {
      console.error(
        "POST /api/auth/signup 실패:",
        err.response?.status,
        err.response?.data,
      );
      const status = err.response?.status;
      setError(
        status === 400 || status === 409
          ? "이미 가입된 이메일이거나 형식이 올바르지 않아요. 다시 확인해주세요."
          : "회원가입에 실패했어요. 잠시 후 다시 시도해주세요.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex h-full w-full select-none flex-col overflow-y-auto bg-[#F6F8FA] px-[16px] py-[16px] scrollbar-hide">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="size-[32px] shrink-0 cursor-pointer bg-transparent p-0 transition-opacity active:opacity-60"
      >
        <img
          src={backIcon}
          alt="뒤로가기"
          className="h-full w-full object-contain"
        />
      </button>

      <form
        onSubmit={handleSubmit}
        className="flex w-full flex-col items-center gap-[80px] pb-[16px] pt-[30px]"
      >
        <div className="flex w-full flex-col items-start gap-[100px] px-[16px]">
          <p className="w-full text-[22px] font-semibold leading-[normal] tracking-[-0.66px] text-grey-90">
            회원가입
          </p>

          <div className="flex w-full flex-col items-start gap-[56px]">
            <AuthTextField
              id="email"
              label="이메일"
              value={email}
              onChange={setEmail}
              placeholder="이메일을 입력해주세요."
              autoComplete="email"
            />
            <AuthTextField
              id="password"
              label="비밀번호"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="비밀번호를 입력해주세요."
              autoComplete="new-password"
              helperText="8자 이상 입력해주세요."
            />
          </div>
        </div>

        <div className="flex w-full flex-col items-center gap-[12px]">
          {error && (
            <p className="w-full px-[16px] text-[13px] font-medium leading-[1.5] text-red-500">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit || isSubmitting}
            className="flex h-[49px] w-full items-center justify-center rounded-[12px] bg-grey-80 px-[26px] text-[18px] font-semibold leading-[normal] tracking-[-0.36px] text-white text-shadow-[0px_0px_2px_rgba(0,0,0,0.05)] disabled:bg-grey-20"
          >
            {isSubmitting ? "가입 중..." : "회원가입"}
          </button>
        </div>
      </form>
    </div>
  );
}
