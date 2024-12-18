import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import crypto from "crypto";
import { appConfig } from "../config/index.js";

const { responseFn } = appConfig;

export const generateHash = (string) => bcrypt.hashSync(string, 8);

export const compareHash = (password, hash) =>
  bcrypt.compareSync(password, hash);

export const signIn = async (res, user, userType) => {
  const token = await signToken({ sub: user._id, userType });
  ["password", "__v", "updatedAt"].forEach((key) => delete user[key]);
  res.cookie("access_token", token, {
    maxAge: 1000 * 60 * 60 * 24 * 60, // 60 days
    httpOnly: true,
    sameSite: "Strict",
  });
  responseFn.success(res, {
    data: {
      ...user,
      userType,
      ...(userType === "company" && {
        chatbot: user.chatbots?.[0] || null,
        chatbots: undefined,
      }),
    },
    token,
  });
};

export const json = (data) => JSON.parse(JSON.stringify(data));

const signToken = async (data) => {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  const jwt = await new SignJWT(data)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(appConfig.appName)
    .setAudience(data._id)
    .setExpirationTime("60 days")
    .sign(secret);

  return jwt;
};

export const genId = (l, { uppercase, lowercase, letters, numbers } = {}) => {
  const _l = "abcdefghijklmnopqrstuvwxyz";
  const _n = "0123456789";
  let a =
    !numbers && !letters ? _l + _n : (letters ? _l : "") + (numbers ? _n : "");

  let id = "";

  for (let i = 0; i < l; i++) {
    id += a[Math.floor(Math.random() * a.length)];
  }

  if (uppercase) {
    id = id.toUpperCase();
  }
  if (lowercase) {
    id = id.toLowerCase();
  }

  return id;
};

const key = crypto
  .createHash("sha512")
  .update(process.env.ENCRYPTION_KEY)
  .digest("hex")
  .substring(0, 32);
const encryptionIV = crypto
  .createHash("sha512")
  .update(process.env.ENCRYPTION_IV)
  .digest("hex")
  .substring(0, 16);
const ecnryption_method = "aes-256-cbc";

export const encryptString = (data) => {
  const cipher = crypto.createCipheriv(ecnryption_method, key, encryptionIV);
  return Buffer.from(
    cipher.update(data, "utf8", "hex") + cipher.final("hex")
  ).toString("base64");
};

export const decryptString = (encryptedData) => {
  try {
    const buff = Buffer.from(encryptedData, "base64");
    const decipher = crypto.createDecipheriv(
      ecnryption_method,
      key,
      encryptionIV
    );
    return (
      decipher.update(buff.toString("utf8"), "hex", "utf8") +
      decipher.final("utf8")
    );
  } catch (err) {
    return null;
  }
};

export const normalizeDomain = (url) =>
  (url || "")
    .toLowerCase()
    .replace(/(https?:\/\/)(www\.)?/, "")
    .replace(/\/.*/, "") || "";
