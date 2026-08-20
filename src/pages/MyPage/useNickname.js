import { useEffect, useState } from "react";
import { fetchMe } from "../../utils/me";
import { loadCachedNickname, saveCachedNickname } from "../../utils/nickname";

export function useNickname() {
  const [nickname, setNickname] = useState(loadCachedNickname);

  useEffect(() => {
    let alive = true;
    fetchMe()
      .then((response) => {
        if (!alive) return;
        const user = response.data.result;
        const name = user?.nickname || user?.name;
        if (!name) return;
        saveCachedNickname(name);
        setNickname((prev) => (prev === name ? prev : name));
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
