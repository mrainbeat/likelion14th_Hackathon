import { useEffect, useRef, useState } from "react";
import { ModalButton } from "./OnboardingUi";
import { useScrollLock } from "../../../hooks/useScrollLock";

const ITEM_H = 46;
const PERIODS = ["오전", "오후"];
const HOURS = Array.from({ length: 12 }, (_, i) =>
  String(i + 1).padStart(2, "0"),
);
const MINUTES = Array.from({ length: 60 }, (_, i) =>
  String(i).padStart(2, "0"),
);

export function formatAlarmLabel({ period, hour, minute }) {
  const h = Number(hour);
  return minute === "00"
    ? `${period}${h}시`
    : `${period}${h}시 ${Number(minute)}분`;
}

function WheelColumn({ items, value, onChange, label, className }) {
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
  }, []);

  const handleScroll = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (!ref.current) return;
      const idx = Math.round(ref.current.scrollTop / ITEM_H);
      const next = items[Math.min(Math.max(idx, 0), items.length - 1)];
      if (next && next !== valueRef.current) onChange(next);
    }, 90);
  };

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
    <div
      ref={ref}
      role="listbox"
      aria-label={label}
      tabIndex={0}
      onScroll={handleScroll}
      onKeyDown={handleKeyDown}
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      className={`absolute top-0 h-[138px] snap-y snap-mandatory overflow-y-scroll overscroll-contain focus:outline-none [&::-webkit-scrollbar]:hidden ${className}`}
    >
      <div className="h-[46px]" />
      {items.map((item, i) => (
        <div
          key={item}
          role="option"
          aria-selected={item === value}
          onClick={() => scrollToIndex(i)}
          className={`flex h-[46px] cursor-pointer snap-center items-center justify-center leading-none text-grey-80 select-none ${
            item === value ? "font-semibold" : "font-medium"
          }`}
        >
          {item}
        </div>
      ))}
      <div className="h-[46px]" />
    </div>
  );
}

export default function AlarmTimeModal({
  open,
  initial = { period: "오후", hour: "10", minute: "00" },
  onConfirm,
  onClose,
}) {
  useScrollLock();

  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);
  const [period, setPeriod] = useState(initial.period);
  const [hour, setHour] = useState(initial.hour);
  const [minute, setMinute] = useState(initial.minute);

  useEffect(() => {
    if (open) {
      setMounted(true);
      setPeriod(initial.period);
      setHour(initial.hour);
      setMinute(initial.minute);
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
        className={`relative h-[263px] w-[350px] overflow-hidden rounded-[12px] bg-[#F6F8FA] transition-all duration-200 ease-out ${
          shown ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <p className="absolute left-[16px] top-[19px] text-[20px] font-semibold leading-[1.19] tracking-[-0.4px] text-grey-90">
          알림 시간을 설정해주세요
        </p>

        <div
          className="pointer-events-none absolute left-[16px] top-[95px] h-[48px] w-[318px] rounded-[6px] bg-grey-0"
          style={{
            boxShadow:
              "0 0 10px 0 rgba(77,80,91,0.05), 0 0 30px 0 rgba(65,68,80,0.05)",
          }}
        />

        <div className="absolute left-[16px] top-[50px] h-[138px] w-[318px]">
          <WheelColumn
            items={PERIODS}
            value={period}
            onChange={setPeriod}
            label="오전 오후"
            className="left-[38px] w-[76px] text-[14px]"
          />
          <WheelColumn
            items={HOURS}
            value={hour}
            onChange={setHour}
            label="시"
            className="left-[116px] w-[48px] text-[22px]"
          />
          <WheelColumn
            items={MINUTES}
            value={minute}
            onChange={setMinute}
            label="분"
            className="left-[188px] w-[48px] text-[22px]"
          />

          <div className="pointer-events-none absolute left-[173.5px] top-[69px] flex h-[9px] w-[3px] flex-col justify-between">
            <span className="size-[3px] rounded-full bg-grey-80" />
            <span className="size-[3px] rounded-full bg-grey-80" />
          </div>
        </div>

        <div className="pointer-events-none absolute left-[104px] top-[50px] h-[36px] w-[142px] bg-gradient-to-b from-[#F6F8FA] to-transparent" />
        <div className="pointer-events-none absolute left-[104px] top-[152px] h-[36px] w-[142px] bg-gradient-to-t from-[#F6F8FA] to-transparent" />

        <div className="absolute left-[16px] top-[194px] w-[318px]">
          <ModalButton onClick={() => onConfirm({ period, hour, minute })}>
            완료
          </ModalButton>
        </div>
      </div>
    </div>
  );
}
