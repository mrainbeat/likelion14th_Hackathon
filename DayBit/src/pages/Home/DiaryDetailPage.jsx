import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "../../api/apiClient";
import DiaryOptionsMenu from "./components/DiaryOptionsMenu";
import backIcon from "../../assets/icons/back.svg";
import profileIcon from "../../assets/icons/profile.svg";
import kebabIcon from "../../assets/icons/menu.svg";

const FALLBACK_COLOR = "#4F5563";

function hexToRgba(hex, alpha) {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function parseDiaryBlocks(content) {
  if (!content) return [];
  return content
    .split(/\n{2,}/)
    .map((block) => {
      const [time, ...rest] = block.split("\n");
      return { time: time?.trim() ?? "", text: rest.join("\n").trim() };
    })
    .filter((block) => block.time);
}

export default function DiaryDetailPage() {
  const navigate = useNavigate();
  const { diaryId } = useParams();

  const [diary, setDiary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    let alive = true;
    apiClient
      .get(`/api/v1/diaries/${diaryId}`)
      .then((response) => {
        if (!alive) return;
        setDiary(response.data.result ?? null);
      })
      .catch((error) => {
        if (!alive) return;
        setErrorMessage("일기를 불러오지 못했어요.");
        console.error(
          "GET /api/v1/diaries/{diaryId} 실패:",
          error.response?.status,
          error.response?.data,
        );
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [diaryId]);

  const handleDelete = async () => {
    setShowMenu(false);
    if (!window.confirm("이 일기를 삭제할까요?")) return;

    try {
      await apiClient.delete(`/api/v1/diaries/${diaryId}`);
      navigate(-1);
    } catch (error) {
      alert("일기를 삭제하지 못했어요. 다시 시도해주세요.");
      console.error(
        "DELETE /api/v1/diaries/{diaryId} 실패:",
        error.response?.status,
        error.response?.data,
      );
    }
  };

  const colorHex = diary?.reward?.colorHex;
  const color = colorHex || FALLBACK_COLOR;
  const blocks = parseDiaryBlocks(diary?.content);
  const [, month, day] = diary?.recordedDate?.split("-").map(Number) ?? [];

  return (
    <div className="relative flex h-full w-full select-none flex-col gap-[12px] overflow-y-auto bg-[#f6f8fa] px-[20px] py-[16px] scrollbar-hide">
      <div className="flex w-full items-center justify-between">
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
        <button
          className="size-[38px] shrink-0 rounded-full border-none bg-transparent p-0"
          style={{
            filter: `drop-shadow(0 0 9.938px ${hexToRgba(color, 0.16)})`,
          }}
        >
          <img
            src={profileIcon}
            alt="프로필"
            className="h-full w-full object-contain"
          />
        </button>
      </div>

      {loading ? (
        <p className="text-center text-[16px] font-medium text-grey-60">
          불러오는 중...
        </p>
      ) : errorMessage ? (
        <p className="text-center text-[16px] font-medium text-grey-60">
          {errorMessage}
        </p>
      ) : (
        <>
          <div className="flex w-full items-center justify-between">
            <p
              className="text-heading-28 whitespace-nowrap drop-shadow-[0px_0px_1px_rgba(0,0,0,0.05)]"
              style={{ color }}
            >
              {month}월 {day}일
            </p>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMenu((prev) => !prev)}
                className="flex size-[16px] cursor-pointer items-center justify-center"
              >
                <img src={kebabIcon} alt="더보기" className="h-full w-full" />
              </button>
              {showMenu && (
                <DiaryOptionsMenu
                  onClose={() => setShowMenu(false)}
                  onDelete={handleDelete}
                />
              )}
            </div>
          </div>

          <div
            className="flex w-full flex-col gap-[26px] rounded-[12px] bg-grey-0 px-[16px] py-[20px]"
            style={{
              boxShadow: `0 0 5px 0 ${hexToRgba(color, 0.05)}, 0 0 15px 0 ${hexToRgba(color, 0.05)}`,
            }}
          >
            {blocks.map((block, i) => (
              <div
                key={i}
                className="flex w-full flex-col items-start gap-[6px]"
              >
                <p className="whitespace-nowrap text-[16px] font-medium tracking-[-0.32px] text-grey-70">
                  {block.time}
                </p>
                {block.text && (
                  <p className="text-16 w-full text-grey-90">{block.text}</p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
