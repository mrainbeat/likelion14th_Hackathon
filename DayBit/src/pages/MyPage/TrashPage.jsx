import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../api/apiClient";
import PermanentDeleteConfirmModal from "./components/PermanentDeleteConfirmModal";
import backIcon from "../../assets/icons/back.svg";
import profileIcon from "../../assets/icons/profile.svg";
import trashRestoreIcon from "../../assets/icons/trash-restore.svg";
import trashClearIcon from "../../assets/icons/trash-clear.svg";

function formatDateLabel(recordedDate) {
  const [, month, day] = recordedDate.split("-").map(Number);
  return `${month}월 ${day}일`;
}

function formatTimeLabel(createdAt) {
  const timePart = createdAt.split("T")[1] ?? "00:00:00";
  const [hourStr, minuteStr] = timePart.split(":");
  let hour = Number(hourStr);
  const minute = (minuteStr ?? "00").padStart(2, "0");
  const period = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${period} ${hour}:${minute}`;
}

function daysRemaining(deletedAt) {
  const datePart = deletedAt.split("T")[0];
  const [y, m, d] = datePart.split("-").map(Number);
  const deletedDate = new Date(y, m - 1, d);
  const today = new Date();
  const todayDateOnly = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const elapsedDays = Math.floor((todayDateOnly - deletedDate) / 86400000);
  return Math.max(0, 30 - elapsedDays);
}

export default function TrashPage() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [restoringId, setRestoringId] = useState(null);
  const [permanentDeleteTarget, setPermanentDeleteTarget] = useState(null);

  const fetchTrash = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const res = await apiClient.get("/api/v1/diaries/trash");
      const items = res.data?.result ?? [];
      setEntries(items);
    } catch (err) {
      setErrorMessage("휴지통을 불러오지 못했어요.");
      console.error(
        "GET /api/v1/diaries/trash 실패:",
        err.response?.status,
        err.response?.data,
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrash();
  }, [fetchTrash]);

  const handleRestore = async (diaryId) => {
    if (restoringId) return;
    setRestoringId(diaryId);
    try {
      await apiClient.patch(`/api/v1/diaries/trash/${diaryId}/restore`);
      setEntries((prev) => prev.filter((entry) => entry.diaryId !== diaryId));
    } catch (err) {
      alert("일기를 복원하지 못했어요. 다시 시도해주세요.");
      console.error(
        "PATCH /api/v1/diaries/trash/{diaryId}/restore 실패:",
        err.response?.status,
        err.response?.data,
      );
    } finally {
      setRestoringId(null);
    }
  };

  const handlePermanentDeleteConfirmed = async () => {
    if (!permanentDeleteTarget) return;
    const { diaryId } = permanentDeleteTarget;
    setPermanentDeleteTarget(null);
    try {
      await apiClient.delete(`/api/v1/diaries/trash/${diaryId}`);
      setEntries((prev) => prev.filter((entry) => entry.diaryId !== diaryId));
    } catch (err) {
      alert("일기를 완전히 삭제하지 못했어요. 다시 시도해주세요.");
      console.error(
        "DELETE /api/v1/diaries/trash/{diaryId} 실패:",
        err.response?.status,
        err.response?.data,
      );
    }
  };

  return (
    <div className="flex h-full w-full select-none flex-col gap-[24px] overflow-y-auto bg-[#F6F8FA] p-[16px] scrollbar-hide">
      <div className="flex w-full shrink-0 items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="size-[32px] shrink-0 cursor-pointer bg-transparent p-0 transition-opacity active:opacity-60"
        >
          <img src={backIcon} alt="뒤로가기" className="h-full w-full" />
        </button>
        <img
          src={profileIcon}
          alt="프로필"
          className="size-[38px] shrink-0 rounded-full object-contain"
          style={{ filter: "drop-shadow(0 0 9.938px rgba(65, 68, 80, 0.16))" }}
        />
      </div>

      <div className="flex w-full flex-col items-start gap-[18px]">
        <div className="flex w-full flex-col items-start gap-[8px]">
          <p className="whitespace-nowrap text-[22px] font-semibold leading-[normal] tracking-[-0.66px] text-[#2D3038]">
            휴지통
          </p>
          <p className="text-[14px] font-medium leading-[normal] tracking-[-0.28px] text-[#787E8C]">
            삭제한 일기는 이곳에 30일동안 보관돼요.
          </p>
        </div>

        {isLoading && (
          <p className="w-full text-center text-[14px] text-[#5F6473]">
            불러오는 중...
          </p>
        )}

        {!isLoading && errorMessage && (
          <p className="w-full text-center text-[14px] text-[#5F6473]">
            {errorMessage}
          </p>
        )}

        {!isLoading && !errorMessage && entries.length === 0 && (
          <p className="w-full text-center text-[14px] text-[#5F6473]">
            휴지통이 비어있어요.
          </p>
        )}

        {!isLoading && !errorMessage && entries.length > 0 && (
          <div className="flex w-full flex-col items-start gap-[20px]">
            {entries.map((entry) => (
              <div
                key={entry.diaryId}
                className="flex w-full flex-col items-start gap-[8px]"
              >
                <div className="flex w-full items-center justify-between">
                  <p className="whitespace-nowrap text-[18px] font-semibold leading-[normal] tracking-[-0.36px] text-[#2D3038]">
                    {formatDateLabel(entry.recordedDate)}{" "}
                    <span className="text-[14px] font-medium tracking-[-0.28px] text-[#787E8C]">
                      • {daysRemaining(entry.deletedAt)}일남음
                    </span>{" "}
                  </p>
                  <div className="flex shrink-0 items-center gap-[16px]">
                    <button
                      type="button"
                      onClick={() => handleRestore(entry.diaryId)}
                      disabled={restoringId === entry.diaryId}
                      aria-label="복원하기"
                      className="flex h-[20px] w-[21px] shrink-0 cursor-pointer items-center justify-center bg-transparent p-0 disabled:opacity-40"
                    >
                      <img
                        src={trashRestoreIcon}
                        alt="복원하기"
                        className="h-full w-full"
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setPermanentDeleteTarget({
                          diaryId: entry.diaryId,
                          recordedDate: entry.recordedDate,
                        })
                      }
                      aria-label="완전히 삭제하기"
                      className="flex h-[20px] w-[21px] shrink-0 cursor-pointer items-center justify-center bg-transparent p-0"
                    >
                      <img
                        src={trashClearIcon}
                        alt="완전히 삭제하기"
                        className="h-full w-full"
                      />
                    </button>
                  </div>
                </div>
                <div className="flex w-full items-center gap-[5px] whitespace-nowrap text-[14px] font-medium leading-[normal] tracking-[-0.28px] text-[#5F6473]">
                  <p className="shrink-0">
                    {entry.createdAt ? formatTimeLabel(entry.createdAt) : ""}
                  </p>
                  <p className="truncate">{entry.content}</p>
                </div>
                <div
                  className="h-[1px] w-full"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(205, 209, 218, 0.00) 0%, #CDD1DA 15%, #CDD1DA 84.62%, rgba(205, 209, 218, 0.00) 100%)",
                  }}
                />{" "}
              </div>
            ))}
          </div>
        )}
      </div>

      {permanentDeleteTarget && (
        <PermanentDeleteConfirmModal
          month={Number(permanentDeleteTarget.recordedDate.split("-")[1])}
          day={Number(permanentDeleteTarget.recordedDate.split("-")[2])}
          onCancel={() => setPermanentDeleteTarget(null)}
          onDelete={handlePermanentDeleteConfirmed}
        />
      )}
    </div>
  );
}
