import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LogoSymbol from "../assets/logos/logo-symbol.svg";
import LogoText from "../assets/logos/logo-text.svg";
import KakaoLoginButton from "../assets/buttons/kakaologinbutton.svg";
import OtherLoginButton from "../assets/buttons/otherloginbutton.svg";
import ReviewPasscodeModal from "./Auth/ReviewPasscodeModal";
import {
  signupNextReviewAccount,
  resolveDestinationAfterAuth,
} from "./Auth/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPasscode, setShowPasscode] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const handleKakaoLogin = (e) => {
    e.preventDefault();
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/oauth2/authorization/kakao`;
  };

  const handleOtherLogin = () => {
    navigate("/login/email");
  };

  const handleReviewLogin = async () => {
    setShowPasscode(false);
    setIsCreating(true);
    setReviewError("");
    try {
      await signupNextReviewAccount();
      const destination = await resolveDestinationAfterAuth();
      navigate(destination, { replace: true });
    } catch (error) {
      console.error(
        "심사용 계정 생성 실패:",
        error.response?.status,
        error.response?.data ?? error.message,
      );
      setReviewError("계정을 만들지 못했어요. 잠시 후 다시 시도해주세요.");
      setIsCreating(false);
    }
  };

  return (
    <div className="relative h-full w-full select-none overflow-hidden bg-[#F6F8FA]">
      <div className="pointer-events-none absolute left-1/2 top-[205px] flex -translate-x-1/2 flex-col items-center gap-[14px]">
        <img src={LogoSymbol} alt="" className="w-[82px] object-contain" />
        <img
          src={LogoText}
          alt="DAY BIT"
          className="w-[131px] object-contain"
        />
      </div>

      <div className="absolute left-[16px] right-[16px] top-[471px] flex flex-col gap-[12px]">
        <button
          type="button"
          onClick={handleKakaoLogin}
          className="h-[51px] w-full transition-transform active:scale-[0.98]"
        >
          <img
            src={KakaoLoginButton}
            alt="카카오톡으로 시작하기"
            className="h-full w-full object-fill"
          />
        </button>

        <button
          type="button"
          onClick={() => setShowPasscode(true)}
          disabled={isCreating}
          className="flex h-[51px] w-full items-center justify-center rounded-[12px] bg-[#5F6473] text-[16px] font-semibold leading-[normal] text-white transition-transform active:scale-[0.98] disabled:opacity-50"
        >
          {isCreating ? "계정 만드는 중..." : "심사용 자동 로그인"}
        </button>

        <button
          type="button"
          onClick={handleOtherLogin}
          className="h-[51px] w-full transition-transform active:scale-[0.98]"
        >
          <img
            src={OtherLoginButton}
            alt="다른 방법으로 시작하기"
            className="h-full w-full object-fill"
          />
        </button>

        {reviewError && (
          <p className="text-center text-[13px] font-medium text-red-500">
            {reviewError}
          </p>
        )}
      </div>

      {showPasscode && (
        <ReviewPasscodeModal
          onClose={() => setShowPasscode(false)}
          onSuccess={handleReviewLogin}
        />
      )}
    </div>
  );
}
