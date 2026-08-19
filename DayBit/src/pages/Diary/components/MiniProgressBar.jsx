export default function MiniProgressBar({ current, total = 4 }) {
  return (
    <div className="flex items-center gap-[8px]">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className="h-[4px] w-[8px] shrink-0 rounded-full"
          style={{ backgroundColor: i <= current ? "#5F6473" : "#D6D9E2" }}
        />
      ))}
    </div>
  );
}
