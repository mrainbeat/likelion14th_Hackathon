import { useMemo, useState } from "react";
import { DevAccessContext } from "./devAccess";
import { verifyDevAccess } from "../utils/devDiary";

export default function DevAccessProvider({ children }) {
  const [devPassword, setDevPassword] = useState(null);

  const value = useMemo(
    () => ({
      devPassword,
      isVerified: Boolean(devPassword),
      verify: async (password) => {
        const response = await verifyDevAccess(password);
        if (response.data.result !== true) return false;
        setDevPassword(password);
        return true;
      },
      clear: () => setDevPassword(null),
    }),
    [devPassword],
  );

  return (
    <DevAccessContext.Provider value={value}>
      {children}
    </DevAccessContext.Provider>
  );
}
