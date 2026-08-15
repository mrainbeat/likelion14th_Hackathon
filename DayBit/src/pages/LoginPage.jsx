import { useNavigate } from "react-router-dom";
import LogoSymbol from "../assets/logos/logo-symbol.svg";
import LogoText from "../assets/logos/logo-text.svg";
import KakaoLoginButton from "../assets/buttons/kakaologinbutton.svg";
import OtherLoginButton from "../assets/buttons/otherloginbutton.svg";

export default function LoginPage() {
  const navigate = useNavigate();

  const handleKakaoLogin = (e) => {
    e.preventDefault();
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/oauth2/authorization/kakao`;
  };

  const handleOtherLogin = () => {
    navigate("/login/email");
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
            className="h-full w-full object-contain"
          />
        </button>

        <button
          type="button"
          onClick={handleOtherLogin}
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
