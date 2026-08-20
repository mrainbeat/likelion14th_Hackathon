import { useNavigate } from "react-router-dom";
import LogoSymbol from "../assets/logos/logo-symbol.svg";
import LogoText from "../assets/logos/logo-text.svg";
import kakaoSymbol from "../assets/icons/kakao-symbol.svg";

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
          className="flex h-[51px] w-full items-center justify-center gap-[10px] rounded-[12px] bg-[#FEE500] transition-transform active:scale-[0.98]"
        >
          <img src={kakaoSymbol} alt="" className="h-[19.187px] w-[19.735px]" />
          <span className="text-[16px] font-semibold leading-[normal] text-black">
            카카오톡으로 시작하기
          </span>
        </button>

        <button
          type="button"
          onClick={handleOtherLogin}
          className="flex h-[51px] w-full items-center justify-center rounded-[12px] border border-solid border-[#787E8C] transition-transform active:scale-[0.98]"
        >
          <span className="text-[16px] font-semibold leading-[normal] text-black">
            다른 방법으로 시작하기
          </span>
        </button>
      </div>
    </div>
  );
}
