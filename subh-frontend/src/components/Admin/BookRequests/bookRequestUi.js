export const STATUS_OPTIONS = {
  request: [
    "pending",
    "under_review",
    "quote_sent",
    "confirmed",
    "cancelled",
    "rejected",
    "completed",
  ],
  contact: [
    "not_contacted",
    "attempted",
    "contacted",
    "waiting_customer",
    "follow_up_required",
    "resolved",
  ],
  payment: [
    "not_required_yet",
    "awaiting_payment",
    "partially_paid",
    "paid",
    "refunded",
    "cancelled",
  ],
  fulfillment: ["not_started", "preparing", "ready", "shipped", "delivered"],
  quote: ["not_prepared", "draft", "sent", "accepted", "declined", "expired"],
};

export const STATUS_TRANSITIONS = {
  request: {
    pending: ["under_review", "cancelled", "rejected"],
    under_review: ["quote_sent", "cancelled", "rejected"],
    quote_sent: ["confirmed", "cancelled", "rejected"],
    confirmed: ["completed", "cancelled"],
  },
  contact: {
    not_contacted: ["attempted", "contacted", "waiting_customer", "follow_up_required", "resolved"],
    attempted: ["contacted", "waiting_customer", "follow_up_required", "resolved"],
    contacted: ["waiting_customer", "follow_up_required", "resolved"],
    waiting_customer: ["contacted", "follow_up_required", "resolved"],
    follow_up_required: ["attempted", "contacted", "waiting_customer", "resolved"],
    resolved: ["attempted", "contacted", "follow_up_required"],
  },
  fulfillment: {
    not_started: ["preparing"],
    preparing: ["ready"],
    ready: ["shipped"],
    shipped: ["delivered"],
  },
  quote: {
    not_prepared: [],
    draft: ["sent"],
    sent: ["accepted", "declined", "expired"],
    declined: [],
    expired: [],
  },
};

export const CONTACT_METHODS = ["phone", "email", "meeting", "sms", "other"];
export const CONTACT_OUTCOMES = [
  "no_answer",
  "voicemail",
  "left_message",
  "spoke_customer",
  "waiting_customer",
  "follow_up_required",
  "resolved",
  "other",
];

const SPECIAL_LABELS = {
  not_required_yet: "Payment Not Required Yet",
  not_contacted: "Not Contacted",
  under_review: "Under Review",
  follow_up_required: "Follow-up Required",
  not_prepared: "Not Prepared",
  not_started: "Not Started",
  waiting_customer: "Waiting for Customer",
  quote_sent: "Quote Sent",
  no_answer: "No Answer",
  left_message: "Left Message",
  spoke_customer: "Spoke with Customer",
};

export const humanizeStatus = (value) => {
  if (!value) return "—";
  if (SPECIAL_LABELS[value]) return SPECIAL_LABELS[value];
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

export const statusColor = (value) => {
  if (["completed", "delivered", "paid", "accepted", "resolved"].includes(value)) {
    return "success";
  }
  if (["cancelled", "rejected", "declined", "refunded"].includes(value)) {
    return "error";
  }
  if (["under_review", "follow_up_required", "awaiting_payment", "sent", "shipped"].includes(value)) {
    return "warning";
  }
  if (["confirmed", "contacted", "ready", "draft", "preparing"].includes(value)) {
    return "info";
  }
  return "default";
};

export const formatMoney = (value, currency = "USD") =>
  value === null || value === undefined ? "—" : `${currency} ${value}`;

export const formatDate = (value, withTime = false) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return withTime ? date.toLocaleString() : date.toLocaleDateString();
};

export const dateInputValue = (value) =>
  value ? new Date(value).toISOString().slice(0, 10) : "";
