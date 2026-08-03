import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LogoFull from "../assets/logos/logo-full.png";

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
      <img
        src={LogoFull}
        alt="DAY BIT"
        className="pointer-events-none absolute left-1/2 top-[33.9dvh] w-[156px] -translate-x-1/2 object-contain"
      />
    </div>
  );
}
