import crypto from "node:crypto";
import { json, grant } from "../lib/util.mjs";

// Paystack calls this on every monthly renewal, which keeps Plus active.
export default async (req) => {
  const raw = await req.text();
  const sig = crypto.createHmac("sha512", process.env.PAYSTACK_SECRET_KEY).update(raw).digest("hex");
  if (sig !== req.headers.get("x-paystack-signature")) return json({ error: "bad signature" }, 401);
  const ev = JSON.parse(raw);
  if (ev.event === "charge.success") {
    const t = ev.data;
    if (t.currency === "NGN" && t.amount >= 50000) await grant(t.customer.email.toLowerCase(), t.reference);
  }
  return json({ ok: true });
};
export const config = { path: "/api/paystack-webhook" };
