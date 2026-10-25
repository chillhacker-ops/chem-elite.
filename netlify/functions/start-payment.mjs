import { json } from "../lib/util.mjs";

export default async (req) => {
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  const { email } = await req.json().catch(() => ({}));
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) return json({ error: "Enter a valid email." }, 400);
  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      email, amount: 50000, currency: "NGN", // ₦500 in kobo
      plan: process.env.PAYSTACK_PLAN_CODE,   // makes it a monthly subscription
      callback_url: new URL(req.url).origin + "/",
    }),
  });
  const d = await res.json();
  return d.status ? json({ url: d.data.authorization_url }) : json({ error: d.message || "Paystack error" }, 502);
};
export const config = { path: "/api/start-payment" };
