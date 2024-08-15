import nodeFetch from "node-fetch";

const callPinecone = async ({ url, method, query, body }) => {
  const finalUrl = `${process.env.PINECONE_HOST}${url}${
    query
      ? `${!url.includes("?") ? "?" : "&"}${new URLSearchParams(query)}`
      : ""
  }`;
  return nodeFetch(finalUrl, {
    method: method || "GET",
    headers: {
      "Api-Key": process.env.PINECONE_API_KEY,
      "Content-Type": "application/json",
    },
    ...(body && { body: JSON.stringify(body) }),
  }).then((res) => res.json());
};

export const fetch = (ids) => {
  return callPinecone({
    url: "/vectors/fetch",
    query: { ids },
  }).then((data) => Object.values(data.vectors));
};

export const query = async (body) => {
  return callPinecone({
    url: "/query",
    method: "POST",
    body,
  }).then((data) => data.matches);
};

export const upsert = async (body) => {
  return callPinecone({
    url: "/vectors/upsert",
    method: "POST",
    body,
  });
};

export const update = async (body) => {
  return callPinecone({
    url: "/vectors/update",
    method: "POST",
    body,
  });
};

export const deleteVectors = async (body) => {
  return callPinecone({
    url: "/vectors/delete",
    method: "POST",
    body,
  });
};
