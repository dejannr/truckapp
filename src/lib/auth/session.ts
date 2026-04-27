import crypto from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "ta_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

type SessionPayload = {
  userId: string;
  email: string;
  role: "ADMIN" | "CLIENT";
  clientId: string | null;
  exp: number;
};

function getSecret() {
  return process.env.SESSION_SECRET || "local-dev-session-secret";
}

function sign(data: string): string {
  return crypto.createHmac("sha256", getSecret()).update(data).digest("hex");
}

export function encodeSession(payload: Omit<SessionPayload, "exp">): string {
  const full: SessionPayload = {
    ...payload,
    exp: Date.now() + MAX_AGE_SECONDS * 1000,
  };
  const b64 = Buffer.from(JSON.stringify(full)).toString("base64url");
  return `${b64}.${sign(b64)}`;
}

export function decodeSession(token: string): SessionPayload | null {
  const [b64, sig] = token.split(".");
  if (!b64 || !sig) return null;
  if (sig !== sign(b64)) return null;
  try {
    const payload = JSON.parse(Buffer.from(b64, "base64url").toString("utf8")) as SessionPayload;
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function getSessionUser() {
  const jar = await cookies();
  const raw = jar.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  return decodeSession(raw);
}

export async function setSessionCookie(token: string) {
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE_SECONDS,
    path: "/",
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.set(COOKIE_NAME, "", { maxAge: 0, path: "/" });
}
