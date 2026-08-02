import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logoImage from "../assets/logos/logo-full.png";

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    // 2.5초 뒤 로그인 페이지로 이동 (뒤로가기 방지 replace: true 적용)
    const timer = setTimeout(() => {
      navigate("/login", { replace: true });
    }, 2500);

    // 컴포넌트 언마운트 시 타이머 종료시킴
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    // 전체 화면 컨테이너
    <div className="flex flex-col items-center min-h-screen bg-white animate-fade-in">
      {/* 상단 여백 : 전체 높이의 34% */}
      <div className="flex-none" style={{ height: "34%" }}></div>

      {/* 로고 영역 : 전체 높이의 26% */}
      <div className="flex-1 flex items-center justify-center w-full px-8">
        <img
          src={logoImage}
          alt="DAY BIT Logo"
          className="w-auto h-auto max-w-[220px] max-h-[220px] object-contain"
        />
      </div>

      {/* 하단 여백 : 전체 높이의 40%) */}
      <div className="flex-none" style={{ height: "40%" }}></div>
    </div>
  );
}
