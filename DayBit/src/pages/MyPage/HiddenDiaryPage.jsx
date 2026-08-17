import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../api/apiClient";
import UnhideConfirmModal from "./components/UnhideConfirmModal";
import backIcon from "../../assets/icons/back.svg";
import profileIcon from "../../assets/icons/profile.svg";
import unhideIcon from "../../assets/icons/trash-restore.svg";

function formatDateLabel(recordedDate) {
  const [, month, day] = recordedDate.split("-").map(Number);
  return `${month}월 ${day}일`;
}

function formatTimeLabel(createdAt) {
  const d = new Date(createdAt);
  const hours24 = d.getHours();
  const period = hours24 < 12 ? "AM" : "PM";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${period} ${hours12}:${minutes}`;
}

export default function HiddenDiaryPage() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [unhideTarget, setUnhideTarget] = useState(null);

  const fetchHidden = useCallback(() => {
    setIsLoading(true);
    setErrorMessage("");
    apiClient
      .get("/api/v1/diaries/hidden")
      .then((res) => {
        setEntries(res.data?.result ?? []);
      })
      .catch((error) => {
        console.error(
          "GET /api/v1/diaries/hidden 실패:",
          error.response?.status,
          error.response?.data,
        );
        setErrorMessage("숨긴 일기를 불러오지 못했어요.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchHidden();
  }, [fetchHidden]);

  const handleUnhideConfirmed = async () => {
    if (!unhideTarget) return;
    try {
      await apiClient.patch(`/api/v1/diaries/${unhideTarget.diaryId}/unhide`);
      setEntries((prev) =>
        prev.filter((e) => e.diaryId !== unhideTarget.diaryId),
      );
      setUnhideTarget(null);
    } catch (error) {
      console.error(
        "PATCH /api/v1/diaries/{diaryId}/unhide 실패:",
        error.response?.status,
        error.response?.data,
      );
      alert("숨김 해제에 실패했어요. 잠시 후 다시 시도해주세요.");
    }
  };

  return (
    <div className="relative flex h-full w-full select-none flex-col overflow-y-auto bg-[#F6F8FA] px-[16px] py-[16px] scrollbar-hide">
      <div className="flex w-full items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="size-[32px] shrink-0 cursor-pointer bg-transparent p-0 transition-opacity active:opacity-60"
        >
          <img
            src={backIcon}
            alt="뒤로가기"
            className="h-full w-full object-contain"
          />
        </button>
        <button
          type="button"
          onClick={() => navigate("/mypage")}
          className="size-[38px] shrink-0 cursor-pointer rounded-full border-none bg-transparent p-0 transition-opacity active:opacity-60"
        >
          <img
            src={profileIcon}
            alt="프로필"
            className="h-full w-full object-contain"
          />
        </button>
      </div>

      <div className="flex w-full flex-col items-start gap-[18px] pt-[24px]">
        <p className="w-full text-[22px] font-semibold leading-[normal] tracking-[-0.66px] text-[#2D3038]">
          숨긴일기
        </p>

        {isLoading ? null : errorMessage ? (
          <p className="w-full py-[40px] text-center text-[14px] font-medium text-grey-70">
            {errorMessage}
          </p>
        ) : entries.length === 0 ? (
          <p className="w-full py-[40px] text-center text-[14px] font-medium text-grey-70">
            숨긴 일기가 없어요.
          </p>
        ) : (
          <div className="flex w-full flex-col gap-[20px]">
            {entries.map((entry, i) => (
              <div
                key={entry.diaryId}
                className="flex w-full flex-col gap-[20px]"
              >
                <div className="flex w-full flex-col items-start gap-[8px]">
                  <div className="flex w-full items-center justify-between">
                    <p className="text-[18px] font-semibold leading-[normal] tracking-[-0.36px] text-[#2D3038]">
                      {formatDateLabel(entry.recordedDate)}
                    </p>
                    <button
                      type="button"
                      onClick={() => setUnhideTarget(entry)}
                      className="flex h-[20px] w-[21px] shrink-0 cursor-pointer items-center justify-center border-none bg-transparent p-0"
                    >
                      <img
                        src={unhideIcon}
                        alt="숨김 해제"
                        className="h-full w-full object-contain"
                      />
                    </button>
                  </div>
                  <div className="flex w-full min-w-0 items-center gap-[5px] text-[14px] font-medium leading-[normal] tracking-[-0.28px] text-[#5F6473]">
                    <p className="shrink-0">
                      {formatTimeLabel(entry.createdAt)}
                    </p>
                    <p className="min-w-0 flex-1 truncate">{entry.content}</p>
                  </div>
                </div>
                {i < entries.length - 1 && (
                  <div
                    className="h-[1px] w-full"
                    style={{
                      background:
                        "linear-gradient(90deg, rgba(205, 209, 218, 0.00) 0%, #CDD1DA 15%, #CDD1DA 84.62%, rgba(205, 209, 218, 0.00) 100%)",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {unhideTarget && (
        <UnhideConfirmModal
          month={Number(unhideTarget.recordedDate.split("-")[1])}
          day={Number(unhideTarget.recordedDate.split("-")[2])}
          onCancel={() => setUnhideTarget(null)}
          onConfirm={handleUnhideConfirmed}
        />
      )}
    </div>
  );
}
