import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";

export async function requireApiAuth() {
  const user = await getSessionUser();
  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { user };
}

export async function requireApiRole(role: "ADMIN" | "CLIENT") {
  const auth = await requireApiAuth();
  if ("error" in auth) return auth;
  if (auth.user.role !== role) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { user: auth.user };
}
