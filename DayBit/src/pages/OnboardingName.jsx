import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LogoSymbol from "../assets/logos/logo-symbol.png";

export default function Onboarding() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const savedNickname = localStorage.getItem("nickname");
    if (savedNickname) {
      setNickname(savedNickname);
      if (savedNickname.length > 0) setIsFocused(true);
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

  const showButton = isFocused || nickname.length > 0;

  return (
    <div className="relative flex flex-col h-full bg-[#F6F8FA] select-none w-full box-border pt-[2.57vh] px-[9.23%] pb-[9.48vh] overflow-y-auto">
      {/* 전체 텍스트 뭉치 컨테이너 */}
      <div className="flex flex-col w-full">
        {/* 상단 진행 바 */}
        <div className="flex gap-[3%] w-full mb-[7.11vh]">
          <div className="h-[4px] flex-1 rounded-full bg-[#2D3038]"></div>
          <div className="h-[4px] flex-1 rounded-full bg-[#CDD1DA]"></div>
          <div className="h-[4px] flex-1 rounded-full bg-[#CDD1DA]"></div>
          <div className="h-[4px] flex-1 rounded-full bg-[#CDD1DA]"></div>
        </div>

        {/* 로고 (48x61 비율 유지) */}
        <div className="w-[15.09%] aspect-[48/61] flex items-center mb-[2vh]">
          <img
            src={LogoSymbol}
            alt="Logo Symbol"
            className="w-full h-full object-contain"
          />
        </div>

        {/* 타이틀 */}
        <div className="mb-[7.11vh]">
          <h1 className="text-[clamp(18px,5.2vw,22px)] font-bold text-[#2D3038] leading-[1.3] mb-[2/3vh] tracking-tight">
            안녕하세요, 전 데이빗이에요 :)
          </h1>
          <h1 className="text-[clamp(18px,5.2vw,22px)] font-bold text-[#2D3038] leading-[1.3] mb-[2/3vh] tracking-tight">
            뭐라고 부르면 될까요?
          </h1>
          <p className="text-[clamp(11px,3.2vw,13px)] text-[#858C9C]">
            설정에서 언제든지 변경 가능해요
          </p>
        </div>

        {/* 입력 박스 */}
        <div className="flex flex-col w-full">
          <label className="text-[clamp(11px,3vw,12px)] text-[#5F6473] mb-[2%] font-medium">
            닉네임
          </label>
          <div className="relative flex items-center border-b border-[#CDD1DA] pb-[2%] focus-within:border-[#2D3038] transition-colors">
            <input
              type="text"
              value={nickname}
              onChange={handleNicknameChange}
              onFocus={() => setIsFocused(true)}
              placeholder="제임스"
              className="w-full bg-transparent text-[clamp(16px,4.5vw,18px)] text-[#2D3038] placeholder-[#CDD1DA] focus:outline-none"
            />
            {nickname && (
              <button
                type="button"
                onClick={handleClear}
                className="w-[6%] aspect-square flex items-center justify-center rounded-full bg-[#CDD1DA] text-white text-[10px] hover:bg-[#858C9C] transition-colors"
              >
                ✕
              </button>
            )}
          </div>
          <p className="text-[clamp(10px,2.8vw,11px)] text-[#858C9C] mt-[2%]">
            2~ 8자로 입력해주세요.
          </p>
        </div>
      </div>

      {/* 하단 작성 완료 버튼 */}
      {/* 입력 중이 아닐 대는 보이지 않게 하고, 입력 중이거나 입력값이 있을 때만 보이도록 설정 */}
      {showButton && (
        <div className="absolute bottom-0 left-0 w-full z-50">
          {" "}
          <button
            type="button"
            disabled={!isValid}
            onClick={handleNext}
            className={`w-full py-[4.5%] font-semibold transition-all text-[clamp(14px,4vw,16px)] text-center ${
              isValid
                ? "bg-[#5F6473] text-white active:scale-[0.98]"
                : "bg-[#E7E9EE] text-[#FFF] cursor-not-allowed"
            }`}
          >
            작성 완료
          </button>
        </div>
      )}
    </div>
  );
}
