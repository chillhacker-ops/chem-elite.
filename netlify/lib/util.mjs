import crypto from "node:crypto";
import { getStore } from "@netlify/blobs";

export const DAYS = 31 * 864e5; // one billing month plus a little grace
export const json = (o, s = 200) =>
  new Response(JSON.stringify(o), { status: s, headers: { "Content-Type": "application/json" } });

// Signed token: proves the email was verified by a real payment. Secret never leaves the server.
const sign = (e) => crypto.createHmac("sha256", process.env.TOKEN_SECRET).update(e).digest("hex");
export const makeToken = (e) => Buffer.from(e).toString("base64url") + "." + sign(e);
export function readToken(t) {
  try {
    const [b, s] = String(t).split(".");
    const e = Buffer.from(b, "base64url").toString();
    const a = Buffer.from(sign(e)), c = Buffer.from(s);
    return a.length === c.length && crypto.timingSafeEqual(a, c) ? e : null;
  } catch { return null; }
}

// Extend a subscriber's access by one month. Safe to call twice for the same payment.
export async function grant(email, ref) {
  const store = getStore("subscribers");
  const old = await store.get(email, { type: "json" });
  if (old?.refs?.includes(ref)) return;
  const refs = [...(old?.refs || []), ref].slice(-10);
  await store.setJSON(email, { expires: Math.max(Date.now(), old?.expires || 0) + DAYS, refs });
}
