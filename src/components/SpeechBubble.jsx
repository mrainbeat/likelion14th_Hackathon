export default function SpeechBubble({
  color,
  direction = "left",
  bordered = false,
  borderColor = "#DFE2EA",
  className = "",
  style,
  children,
}) {
  const cornerClass =
    direction === "right"
      ? "rounded-tl-[12px] rounded-bl-[12px] rounded-br-[12px]"
      : "rounded-tr-[12px] rounded-bl-[12px] rounded-br-[12px]";

  return (
    <div
      className={`relative ${cornerClass} ${bordered ? "border border-solid" : ""} ${className}`}
      style={{
        backgroundColor: color,
        borderColor: bordered ? borderColor : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
