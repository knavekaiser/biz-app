import React, { createContext, useState, useEffect, useCallback } from "react";
import { endpoints } from "config";

export const SiteContext = createContext();
export const Provider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [config, setConfig] = useState(null);
  const [business, setBusiness] = useState(null);
  const [userType, setUserType] = useState(
    localStorage.getItem("userType") || "company"
  );

  const checkPermission = useCallback(
    (permission) => {
      if (!user) return false;
      if (["company", "admin"].includes(userType)) {
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
    const getConfig = () => {
      fetch(endpoints.userConfig, {
        headers: {
          "x-business-id": localStorage.getItem("business_id"),
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setConfig(data.data);
          }
        });
    };
    if (!!(business || user) && !config) {
      if (user?.userType === "company") {
        getConfig();
      } else if (business) {
        getConfig();
      }
    } else if (user) {
      if (user.userType === "company") {
        setConfig(null);
      } else if (!business) {
        setConfig(null);
      }
    }
  }, [user, business]);

  useEffect(() => {
    if (
      !["company", "admin", "staff"].includes(localStorage.getItem("userType"))
    ) {
      localStorage.setItem("userType", "company");
      setUserType("company");
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
