import { useNavigate } from "react-router-dom";
import LogoFull from "../assets/logos/logo-full.png";
import KakaoLoginButton from "../assets/buttons/kakaologinbutton.svg";
import OtherLoginButton from "../assets/buttons/otherloginbutton.svg";

export default function LoginPage() {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    navigate("/onboarding", { replace: true });
  };

  return (
    <div className="relative h-full w-full select-none overflow-hidden bg-[#F6F8FA]">
      <img
        src={LogoFull}
        alt="DAY BIT"
        className="pointer-events-none absolute left-1/2 top-[205px] w-[134px] -translate-x-1/2 object-contain"
      />

      <div className="absolute left-[20px] top-[471px] flex w-[350px] flex-col gap-[12px]">
        <button
          type="button"
          onClick={handleLoginSuccess}
          className="h-[51px] w-full transition-transform active:scale-[0.98]"
        >
          <img
            src={KakaoLoginButton}
            alt="카카오톡으로 시작하기"
            className="h-full w-full object-contain"
          />
        </button>

        <button
          type="button"
          onClick={handleLoginSuccess}
          className="h-[51px] w-full transition-transform active:scale-[0.98]"
        >
          <img
            src={OtherLoginButton}
            alt="다른 방법으로 시작하기"
            className="h-full w-full object-contain"
          />
        </button>
      </div>
    </div>
  );
}
