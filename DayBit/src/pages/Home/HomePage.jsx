import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../api/apiClient";
import MonthYearPickerModal from "./components/MonthYearPickerModal";
import logoImage from "../../assets/logos/logo-symbol.png";
import profileIcon from "../../assets/icons/profile.svg";
import bubbleTailSvg from "../../assets/icons/tail.svg";
import bellIcon from "../../assets/icons/notification-bell.svg";
import arrowIcon from "../../assets/icons/back.svg";
import editIcon from "../../assets/icons/edit-pencil.svg";

const WEEKDAYS = ["월", "화", "수", "목", "금", "토", "일"];

function pad2(n) {
  return String(n).padStart(2, "0");
}

// 서버 기준(서울) 오늘 날짜
function getSeoulToday() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    dateStr: `${map.year}-${map.month}-${map.day}`,
  };
}

// 월요일 시작 기준 주 단위로 달력 셀 생성
function buildCalendarWeeks(year, month) {
  const firstOfMonth = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const prevMonthDays = new Date(year, month - 1, 0).getDate();
  const firstWeekday = (firstOfMonth.getDay() + 6) % 7; // 0=월요일

  const cells = [];
  for (let i = firstWeekday - 1; i >= 0; i--) {
    cells.push({ day: prevMonthDays - i, inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      day: d,
      inMonth: true,
      dateStr: `${year}-${pad2(month)}-${pad2(d)}`,
    });
  }
  let nextDay = 1;
  while (cells.length % 7 !== 0) {
    cells.push({ day: nextDay++, inMonth: false });
  }

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

function DayCell({ cell, colorHex }) {
  if (!cell.inMonth) {
    return (
      <div className="relative size-[38px] shrink-0 overflow-clip rounded-[2px]">
        <div className="absolute left-px top-1/2 flex h-[38px] w-[37px] -translate-y-1/2 flex-col items-center justify-center p-[10px]">
          <p className="whitespace-nowrap text-[12px] font-semibold tracking-[-0.12px] text-[#f3f4f7]">
            {cell.day}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative size-[38px] shrink-0 overflow-clip rounded-[2px]"
      style={{ backgroundColor: colorHex || "#ffffff" }}
    >
      <div className="absolute left-px top-0 flex h-[38px] w-[37px] flex-col items-center justify-center p-[10px]">
        <p
          className="whitespace-nowrap text-[16px] font-semibold"
          style={{ color: colorHex ? "#ffffff" : "#e7e9ee" }}
        >
          {cell.day}
        </p>
      </div>
    </div>
  );
}

// 미구현된 보상버튼
function RewardBadge({ active }) {
  if (active) {
    return (
      <div className="flex size-[38px] shrink-0 items-center justify-center rounded-[4px] border-[1.5px] border-solid border-[#858c9c]">
        <p className="whitespace-nowrap text-[12px] font-semibold tracking-[-0.12px] text-[#5f6473]">
          보상
        </p>
      </div>
    );
  }
  return (
    <div className="flex size-[38px] shrink-0 items-center justify-center rounded-[4px] bg-[#dfe2ea]">
      <p className="whitespace-nowrap text-[12px] font-semibold tracking-[-0.12px] text-white">
        보상
      </p>
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [today] = useState(() => getSeoulToday());

  const [viewYear, setViewYear] = useState(today.year);
  const [viewMonth, setViewMonth] = useState(today.month);
  const [monthItems, setMonthItems] = useState([]);
  const [todayItem, setTodayItem] = useState(null);
  const [showPicker, setShowPicker] = useState(false);

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
        setMonthItems(Array.isArray(result) ? result : (result?.items ?? []));
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

  useEffect(() => {
    let alive = true;
    apiClient
      .get("/api/v1/diaries", {
        params: { year: today.year, month: today.month },
        headers: { "Cache-Control": "no-cache" },
      })
      .then((response) => {
        if (!alive) return;
        const result = response.data.result;
        const items = Array.isArray(result) ? result : (result?.items ?? []);
        setTodayItem(
          items.find((item) => item.recordedDate === today.dateStr) ?? null,
        );
      })
      .catch((error) => {
        console.error(
          "GET /api/v1/diaries(오늘 작성 여부) 실패:",
          error.response?.status,
          error.response?.data,
        );
      });
    return () => {
      alive = false;
    };
  }, [today]);

  const colorByDate = new Map(
    monthItems.map((item) => [item.recordedDate, item.reward?.colorHex]),
  );

  const isCurrentMonth = viewYear === today.year && viewMonth === today.month;
  const isTodayWritten = Boolean(todayItem);

  const weeks = buildCalendarWeeks(viewYear, viewMonth);

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

  const handleGoToWrite = () => navigate("/diary");

  return (
    <div className="relative flex h-full w-full select-none flex-col items-center gap-[20px] overflow-y-auto bg-[#f6f8fa] px-[20px] py-[16px] scrollbar-hide">
      <div className="flex w-full flex-col items-start gap-[8px]">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-end gap-[4px]">
            <img
              src={logoImage}
              alt=""
              className="h-[25px] w-[20px] object-contain"
            />
            <p className="whitespace-nowrap text-[14px] font-bold tracking-[1.12px] text-[#414450]">
              DAY BIT
            </p>
          </div>
          <button className="size-[38px] shrink-0 cursor-pointer rounded-full border-none bg-transparent p-0">
            <img
              src={profileIcon}
              alt="프로필"
              className="h-full w-full object-contain [filter:drop-shadow(0_0_9.938px_rgba(65,68,80,0.16))]"
            />
          </button>
        </div>

        <div className="flex w-full items-end justify-between">
          <p className="text-[22px] font-semibold tracking-[-0.44px] text-[#2d3038]">
            {viewMonth}월의 기록을
            <br />
            차곡차곡 쌓고 있어요
          </p>
          <img
            src={bellIcon}
            alt="알림"
            className="size-[30px] shrink-0 object-contain"
          />
        </div>
      </div>

      <div className="flex w-full flex-col items-center gap-[16px]">
        <div className="relative w-full rounded-[12px] bg-white px-[16px] py-[14px] shadow-[0_0_10px_0_rgba(77,80,91,0.05),0_0_30px_0_rgba(65,68,80,0.05)]">
          <div className="flex w-full flex-col gap-[6px]">
            <div className="flex w-full items-center justify-between">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="size-[24px] shrink-0"
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
                className="flex items-center gap-[8px] whitespace-nowrap text-[24px] font-bold tracking-[-0.48px] text-[#2d3038]"
              >
                {viewYear}년 {viewMonth}월
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="size-[24px] shrink-0"
              >
                <img
                  src={arrowIcon}
                  alt="다음 달"
                  className="h-full w-full rotate-180 object-contain"
                />
              </button>
            </div>

            <div className="flex flex-col gap-[12px]">
              <div className="flex flex-col gap-[8px]">
                <div className="flex items-center gap-[2px]">
                  {WEEKDAYS.map((label) => (
                    <div
                      key={label}
                      className="flex size-[38px] shrink-0 items-center justify-center text-[16px] font-semibold tracking-[-0.16px] text-[#2d3038]"
                    >
                      {label}
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-[2px]">
                  {weeks.map((week, weekIdx) => {
                    const isCurrentWeek =
                      isCurrentMonth &&
                      week.some(
                        (cell) => cell.inMonth && cell.day === today.day,
                      );
                    return (
                      <div
                        key={weekIdx}
                        className="flex w-full items-center justify-between"
                      >
                        <div className="flex items-center gap-[2px]">
                          {week.map((cell, i) => (
                            <DayCell
                              key={i}
                              cell={cell}
                              colorHex={
                                cell.inMonth
                                  ? colorByDate.get(cell.dateStr)
                                  : undefined
                              }
                            />
                          ))}
                        </div>
                        <RewardBadge active={isCurrentWeek} />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex w-full items-center justify-between">
                <button
                  type="button"
                  onClick={handleGoToWrite}
                  className="flex size-[40px] shrink-0 items-center justify-center"
                >
                  <img
                    src={editIcon}
                    alt="일기 작성"
                    className="size-[26px] object-contain"
                  />
                </button>
                <button
                  type="button"
                  onClick={handleGoToWrite}
                  className="flex items-center justify-center rounded-[12px] bg-[#5f6473] px-[20px] py-[12px]"
                >
                  <p className="whitespace-nowrap text-[16px] font-semibold text-white">
                    일기 작성하기
                  </p>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col items-center rounded-[12px] bg-white px-[16px] py-[12px] shadow-[0_0_10px_0_rgba(77,80,91,0.05),0_0_30px_0_rgba(65,68,80,0.05)]">
          <div className="flex items-center gap-[47px]">
            <div className="flex w-[66px] flex-col items-center gap-[6px]">
              <p className="whitespace-nowrap text-[16px] font-semibold text-[#2d3038]">
                오늘 작성
              </p>
              <p
                className="whitespace-nowrap text-[12px] font-semibold tracking-[-0.12px]"
                style={{ color: isTodayWritten ? "#5f6473" : "#cdd1da" }}
              >
                {isTodayWritten ? "작성완료" : "작성전"}
              </p>
            </div>
            <div className="h-full w-px shrink-0 bg-[#e7e9ee]" />
            <div className="flex flex-col items-center gap-[6px]">
              <p className="whitespace-nowrap text-[16px] font-semibold text-[#2d3038]">
                이달 기록
              </p>
              <p className="whitespace-nowrap text-[12px] font-semibold tracking-[-0.12px] text-[#5f6473]">
                {monthItems.length}회
              </p>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col items-start gap-[16px] rounded-[12px] bg-white px-[16px] py-[20px] shadow-[0_0_10px_0_rgba(77,80,91,0.05),0_0_30px_0_rgba(65,68,80,0.05)]">
          <div className="flex items-center gap-[10px]">
            <img
              src={logoImage}
              alt=""
              className="h-[28px] w-[22px] object-contain"
            />
            <p className="whitespace-nowrap text-[20px] font-semibold tracking-[-0.4px] text-[#2d3038]">
              다른 사람의 경험
            </p>
          </div>

          {[
            {
              text: "“다이어트”와 관련된 다른사람의 경험이 도착했어요.",
              tone: "light",
            },
            {
              text: "8/27에 전달한 나의 경험에 대한 피드백이 도착했어요.",
              tone: "dark",
            },
            {
              text: "“수능공부”와 관련된 다른사람의 경험이 도착했어요.",
              tone: "light",
            },
          ].map((item, i) => (
            <div
              key={i}
              className={`relative flex w-full items-center gap-[10px] rounded-[12px] px-[16px] py-[10px] ${
                item.tone === "dark" ? "bg-[#858c9c]" : "bg-[#e7e9ee]"
              }`}
            >
              <img
                src={bubbleTailSvg}
                alt=""
                className="pointer-events-none absolute left-[-4px] top-[-9px] h-[18.739px] w-[15.307px]"
              />
              <p
                className="flex-1 text-[16px] font-medium tracking-[-0.32px]"
                style={{ color: item.tone === "dark" ? "#ffffff" : "#5f6473" }}
              >
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      <MonthYearPickerModal
        open={showPicker}
        initial={{ year: viewYear, month: viewMonth }}
        onConfirm={handleConfirmPicker}
        onClose={() => setShowPicker(false)}
      />
    </div>
  );
}
