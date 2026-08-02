import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LogoSymbol from "../assets/logos/logo-symbol.png";

export default function OnboardingJob() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");
  const [selectedJob, setSelectedJob] = useState("");
  const [customJob, setCustomJob] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    // 로컬에 저장한 닉네임 불러오기
    const savedNickname = localStorage.getItem("nickname");
    if (savedNickname) {
      setNickname(savedNickname);
    }
    // 다음 단계에서 뒤로 돌아왔을 때 이전에 선택한 직업을 불러오기
    const savedJob = localStorage.getItem("job");
    if (savedJob) {
      const isPreset = [
        "직장인",
        "대학생",
        "구직중",
        "쉬는중",
        "프리랜서",
      ].includes(savedJob);
      if (isPreset) {
        setSelectedJob(savedJob);
      } else {
        setSelectedJob("기타");
        setCustomJob(savedJob);
        setIsFocused(true);
      }
    }
  }, []);

  const jobs = ["직장인", "대학생", "구직중", "쉬는중", "프리랜서", "기타"];
  const currentStep = 2; // 2번째 온보딩 단계

  const handleJobSelect = (job) => {
    setSelectedJob(job);
    if (job !== "기타") {
      setCustomJob("");
      localStorage.setItem("job", job);
    } else {
      localStorage.setItem("job", customJob);
    }
  };

  const handleCustomJobChange = (e) => {
    const value = e.target.value;
    setCustomJob(value);
    localStorage.setItem("job", value);
  };

  const handleClear = () => {
    setCustomJob("");
    localStorage.removeItem("job");
  };

  // 기타일 때는 직접 입력한 값이 있어야 유효, 그 외에는 버튼이 선택되면 유효
  const isValid =
    selectedJob === "기타" ? customJob.trim().length > 0 : selectedJob !== "";

  const handleNext = () => {
    if (isValid) {
      navigate("/onboarding/next", { replace: true });
    }
  };

  // 버튼 노출 조건: 직업이 선택되었거나, 기타를 눌러서 포커스/입력 중일 때
  const showButton = selectedJob !== "";

  return (
    <div className="relative flex flex-col h-full bg-[#F6F8FA] select-none w-full box-border pt-[2.57vh] px-[9.23%] pb-[9.48vh] overflow-y-auto">
      {/* 전체 텍스트 뭉치 컨테이너 */}
      <div className="flex flex-col w-full">
        {/* 상단 진행 바 */}
        <div className="flex gap-[3%] w-full mb-[7.11vh]">
          <div className="h-[4px] flex-1 rounded-full bg-[#2D3038]"></div>
          <div className="h-[4px] flex-1 rounded-full bg-[#2D3038]"></div>
          <div className="h-[4px] flex-1 rounded-full bg-[#CDD1DA]"></div>
          <div className="h-[4px] flex-1 rounded-full bg-[#CDD1DA]"></div>
        </div>
        {/* 로고 심볼 */}
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
            좋아요 {nickname ? `${nickname}님!` : "회원님!"}
          </h1>
          <h1 className="text-[clamp(18px,5.2vw,22px)] font-bold text-[#2D3038] leading-[1.3] mb-[2/3vh] tracking-tight">
            일기작성을 돕기 위한 질문을 몇 개 할게요!
          </h1>
          <p className="text-[clamp(11px,3.2vw,13px)] text-[#858C9C]">
            설정에서 언제든지 변경 가능해요
          </p>
        </div>

        {/* 직업 선택 영역 */}
        <div className="flex flex-col w-full">
          <label className="text-[clamp(15px,4.2vw,18px)] font-bold text-[#2D3038] mb-[4%]">
            현재 어떤 일을 하고 있나요?
          </label>

          {/* 버튼 그리드 */}
          <div className="flex flex-wrap gap-[2.5%] gap-y-[12px] mb-[4%]">
            {jobs.map((job) => {
              const isSelected = selectedJob === job;
              return (
                <button
                  key={job}
                  type="button"
                  onClick={() => handleJobSelect(job)}
                  className={`flex items-center px-[12px] py-[5px] gap-[2px] rounded-full text-[clamp(13px,3.8vw,15px)] font-medium transition-all border ${
                    isSelected
                      ? "border-[#2D3038] text-[#2D3038] bg-white shadow-xs font-semibold"
                      : "border-[#DFE2EA] text-[#AFB6C4] bg-transparent hover:border-[#858C9C] hover:text-[#5F6473]"
                  }`}
                >
                  {job}
                </button>
              );
            })}
          </div>

          {/* 기타를 선택했을 때만 나타나는 직접 입력 박스 */}
          {selectedJob === "기타" && (
            <div className="flex flex-col w-full mt-[2%] animate-fade-in">
              <div className="relative flex items-center border-b border-[#CDD1DA] pb-[2%] focus-within:border-[#2D3038] transition-colors">
                <input
                  type="text"
                  value={customJob}
                  onChange={handleCustomJobChange}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="직업을 입력해주세요"
                  className="w-full bg-transparent text-[clamp(16px,4.5vw,18px)] text-[#2D3038] placeholder-[#CDD1DA] focus:outline-none"
                />
                {customJob && (
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
                직접 입력해주세요.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 하단 다음 버튼 */}
      {showButton && (
        <div className="absolute bottom-0 left-0 w-full z-50">
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
            다음
          </button>
        </div>
      )}
    </div>
  );
}
