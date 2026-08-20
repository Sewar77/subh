import { EmailParams, MailerSend, Recipient, Sender } from "mailersend";
import {
  getPendingWorkshopOutbox,
  markWorkshopOutboxFailed,
  markWorkshopOutboxSent,
} from "../../models/workshop.Model.js";

const htmlEscape = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);

export const buildWorkshopConfirmationEmail = (booking) => {
  const online = booking.mode_snapshot === "online";
  const delivery = online
    ? `<p><strong>Meeting link:</strong> <a href="${htmlEscape(booking.meeting_link_snapshot)}">Join Workshop</a></p>`
    : `<p><strong>Location:</strong> ${htmlEscape([booking.venue_name_snapshot, booking.location_address_snapshot].filter(Boolean).join(", "))}</p><p>${htmlEscape(booking.location_instructions_snapshot || "")}</p>`;
  const start = new Intl.DateTimeFormat("en-US", { dateStyle: "full", timeStyle: "short", timeZone: booking.session_timezone_snapshot }).format(new Date(booking.session_starts_at_snapshot));
  const end = new Intl.DateTimeFormat("en-US", { timeStyle: "short", timeZone: booking.session_timezone_snapshot }).format(new Date(booking.session_ends_at_snapshot));
  const durationMinutes = Math.max(0, Math.round((new Date(booking.session_ends_at_snapshot) - new Date(booking.session_starts_at_snapshot)) / 60000));
  return {
    subject: `Workshop confirmed: ${booking.workshop_title_en_snapshot}`,
    text: `Hello ${booking.attendee_full_name}, your Workshop booking ${booking.reference_number} is confirmed. ${booking.workshop_title_en_snapshot}, presented by ${booking.presenter_name_en_snapshot}, ${start}–${end} (${durationMinutes} minutes). ${online ? `Meeting link: ${booking.meeting_link_snapshot}` : `Location: ${[booking.venue_name_snapshot, booking.location_address_snapshot].filter(Boolean).join(", ")}`} ${booking.registration_instructions_en_snapshot || ""}\nتم تأكيد حجز ورشة العمل ${booking.workshop_title_ar_snapshot}، ويقدمها ${booking.presenter_name_ar_snapshot}. ${booking.registration_instructions_ar_snapshot || ""}`,
    html: `<h1>Workshop booking confirmed</h1><p>Hello ${htmlEscape(booking.attendee_full_name)},</p><p>Your booking <strong>${htmlEscape(booking.reference_number)}</strong> is confirmed.</p><h2>${htmlEscape(booking.workshop_title_en_snapshot)}</h2><p><strong>Presenter:</strong> ${htmlEscape(booking.presenter_name_en_snapshot)}</p><p><strong>Session:</strong> ${htmlEscape(start)}–${htmlEscape(end)}</p><p><strong>Duration:</strong> ${durationMinutes} minutes</p>${delivery}${booking.registration_instructions_en_snapshot ? `<p><strong>Instructions:</strong> ${htmlEscape(booking.registration_instructions_en_snapshot)}</p>` : ""}<hr><section dir="rtl"><h2>تم تأكيد حجز ورشة العمل</h2><p><strong>${htmlEscape(booking.workshop_title_ar_snapshot)}</strong></p><p>المقدم: ${htmlEscape(booking.presenter_name_ar_snapshot)}</p>${booking.registration_instructions_ar_snapshot ? `<p>${htmlEscape(booking.registration_instructions_ar_snapshot)}</p>` : ""}</section>`,
  };
};

const createDefaultProvider = () => {
  const apiKey = process.env.MAILERSEND_API_KEY;
  const fromEmail = process.env.WORKSHOP_EMAIL_FROM;
  const fromName = process.env.WORKSHOP_EMAIL_FROM_NAME || "Subh";
  if (!apiKey || !fromEmail) return null;
  const client = new MailerSend({ apiKey });
  return {
    send: ({ to, subject, html, text }) => client.email.send(new EmailParams()
      .setFrom(new Sender(fromEmail, fromName))
      .setTo([new Recipient(to)])
      .setSubject(subject).setHtml(html).setText(text)),
  };
};

export const dispatchWorkshopConfirmationEmail = async (
  bookingId,
  { provider = createDefaultProvider(), repository = { get: getPendingWorkshopOutbox, sent: markWorkshopOutboxSent, failed: markWorkshopOutboxFailed } } = {},
) => {
  const pending = await repository.get(bookingId);
  if (!pending) return { status: "not_pending" };
  if (!provider) {
    await repository.failed(pending.id, "Workshop email provider is not configured");
    return { status: "not_configured" };
  }
  try {
    await provider.send({ to: pending.attendee_email, ...buildWorkshopConfirmationEmail(pending) });
    await repository.sent(pending.id);
    return { status: "sent" };
  } catch {
    await repository.failed(pending.id, "Workshop confirmation email delivery failed");
    return { status: "failed" };
  }
};
