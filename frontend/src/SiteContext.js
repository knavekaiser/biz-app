import React, { createContext, useState, useEffect } from "react";
import { useFetch } from "hooks";
import { endpoints } from "config";

export const SiteContext = createContext();
export const Provider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [config, setConfig] = useState({});

  const { get: getConfig } = useFetch(endpoints.userConfig);
  useEffect(() => {
    if (user && !config) {
      getConfig().then(({ data }) => {
        if (data.success) {
          setConfig(data.data);
        }
      });
    } else if (!user && config) {
      setConfig(null);
    }
  }, [user, config]);
  return (
    <SiteContext.Provider
      value={{
        user,
        setUser,
        config,
        setConfig,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
};
