import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/apiClient";

const KakaoCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    //주소창에서 accessToken 꺼내오기
    const token = searchParams.get("accessToken");

    if (token) {
      console.log("카카오 로그인 성공! 토큰:", token);

      //로컬 스토리지에 토큰 및 로그인 상태 저장
      localStorage.setItem("accessToken", token);
      localStorage.setItem("isLoggedIn", "true");

      //홈 화면으로 이동
      navigate("/onboarding", { replace: true });
    } else {
      // 주소창에 토큰이 없다면 에러 처리
      console.error("토큰을 찾을 수 없습니다.");
      alert("카카오 로그인에 실패했습니다.");
    }
  }, [searchParams, navigate]);

  return (
    <div className="w-full h-screen flex items-center justify-center text=white text-2xl">
      <p className="text-lg font-medium text-gray-300">
        카카오 로그인 처리 중입니다...
      </p>
    </div>
  );
};
export default KakaoCallback;
