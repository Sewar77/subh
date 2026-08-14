export const MAX_BOOK_REQUEST_ITEMS = 100;
export const MAX_BOOK_REQUEST_QUANTITY = 1000000;
export const DEFAULT_BOOK_REQUEST_PAGE_SIZE = 20;
export const MAX_BOOK_REQUEST_PAGE_SIZE = 100;

export const BOOK_REQUEST_STATUSES = {
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

export const BOOK_REQUEST_STATUS_COLUMNS = {
  request: "request_status",
  contact: "contact_status",
  fulfillment: "fulfillment_status",
  quote: "quote_status",
};

export const BOOK_REQUEST_TRANSITIONS = {
  request: {
    pending: ["under_review", "cancelled", "rejected"],
    under_review: ["quote_sent", "cancelled", "rejected"],
    quote_sent: ["confirmed", "cancelled", "rejected"],
    confirmed: ["completed", "cancelled"],
    cancelled: [],
    rejected: [],
    completed: [],
  },
  contact: {
    not_contacted: [
      "attempted",
      "contacted",
      "waiting_customer",
      "follow_up_required",
      "resolved",
    ],
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
    delivered: [],
  },
  quote: {
    not_prepared: ["draft"],
    draft: ["sent"],
    sent: ["accepted", "declined", "expired"],
    accepted: [],
    declined: ["draft"],
    expired: ["draft"],
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

export const CONTACT_OUTCOME_STATUSES = {
  no_answer: "attempted",
  voicemail: "attempted",
  left_message: "attempted",
  spoke_customer: "contacted",
  waiting_customer: "waiting_customer",
  follow_up_required: "follow_up_required",
  resolved: "resolved",
  other: "attempted",
};
