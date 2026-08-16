import { createContext, useContext } from "react";

export const DevAccessContext = createContext(null);

export function useDevAccess() {
  const context = useContext(DevAccessContext);
  if (!context) {
    throw new Error("useDevAccess는 DevAccessProvider 안에서만 쓸 수 있어요.");
  }
  return context;
}
