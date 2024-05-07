import { useState, useEffect, useCallback, useRef, useContext } from "react";
import { paths } from "config";
import { useNavigate } from "react-router-dom";
import { SiteContext } from "SiteContext";
// import { Prompt } from "Components/modal";

export const useFetch = (url, { headers: hookHeaders } = {}) => {
  const navigate = useNavigate();
  const { setUser, setConfig } = useContext(SiteContext);
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
          JSON.parse(JSON.stringify(query))
        ).toString()}`;
      }
      setLoading(true);
      return new Promise((resolve, reject) => {
        fetch(_url, {
          method,
          headers: {
            ...(!(typeof payload?.append === "function") && {
              "Content-Type": "application/json",
            }),
            ...(localStorage.getItem("business_id") && {
              "x-business-id": localStorage.getItem("business_id"),
            }),
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
            let data = await res.json();
            if (res.status === 401) {
              setUser(null);
              setConfig(null);
              navigate(paths.home);
              return;

              // return Prompt({
              //   type: "error",
              //   message: "Session has expired!",
              //   callback: () => {
              //     setUser(null);
              //     setConfig(null);
              //     navigate(paths.home);
              //   },
              // });
            }
            setLoading(false);
            resolve({ res, data });
          })
          .catch((err) => {
            setLoading(false);
            if (
              [
                "The user aborted a request.",
                "signal is aborted without reason",
              ].includes(err?.message)
            ) {
              // user aborted
            } else {
              setError(err);
              reject(err);
            }
          });
      });
    },
    [url]
  );

  const post = (payload, options) => onSubmit(payload, "POST", options);

  const get = (options) => onSubmit(null, "GET", options);

  const remove = (payload, options) => onSubmit(payload, "DELETE", options);

  const put = (payload, options) => onSubmit(payload, "PUT", options);

  const patch = (payload, options) => onSubmit(payload, "PATCH", options);

  return { get, post, put, remove, patch, loading, error, onSubmit };
};

export default useFetch;
