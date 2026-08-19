import { useEffect, useRef, useState } from "react";
import { ModalButton } from "../../Onboarding/components/OnboardingUi";

const ITEM_H = 46;
const YEARS = Array.from({ length: 21 }, (_, i) => 2020 + i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

function WheelColumn({
  items,
  value,
  onChange,
  label,
  formatLabel,
  className,
}) {
  const ref = useRef(null);
  const timer = useRef(null);
  const valueRef = useRef(value);
  const wheelLocked = useRef(false);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const scrollToIndex = (idx, smooth = true) => {
    const el = ref.current;
    if (!el) return;
    const next = Math.min(Math.max(idx, 0), items.length - 1);
    el.scrollTo({ top: next * ITEM_H, behavior: smooth ? "smooth" : "auto" });
    if (items[next] !== valueRef.current) onChange(items[next]);
  };

  useEffect(() => {
    scrollToIndex(items.indexOf(value), false);
    // 처음 1회만 위치 세팅
  }, []);

  // 스크롤이 멈추면 가운데 값으로 확정
  const handleScroll = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (!ref.current) return;
      const idx = Math.round(ref.current.scrollTop / ITEM_H);
      const next = items[Math.min(Math.max(idx, 0), items.length - 1)];
      if (next && next !== valueRef.current) onChange(next);
    }, 90);
  };

  // 휠은 한 틱당 한 칸만 이동
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handleWheel = (e) => {
      e.preventDefault();
      if (wheelLocked.current) return;
      wheelLocked.current = true;
      const dir = e.deltaY > 0 ? 1 : -1;
      scrollToIndex(items.indexOf(valueRef.current) + dir);
      setTimeout(() => {
        wheelLocked.current = false;
      }, 160);
    };
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [items]);

  const handleKeyDown = (e) => {
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
    e.preventDefault();
    const step = e.key === "ArrowUp" ? -1 : 1;
    scrollToIndex(items.indexOf(value) + step);
  };

  return (
    <div className={`relative h-[138px] ${className}`}>
      <div className="pointer-events-none absolute left-0 right-0 top-[46px] h-[46px] rounded-[8px] bg-grey-0 shadow-[0_0_10px_0_rgba(77,80,91,0.05),0_0_30px_0_rgba(65,68,80,0.05)]" />
      <div
        ref={ref}
        role="listbox"
        aria-label={label}
        tabIndex={0}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        className="relative h-[138px] w-full snap-y snap-mandatory overflow-y-scroll overscroll-contain focus:outline-none [&::-webkit-scrollbar]:hidden"
      >
        <div className="h-[46px]" />
        {items.map((item) => (
          <div
            key={item}
            role="option"
            aria-selected={item === value}
            onClick={() => scrollToIndex(items.indexOf(item))}
            className="flex h-[46px] cursor-pointer snap-center items-center justify-center text-[22px] font-semibold tracking-[-0.44px] text-grey-80 select-none"
          >
            {formatLabel(item)}
          </div>
        ))}
        <div className="h-[46px]" />
      </div>
    </div>
  );
}

export default function MonthYearPickerModal({
  open,
  initial = { year: 2026, month: 9 },
  onConfirm,
  onClose,
}) {
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);
  const [year, setYear] = useState(initial.year);
  const [month, setMonth] = useState(initial.month);

  useEffect(() => {
    if (open) {
      setMounted(true);
      setYear(initial.year);
      setMonth(initial.month);
      const id = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(id);
    }
    setShown(false);
    const timer = setTimeout(() => setMounted(false), 200);
    return () => clearTimeout(timer);
  }, [open]);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center">
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-grey-90/25 backdrop-blur-[1px] transition-opacity duration-200 ease-out ${
          shown ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        className={`relative flex w-[calc(100%-32px)] max-w-[358px] flex-col items-center gap-[16px] overflow-hidden rounded-[12px] bg-[#f6f8fa] px-[16px] py-[20px] transition-all duration-200 ease-out ${
          shown ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <div className="relative mx-auto flex items-center gap-[32px]">
          <WheelColumn
            items={YEARS}
            value={year}
            onChange={setYear}
            label="연도"
            formatLabel={(y) => `${y}년`}
            className="w-[92px] shrink-0"
          />
          <WheelColumn
            items={MONTHS}
            value={month}
            onChange={setMonth}
            label="월"
            formatLabel={(m) => `${m}월`}
            className="w-[53px] shrink-0"
          />

          <div className="pointer-events-none absolute inset-x-0 top-0 h-[36px] bg-gradient-to-b from-[#f6f8fa] to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[36px] bg-gradient-to-t from-[#f6f8fa] to-transparent" />
        </div>

        <ModalButton onClick={() => onConfirm({ year, month })}>
          완료
        </ModalButton>
      </div>
    </div>
  );
}
