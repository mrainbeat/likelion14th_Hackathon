import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../api/apiClient";

function KakaoCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const confirmLogin = async () => {
      try {
        const response = await apiClient.get("/api/me");
        const user = response.data.result;

        if (user.onboardingCompleted) {
          navigate("/diary", { replace: true });
        } else {
          navigate("/onboarding", { replace: true });
        }
      } catch {
        navigate("/login", { replace: true });
      }
    };

    confirmLogin();
  }, [navigate]);

  return null;
}

export default KakaoCallbackPage;
