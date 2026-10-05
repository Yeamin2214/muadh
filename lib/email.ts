/** Sends one email through Brevo. Returns false (never throws) if email isn't configured or fails. */
export async function sendEmail(to: string, subject: string, text: string): Promise<boolean> {
  const key = process.env.BREVO_API_KEY, from = process.env.EMAIL_FROM;
  if (!key || !from || !to) return false;
  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "content-type": "application/json", "api-key": key },
      signal: AbortSignal.timeout(10_000),
      body: JSON.stringify({
        sender: { email: from, name: process.env.EMAIL_FROM_NAME || "Mu'adh" },
        to: [{ email: to }],
        subject,
        textContent: text,
        htmlContent: `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.7;white-space:pre-wrap">${text.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</div>`,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Mentor review emails, in English and Arabic together. */
export function mentorEmail(kind: "approved" | "rejected", name: string, note?: string | null) {
  if (kind === "approved") {
    return {
      subject: "Your Mu'adh mentor account is approved | تم قبول حسابك كمرشد",
      text: `Assalamu alaikum ${name},\n\nYour mentor application for Mu'adh has been reviewed and approved. JazakAllahu khairan for joining us.\nYou can now sign in through "Mentor sign in" on the Mu'adh website.\n\nالسلام عليكم ${name}،\n\nتمت مراجعة طلب انضمامك كمرشد في معاذ وقبوله. جزاك الله خيرًا.\nيمكنك الآن الدخول عبر «دخول المرشدين» في موقع معاذ.\n\nThe Mu'adh team | فريق معاذ`,
    };
  }
  return {
    subject: "About your Mu'adh mentor application | بخصوص طلبك كمرشد",
    text: `Assalamu alaikum ${name},\n\nThank you for applying to be a mentor on Mu'adh. We couldn't approve your application yet.${note ? `\nNote from our team: ${note}` : ""}\nYou can sign in through "Mentor sign in" and update your application.\n\nالسلام عليكم ${name}،\n\nشكرًا لتقديمك طلب الانضمام كمرشد في معاذ. لم نتمكن من قبول الطلب بعد.${note ? `\nملاحظة من فريقنا: ${note}` : ""}\nيمكنك الدخول عبر «دخول المرشدين» وتحديث طلبك.\n\nThe Mu'adh team | فريق معاذ`,
  };
}
