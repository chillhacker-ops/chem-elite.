import { getStore } from "@netlify/blobs";
import { json, readToken } from "../lib/util.mjs";

export default async (req) => {
  const { token } = await req.json().catch(() => ({}));
  const email = readToken(token);
  if (!email) return json({ plus: false });
  const s = await getStore("subscribers").get(email, { type: "json" });
  return json({ plus: !!s && s.expires > Date.now() });
};
export const config = { path: "/api/check-access" };
