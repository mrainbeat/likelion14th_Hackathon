import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient, { refreshCsrfToken } from "../api/apiClient";
import LogoSymbol from "../assets/logos/logo-symbol.svg";
import LogoText from "../assets/logos/logo-text.svg";

const SPLASH_MIN_MS = 2500;

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;

    const resolveDestination = async () => {
      try {
        const response = await apiClient.get("/api/me");
        const user = response.data.result;

        try {
          await refreshCsrfToken();
        } catch (csrfError) {
          console.error("GET /api/auth/csrf 실패:", csrfError);
        }

        return user.onboardingCompleted ? "/home" : "/onboarding";
      } catch (error) {
        if (error.response?.status !== 401) {
          console.error(
            "GET /api/me 실패:",
            error.response?.status,
            error.response?.data,
          );
        }
        return "/login";
      }
    };

    const minDelay = new Promise((resolve) =>
      setTimeout(resolve, SPLASH_MIN_MS),
    );

    Promise.all([resolveDestination(), minDelay]).then(([destination]) => {
      if (alive) navigate(destination, { replace: true });
    });

    return () => {
      alive = false;
    };
  }, [navigate]);

  return (
    <div className="relative h-full w-full select-none overflow-hidden bg-[#F6F8FA]">
      <div className="pointer-events-none absolute left-1/2 top-[33.9dvh] flex -translate-x-1/2 flex-col items-center gap-[16px]">
        <img src={LogoSymbol} alt="" className="w-[95px] object-contain" />
        <img
          src={LogoText}
          alt="DAY BIT"
          className="w-[153px] object-contain"
        />
      </div>
    </div>
  );
}
