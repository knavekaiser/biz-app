import React, { createContext, useState, useEffect, useRef } from "react";

export const SiteContext = createContext();
export const Provider = ({ children }) => {
  const [user, setUser] = useState({
    id: "121324546",
    phone: "123165456",
  });
  useEffect(() => {
    // do something after users are loaded
  }, [user]);
  return (
    <SiteContext.Provider
      value={{
        user,
        setUser,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
};
