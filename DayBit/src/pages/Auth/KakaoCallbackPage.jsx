import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../api/apiClient";

function KakaoCallbackPage() {
  const [message, setMessage] = useState("로그인 정보를 확인하고 있습니다.");
  const navigate = useNavigate();

  useEffect(() => {
    const confirmLogin = async () => {
      try {
        const response = await apiClient.get("/api/me");
        const user = response.data.result;
        setMessage(`${user.nickname}님, 로그인 연동에 성공했습니다.`);
        console.log("로그인 사용자:", user);

        // 온보딩 이미 했으면 일기 화면으로, 아니면 온보딩으로
        if (user.onboardingCompleted) {
          navigate("/diary", { replace: true });
        } else {
          navigate("/onboarding", { replace: true });
        }
      } catch (error) {
        setMessage("로그인 콜백에는 도착했지만 인증 확인에 실패했습니다.");
        console.error(
          "GET /api/me 실패:",
          error.response?.status,
          error.response?.data,
        );
      }
    };
    confirmLogin();
  }, [navigate]);

  return (
    <main>
      <h1>카카오 로그인</h1>
      <p>{message}</p>
    </main>
  );
}

export default KakaoCallbackPage;
