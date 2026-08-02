import { useState, useEffect } from "react";

export function useCurrentTime() {
  const [dateStr, setDateStr] = useState("");
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    setDateStr(`${month}월 ${date}일`);

    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    setTimeStr(`${hours}:${minutes}`);
  }, []);

  return { dateStr, timeStr };
}
