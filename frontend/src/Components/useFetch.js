import { useState, useEffect, useCallback, useRef, useContext } from "react";
import { SiteContext } from "../SiteContext";
import { Prompt } from "../components/modal";
import { endpoints as defaultEndpoints } from "../config";

export const useFetch = (
  url,
  { his, headers: hookHeaders, defaultHeaders, noDbSchema } = {}
) => {
  const { user, logout } = useContext(SiteContext);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const controller = useRef();
  useEffect(() => {
    controller.current = new AbortController();

    return () => {
      controller.current.abort();
      setError(false);
      setLoading(false);
    };
  }, [url]);

  const onSubmit = useCallback(
    async (payload = {}, method, { headers, params, query } = {}) => {
      let _url = url;
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          _url = _url.replace(key, value);
        });
      }
      if (query) {
        _url += `${_url.includes("?") ? "" : "?"}&${new URLSearchParams(
          query
        ).toString()}`;
      }
      if (
        noDbSchema !== true &&
        !his &&
        sessionStorage.getItem("db-schema") &&
        !_url.startsWith(defaultEndpoints.apiUrl)
      ) {
        _url += `${
          _url.includes("?") ? "" : "?"
        }&tenantId=${sessionStorage.getItem("db-schema")}`;
      }
      setLoading(true);
      const response = await fetch(_url, {
        method: method,
        headers: {
          ...(!(typeof payload?.append === "function") && {
            "Content-Type": "application/json",
          }),
          ...(defaultHeaders !== false &&
            (!his
              ? {
                  Authorization:
                    "Bearer " + sessionStorage.getItem("access-token"),
                  // tenantId: sessionStorage.getItem("db-schema") || null,
                }
              : {
                  SECURITY_TOKEN: sessionStorage.getItem("HIS-access-token"),
                  FACILITY_ID: 1,
                  CLIENT_REF_ID: "Napier123",
                  "x-auth-token": sessionStorage.getItem("HIS-access-token"),
                  "x-tenantid": sessionStorage.getItem("tenant-id"),
                  "x-timezone": sessionStorage.getItem("tenant-timezone"),
                })),
          ...hookHeaders,
          ...headers,
        },
        ...(["POST", "PUT", "PATCH", "DELETE"].includes(method) && {
          body:
            typeof payload?.append === "function"
              ? payload
              : JSON.stringify(payload),
        }),
        signal: controller.current.signal,
      })
        .then(async (res) => {
          const data = await res
            .json()
            .catch((err) => {})
            .finally(() => null);
          return {
            ...data,
            res,
            data,
          };
        })
        .catch((err) => {
          setError(err);
          return { error: err };
        });

      if (response?.errorMessage || response?.error) {
        if (
          ["Invalid Token", "Token validation failed"].includes(
            response.errorMessage
          ) ||
          ["invalid_token"].includes(response.error)
        ) {
          sessionStorage.removeItem("access-token");
          sessionStorage.removeItem("HIS-access-token");
          return Prompt({
            type: "error",
            message: `${user.name} is logged in from another device. Please log in again.`,
            callback: logout,
          });
        }
      }
      setLoading(false);
      return response;
    },
    [url]
  );

  const post = (payload, options) => onSubmit(payload, "POST", options);

  const get = (payload, options) => onSubmit(payload, "GET", options);

  const remove = (payload, options) => onSubmit(payload, "DELETE", options);

  const put = (payload, options) => onSubmit(payload, "PUT", options);

  const patch = (payload, options) => onSubmit(payload, "PATCH", options);

  return { get, post, put, remove, patch, loading, error, onSubmit };
};

export default useFetch;
