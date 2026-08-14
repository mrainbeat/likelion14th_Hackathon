import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LogoSymbol from "../assets/logos/logo-symbol.svg";
import LogoText from "../assets/logos/logo-text.svg";

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login", { replace: true });
    }, 2500);
    return () => clearTimeout(timer);
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
