// 점 색 바꾸려고 만든 컴포넌트...

export default function LogoSymbol({ dotColor = "#414450", className = "" }) {
  return (
    <svg
      className={className}
      viewBox="95 70 146 184"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M162.845 237.009V186.703C162.845 183.39 160.158 180.702 156.845 180.702H116C113.791 180.702 112 178.912 112 176.702V75.7365C112 72.9535 114.935 70.1782 117.718 70.1847C125.578 70.2031 141.189 70 162.845 70C271.55 69.9999 260.36 237.009 162.845 237.009Z"
        fill="#414450"
      />
      <rect
        x="95"
        y="204.27"
        width="49.7297"
        height="49.7297"
        rx="4"
        fill={dotColor}
      />
    </svg>
  );
}
