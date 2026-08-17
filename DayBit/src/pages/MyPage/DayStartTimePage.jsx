import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../api/apiClient";
import backIcon from "../../assets/icons/back.svg";
import logoSymbol from "../../assets/logos/logo-symbol.svg";

const PRESET_TIMES = [
  { label: "오전12시", value: "00:00" },
  { label: "오전1시", value: "01:00" },
  { label: "오전2시", value: "02:00" },
  { label: "오전3시", value: "03:00" },
  { label: "오전4시", value: "04:00" },
  { label: "오전5시", value: "05:00" },
];

export default function DayStartTimePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let alive = true;
    apiClient
      .get("/api/me")
      .then((response) => {
        if (!alive) return;
        const result = response.data.result;
        setProfile(result);
        setSelectedTime(result?.dayStartTime ?? null);
      })
      .catch((error) => {
        console.error(
          "GET /api/me 실패:",
          error.response?.status,
          error.response?.data,
        );
      })
      .finally(() => {
        if (alive) setIsLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const handleSubmit = async () => {
    if (!profile || !selectedTime || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await apiClient.patch("/api/me", {
        nickname: profile.nickname,
        job: profile.job,
        reminderTime: profile.reminderTime,
        dayStartTime: selectedTime,
        aiMemoryConsent: profile.aiMemoryConsent,
      });
      navigate(-1);
    } catch (error) {
      alert("하루 전환시간을 저장하지 못했어요. 다시 시도해주세요.");
      console.error(
        "PATCH /api/me 실패:",
        error.response?.status,
        error.response?.data,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex h-full w-full select-none flex-col bg-[#F6F8FA]">
      <div className="flex flex-1 flex-col gap-[60px] overflow-y-auto py-[16px] pl-[16px] pr-[20px] scrollbar-hide">
        <div className="flex w-full flex-col items-start gap-[60px]">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="size-[32px] shrink-0 cursor-pointer"
          >
            <img
              src={backIcon}
              alt="뒤로가기"
              className="h-full w-full object-contain"
            />
          </button>

          <div className="flex w-full flex-col items-start px-[16px]">
            <div className="flex flex-col items-start gap-[17px]">
              <img
                src={logoSymbol}
                alt=""
                className="h-[61px] w-[48px] object-cover"
              />
              <div className="flex flex-col items-start gap-[2px] whitespace-nowrap text-[20px] font-semibold leading-[normal] tracking-[-0.4px] text-[#2D3038]">
                <p>일기작성이 초기화 되는</p>
                <p>하루 전환시간을 설정할게요.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col items-start px-[16px]">
          <div className="flex w-full flex-col items-start gap-[16px]">
            +{" "}
            <div className="flex flex-col items-start gap-[6px] whitespace-nowrap">
              {" "}
              <p className="text-[20px] font-semibold leading-[normal] tracking-[-0.4px] text-[#2D3038]">
                몇시에 하루를 전환할까요?
              </p>
              <p className="text-[12px] font-normal leading-[normal] tracking-[-0.12px] text-[#787E8C]">
                언제든지 변경할 수 있어요.
              </p>
            </div>
            <div className="flex w-full flex-col items-start gap-[8px]">
              {[PRESET_TIMES.slice(0, 3), PRESET_TIMES.slice(3, 6)].map(
                (row, rowIdx) => (
                  <div
                    key={rowIdx}
                    className="flex w-full items-center gap-[8px]"
                  >
                    {row.map((time) => {
                      const isSelected = selectedTime === time.value;
                      const widthClass =
                        time.value === "01:00" ? "w-[75px]" : "w-[79px]";
                      return (
                        <button
                          key={time.value}
                          type="button"
                          onClick={() => setSelectedTime(time.value)}
                          className={`flex shrink-0 items-center justify-center whitespace-nowrap rounded-[38px] border px-[12px] py-[8px] text-[16px] leading-[normal] ${
                            isSelected
                              ? "border-[#4F5563] font-semibold text-[#2D3038]"
                              : `${widthClass} border-[#DFE2EA] font-medium tracking-[-0.32px] text-[#AFB6C4]`
                          }`}
                        >
                          {time.label}
                        </button>
                      );
                    })}
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full shrink-0 flex-col items-start px-[16px] py-[10px]">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading || isSubmitting || !selectedTime}
          className="flex w-full items-center justify-center rounded-[12px] bg-[#4F5563] px-[26px] py-[14px] text-[18px] font-semibold leading-[normal] tracking-[-0.36px] text-white text-shadow-[0px_0px_2px_rgba(0,0,0,0.05)] disabled:opacity-50"
        >
          완료
        </button>
      </div>
    </div>
  );
}
