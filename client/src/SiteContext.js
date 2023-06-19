import React, { createContext, useState, useEffect, useCallback } from "react";
import { endpoints } from "config";

export const SiteContext = createContext();
export const Provider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [config, setConfig] = useState(null);
  const [business, setBusiness] = useState(null);
  const [userType, setUserType] = useState(
    localStorage.getItem("userType") || "business"
  );

  const checkPermission = useCallback(
    (permission) => {
      if (!user) return false;
      if (["business", "admin"].includes(userType)) {
        return true;
      }
      if (!business) {
        return false;
      }
      if (userType === "staff") {
        if (business.permissions.includes(permission)) {
          return true;
        }
      }
      return false;
    },
    [user, business, userType]
  );

  useEffect(() => {
    if (business) {
      localStorage.setItem("business_id", business.business._id);
    } else {
      localStorage.removeItem("business_id");
    }
  }, [business]);

  useEffect(() => {
    if (!!(business || user) && !config) {
      if (user?.userType === "business") {
        fetch(endpoints.userConfig)
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              setConfig(data.data);
            }
          });
      } else if (business) {
        fetch(endpoints.userConfig)
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              setConfig(data.data);
            }
          });
      }
    } else if (user) {
      if (user.userType === "business") {
        setConfig(null);
      } else if (!business) {
        setConfig(null);
      }
    }
  }, [user, business]);

  useEffect(() => {
    if (
      !["business", "admin", "staff"].includes(localStorage.getItem("userType"))
    ) {
      localStorage.setItem("userType", "business");
      setUserType("business");
    }
  }, []);

  return (
    <SiteContext.Provider
      value={{
        user,
        setUser,
        config,
        setConfig,
        business,
        setBusiness,
        checkPermission,
        userType,
        setUserType,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
};
