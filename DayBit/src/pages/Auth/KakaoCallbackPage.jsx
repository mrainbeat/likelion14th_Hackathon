import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient, { refreshCsrfToken } from "../../api/apiClient";

function KakaoCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const confirmLogin = async () => {
      try {
        const response = await apiClient.get("/api/me");
        const user = response.data.result;

        try {
          await refreshCsrfToken();
        } catch (csrfError) {
          console.error("GET /api/auth/csrf 실패:", csrfError);
        }

        if (user.onboardingCompleted) {
          navigate("/home", { replace: true });
        } else {
          navigate("/onboarding", { replace: true });
        }
      } catch (error) {
        console.error(
          "GET /api/me 실패:",
          error.response?.status,
          error.response?.data,
        );
        navigate("/login", { replace: true });
      }
    };

    confirmLogin();
  }, [navigate]);

  return null;
}

export default KakaoCallbackPage;
