 // Server-only helper for grievance notification emails.
// Sending is done through a configured email API. Until an email domain is
// configured for the project, this logs the notification instead of failing the
// grievance submission.

type NotificationPayload = {
  grievance_id: string;
  operator_name: string;
  operator_id: string;
  district: string;
  training_location: string;
  trainer_name: string;
  training_date: string;
  category: string;
  priority: string;
  subject: string;
  status: string;
};

function renderText(p: NotificationPayload) {
  return [
    `New grievance received: ${p.grievance_id}`,
    ``,
    `Grievance ID     : ${p.grievance_id}`,
    `Operator Name    : ${p.operator_name}`,
    `Operator ID      : ${p.operator_id}`,
    `District         : ${p.district}`,
    `Training Location: ${p.training_location}`,
    `Trainer Name     : ${p.trainer_name}`,
    `Training Date    : ${p.training_date}`,
    `Category         : ${p.category}`,
    `Priority         : ${p.priority}`,
    `Subject          : ${p.subject}`,
    `Current Status   : ${p.status}`,
  ].join("\n");
}

export async function sendGrievanceNotifications(
  recipients: string[],
  payload: NotificationPayload,
): Promise<{ delivered: string[]; skipped: string[] }> {
  const clean = [...new Set(recipients.filter((r) => !!r && r.includes("@")))];

  const senderDomain = process.env["SENDER_DOMAIN"];
  const apiKey = process.env["EMAIL_API_KEY"];
  const emailApiUrl =
    process.env["EMAIL_API_URL"] ?? "https://api.resend.com/emails";

  if (!senderDomain || !apiKey) {
    // Email domain not configured yet — never block the submission.
    console.info(
      `[notifications] email domain not configured; would notify ${clean.join(", ")}\n${renderText(payload)}`,
    );

    return {
      delivered: [],
      skipped: clean,
    };
  }

  const delivered: string[] = [];
  const skipped: string[] = [];

  for (const to of clean) {
    try {
      const res = await fetch(emailApiUrl, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: `Grievance Portal <notifications@${senderDomain}>`,
          to,
          subject: `[${payload.priority}] Grievance ${payload.grievance_id} — ${payload.subject}`,
          text: renderText(payload),
          idempotency_key: `grv-${payload.grievance_id}-${to}`,
        }),
      });

      if (res.ok) {
        delivered.push(to);
      } else {
        skipped.push(to);
        console.error(
          `[notifications] send failed for ${to}: ${res.status}`,
        );
      }
    } catch (error) {
      skipped.push(to);
      console.error("[notifications] send error", error);
    }
  }

  return {
    delivered,
    skipped,
  };
}