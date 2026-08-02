import React from "react";
import { useNavigate } from "react-router-dom";
import KakaoLoginButton from "/src/assets/buttons/kakaologinbutton.svg";
import OtherLoginButton from "/src/assets/buttons/otherloginbutton.svg";
import LogoImage from "/src/assets/logos/logo-full.png";

export default function LoginPage() {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    navigate("/onboarding", { replace: true });
  };

  return (
    <div className="flex flex-col items-center h-[100dvh] bg-[#F6F8FA] w-full overflow-hidden select-none">
      {/* 상단 여백 */}
      <div className="h-[28vh] shrink-0"></div>

      {/* 로고 영역 */}
      <div className="w-[38vw] max-w-[150px] shrink-0 flex justify-center">
        <img
          src={LogoImage}
          alt="Logo"
          className="w-full h-auto object-contain"
        />
      </div>

      {/* 로고와 버튼 위치 조정을 위한 중앙 여백 */}
      <div className="flex-1"></div>

      {/* 하단 버튼 영역  */}
      <div className="w-[90vw] max-w-[400px] flex flex-col gap-[1.5vh] pb-[22vh] shrink-0">
        <button
          type="button"
          onClick={handleLoginSuccess}
          className="w-full aspect-[350/50] transition-transform active:scale-[0.98] focus:outline-none"
        >
          <img
            src={KakaoLoginButton}
            alt="카카오톡으로 시작하기"
            className="w-full h-full object-contain"
          />
        </button>

        <button
          type="button"
          onClick={handleLoginSuccess}
          // 버튼 가로 세로 비율 고정
          className="w-full aspect-[350/50] transition-transform active:scale-[0.98] focus:outline-none"
        >
          <img
            src={OtherLoginButton}
            alt="다른 방법으로 시작하기"
            className="w-full h-full object-contain"
          />
        </button>
      </div>
    </div>
  );
}
