import { useState, useEffect, useCallback, useRef } from "react";

export const useFetch = (url, { headers: hookHeaders } = {}) => {
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
      setLoading(true);
      return fetch(_url, {
        method: method,
        headers: {
          ...(!(typeof payload?.append === "function") && {
            "Content-Type": "application/json",
          }),
          "x-access-token": sessionStorage.getItem("access_token"),
          ...(sessionStorage.getItem("business_id") && {
            business_id: sessionStorage.getItem("business_id"),
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
          setLoading(false);
          return { res, data };
        })
        .catch((err) => {
          setLoading(false);
          if (["The user aborted a request."].includes(err?.message)) {
            return { data: {} };
          }
          setError(err);
          throw err;
        });
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
