import { useState, useEffect } from "react";
import { getServiceToday } from "../utils/serviceDate";

export function useCurrentTime() {
  const [dateStr, setDateStr] = useState("");
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    const today = getServiceToday();
    setDateStr(`${today.month}월 ${today.day}일`);

    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    setTimeStr(`${hours}:${minutes}`);
  }, []);

  return { dateStr, timeStr };
}
