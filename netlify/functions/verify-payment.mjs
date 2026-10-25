import { json, makeToken, grant } from "../lib/util.mjs";

export default async (req) => {
  const ref = new URL(req.url).searchParams.get("reference");
  if (!ref) return json({ error: "Missing reference" }, 400);
  const res = await fetch("https://api.paystack.co/transaction/verify/" + encodeURIComponent(ref), {
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
  });
  const d = await res.json();
  const t = d.data;
  // Only unlock if Paystack itself confirms a successful ₦500+ payment.
  if (!d.status || t.status !== "success" || t.currency !== "NGN" || t.amount < 50000)
    return json({ error: "Payment not confirmed." }, 402);
  const email = t.customer.email.toLowerCase();
  await grant(email, ref);
  return json({ token: makeToken(email) });
};
export const config = { path: "/api/verify-payment" };
