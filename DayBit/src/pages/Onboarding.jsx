import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LogoSymbol from "../assets/logos/logo-symbol.svg";

export default function Onboarding() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    const savedNickname = localStorage.getItem("nickname");
    if (savedNickname) {
      setNickname(savedNickname);
    }
  }, []);

  const handleNicknameChange = (e) => {
    const value = e.target.value;
    if (value.length <= 8) {
      setNickname(value);
      localStorage.setItem("nickname", value);
    }
  };

  const handleClear = () => {
    setNickname("");
    localStorage.removeItem("nickname");
  };

  const isValid = nickname.length >= 2 && nickname.length <= 8;

  const handleNext = () => {
    if (isValid) {
      navigate("/onboarding/next", { replace: true });
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F6F8FA] px-[9.23%] pt-[6%] pb-[6%] select-none w-full justify-between">
      {/* 상단 영역 */}
      <div className="flex flex-col w-full">
        {/* 상단 4단계 진행 바 (비율 기반 간격 및 높이) */}
        <div className="flex gap-[3%] w-full mb-[10%]">
          <div className="h-[4px] flex-1 rounded-full bg-[#2D3038]"></div>
          <div className="h-[4px] flex-1 rounded-full bg-[#CDD1DA]"></div>
          <div className="h-[4px] flex-1 rounded-full bg-[#CDD1DA]"></div>
          <div className="h-[4px] flex-1 rounded-full bg-[#CDD1DA]"></div>
        </div>

        {/* 로고 심볼 (가로 폭 기준 퍼센트 비율 고정) */}
        <div className="w-[13%] aspect-[48/61] mb-[8%] flex items-center">
          <img
            src={LogoSymbol}
            alt="Logo Symbol"
            className="w-full h-full object-contain"
          />
        </div>

        {/* 타이틀 영역 */}
        <h1 className="text-[clamp(18px,5.2vw,22px)] font-bold text-[#2D3038] leading-[1.3] mb-[3%] tracking-tight">
          안녕하세요, 전 데이비이에요 :)
          <br />
          뭐라고 부르면 될까요?
        </h1>
        <p className="text-[clamp(11px,3.2vw,13px)] text-[#858C9C] mb-[12%]">
          설정에서 언제든지 변경 가능해요
        </p>

        {/* 닉네임 입력 박스 */}
        <div className="flex flex-col w-full">
          <label className="text-[12px] text-[#5F6473] mb-[2%] font-medium">
            닉네임
          </label>
          <div className="relative flex items-center border-b border-[#CDD1DA] pb-2 focus-within:border-[#2D3038] transition-colors">
            <input
              type="text"
              value={nickname}
              onChange={handleNicknameChange}
              placeholder="제임스"
              className="w-full bg-transparent text-[18px] text-[#2D3038] placeholder-[#CDD1DA] focus:outline-none"
            />
            {nickname && (
              <button
                type="button"
                onClick={handleClear}
                className="w-6 h-6 flex items-center justify-center rounded-full bg-[#CDD1DA] text-white text-xs hover:bg-[#858C9C] transition-colors"
              >
                ✕
              </button>
            )}
          </div>
          <p className="text-[11px] text-[#858C9C] mt-[2%]">
            2~ 8자로 입력해주세요.
          </p>
        </div>
      </div>

      {/* 하단 다음 버튼 (비율형 패딩 적용) */}
      <button
        type="button"
        disabled={!isValid}
        onClick={handleNext}
        className={`w-full py-[4%] rounded-xl font-semibold text-white transition-all ${
          isValid
            ? "bg-[#2D3038] active:scale-[0.98]"
            : "bg-[#CDD1DA] cursor-not-allowed"
        }`}
      >
        다음
      </button>
    </div>
  );
}
