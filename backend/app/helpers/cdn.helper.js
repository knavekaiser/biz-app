import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

export const S3 = new S3Client({
  region: "auto",
  endpoint: process.env.CLOUDFLARE_R2_API,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_ACCESS_KEY_SECRET,
  },
});

export const uploadFiles = async (files, options = {}) => {
  return Promise.all(
    files.map((file) => {
      return S3.send(
        new PutObjectCommand({
          Bucket: process.env.CLOUDFLARE_BUCKET,
          Key: file.key,
          Body: file.buffer,
        })
      )
        .then((resp) =>
          resp?.$metadata?.httpStatusCode === 200
            ? {
                ...file.metadata,
                key: file.key,
              }
            : resp
        )
        .catch((err) => {
          console.log("file upload error", err);
          return null;
        });
    })
  ).then((data) => data.filter(Boolean));
};

export const deleteFiles = async (keys = []) => {
  if (typeof keys === "string") {
    keys = [keys];
  }
  if (!keys?.length) return;
  return Promise.all(
    keys.map((key) =>
      S3.send(
        new DeleteObjectCommand({
          Bucket: process.env.CLOUDFLARE_BUCKET,
          Key: key,
        })
      )
    )
  )
    .then((res) => {
      // console.log("delete response", res);
    })
    .catch((err) => console.log("files delete err", err));
};
