import { useEffect, useState } from "react";
import apiClient from "../../api/apiClient";

export function useNickname() {
  const [nickname, setNickname] = useState(
    () => localStorage.getItem("nickname") || "",
  );

  useEffect(() => {
    let alive = true;
    apiClient
      .get("/api/me")
      .then((response) => {
        if (!alive) return;
        const user = response.data.result;
        const name = user?.nickname || user?.name;
        if (name) setNickname(name);
      })
      .catch((error) => {
        console.error(
          "GET /api/me 실패:",
          error.response?.status,
          error.response?.data,
        );
      });
    return () => {
      alive = false;
    };
  }, []);

  return nickname;
}
