import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../api/apiClient";
import MonthYearPickerModal from "./components/MonthYearPickerModal";
import DiaryOptionsMenu from "./components/DiaryOptionsMenu";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import HideConfirmModal from "./components/HideConfirmModal";
import arrowIcon from "../../assets/icons/back.svg";
import profileIcon from "../../assets/icons/profile.svg";
import kebabIcon from "../../assets/icons/menu.svg";
import { getServiceToday } from "../../utils/serviceDate";

function firstBlock(content) {
  if (!content) return { time: "", text: "" };
  const [firstLine, ...rest] = content.split("\n");
  return { time: firstLine?.trim() ?? "", text: rest.join(" ").trim() };
}

export default function DiaryListPage() {
  const navigate = useNavigate();
  const [today] = useState(() => getServiceToday());

  const [viewYear, setViewYear] = useState(today.year);
  const [viewMonth, setViewMonth] = useState(today.month);
  const [items, setItems] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [hideTarget, setHideTarget] = useState(null);

  useEffect(() => {
    let alive = true;
    apiClient
      .get("/api/v1/diaries", {
        params: { year: viewYear, month: viewMonth },
        headers: { "Cache-Control": "no-cache" },
      })
      .then((response) => {
        if (!alive) return;
        const result = response.data.result;
        setItems(Array.isArray(result) ? result : (result?.items ?? []));
      })
      .catch((error) => {
        console.error(
          "GET /api/v1/diaries 실패:",
          error.response?.status,
          error.response?.data,
        );
      });
    return () => {
      alive = false;
    };
  }, [viewYear, viewMonth]);

  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      setViewYear((y) => y - 1);
      setViewMonth(12);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 12) {
      setViewYear((y) => y + 1);
      setViewMonth(1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleConfirmPicker = ({ year, month }) => {
    setViewYear(year);
    setViewMonth(month);
    setShowPicker(false);
  };

  const handleRequestDelete = (item) => {
    setOpenMenuId(null);
    setDeleteTarget(item);
  };

  const handleRequestHide = (item) => {
    setOpenMenuId(null);
    setHideTarget(item);
  };

  const handleConfirmHide = async () => {
    if (!hideTarget) return;
    const diaryId = hideTarget.diaryId;
    setHideTarget(null);

    try {
      await apiClient.patch(`/api/v1/diaries/${diaryId}/hide`);
      setItems((prev) => prev.filter((item) => item.diaryId !== diaryId));
    } catch (error) {
      alert("일기를 숨기지 못했어요. 다시 시도해주세요.");
      console.error(
        "PATCH /api/v1/diaries/{diaryId}/hide 실패:",
        error.response?.status,
        error.response?.data,
      );
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const diaryId = deleteTarget.diaryId;
    setDeleteTarget(null);

    try {
      await apiClient.delete(`/api/v1/diaries/${diaryId}`);
      setItems((prev) => prev.filter((item) => item.diaryId !== diaryId));
    } catch (error) {
      alert("일기를 삭제하지 못했어요. 다시 시도해주세요.");
      console.error(
        "DELETE /api/v1/diaries/{diaryId} 실패:",
        error.response?.status,
        error.response?.data,
      );
    }
  };

  return (
    <div className="relative flex h-full w-full select-none flex-col gap-[16px] overflow-y-auto bg-[#f6f8fa] px-[16px] py-[16px] scrollbar-hide">
      <div className="flex w-full items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="size-[32px] shrink-0 cursor-pointer"
        >
          <img
            src={arrowIcon}
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
            className="h-full w-full object-contain [filter:drop-shadow(0_0_9.938px_rgba(65,68,80,0.16))]"
          />
        </button>
      </div>

      <div className="flex w-full flex-col gap-[18px]">
        <div className="flex items-center justify-center gap-[6px]">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="size-[24px] shrink-0 cursor-pointer"
          >
            <img
              src={arrowIcon}
              alt="이전 달"
              className="h-full w-full object-contain"
            />
          </button>
          <button
            type="button"
            onClick={() => setShowPicker(true)}
            className="flex cursor-pointer items-center gap-[8px] whitespace-nowrap text-[24px] font-bold tracking-[-0.48px] text-grey-90"
          >
            {viewYear}년 {viewMonth}월
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="size-[24px] shrink-0 cursor-pointer"
          >
            <img
              src={arrowIcon}
              alt="다음 달"
              className="h-full w-full rotate-180 object-contain"
            />
          </button>
        </div>

        <div className="flex flex-col gap-[12px]">
          {items.map((item) => {
            const { time, text } = firstBlock(item.content);
            const [, month, day] = item.recordedDate.split("-").map(Number);
            return (
              <div key={item.diaryId} className="flex flex-col gap-[12px]">
                <div className="flex flex-col items-start gap-[8px]">
                  <div className="flex w-full items-center justify-between">
                    <p className="whitespace-nowrap text-[18px] font-semibold leading-[normal] tracking-[-0.36px] text-grey-90">
                      {month}월 {day}일
                    </p>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenMenuId((prev) =>
                            prev === item.diaryId ? null : item.diaryId,
                          )
                        }
                        className="flex size-[16px] cursor-pointer items-center justify-center"
                      >
                        <img
                          src={kebabIcon}
                          alt="더보기"
                          className="h-full w-full"
                        />
                      </button>
                      {openMenuId === item.diaryId && (
                        <DiaryOptionsMenu
                          onClose={() => setOpenMenuId(null)}
                          onHide={() => handleRequestHide(item)}
                          onDelete={() => handleRequestDelete(item)}
                          hideQuestionButton
                        />
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`/home/diaries/${item.diaryId}`)}
                    className="flex w-full cursor-pointer items-center gap-[5px] overflow-hidden text-left"
                  >
                    <p className="shrink-0 whitespace-nowrap text-[16px] font-medium tracking-[-0.32px] text-grey-70">
                      {time}
                    </p>
                    <p className="min-w-0 flex-1 truncate text-[16px] font-medium tracking-[-0.32px] text-grey-70">
                      {text}
                    </p>
                  </button>
                </div>
                <div className="h-px w-full bg-grey-30" />
              </div>
            );
          })}
        </div>
      </div>

      <MonthYearPickerModal
        open={showPicker}
        initial={{ year: viewYear, month: viewMonth }}
        onConfirm={handleConfirmPicker}
        onClose={() => setShowPicker(false)}
      />

      {deleteTarget && (
        <DeleteConfirmModal
          month={Number(deleteTarget.recordedDate.split("-")[1])}
          day={Number(deleteTarget.recordedDate.split("-")[2])}
          onCancel={() => setDeleteTarget(null)}
          onDelete={handleConfirmDelete}
        />
      )}

      {hideTarget && (
        <HideConfirmModal
          month={Number(hideTarget.recordedDate.split("-")[1])}
          day={Number(hideTarget.recordedDate.split("-")[2])}
          onCancel={() => setHideTarget(null)}
          onConfirm={handleConfirmHide}
        />
      )}
    </div>
  );
}
