export const WORKSHOP_MODES = ["online", "offline"];
export const WORKSHOP_GENDERS = ["any", "male", "female"];
export const WORKSHOP_PUBLICATION_STATUSES = ["draft", "published", "hidden", "archived"];
export const WORKSHOP_SESSION_STATUSES = ["open", "closed", "cancelled", "completed"];
export const WORKSHOP_BOOKING_STATUSES = ["pending", "awaiting_payment", "confirmed", "cancelled", "rejected", "completed"];
export const WORKSHOP_ATTENDANCE_STATUSES = ["not_marked", "attended", "no_show"];
export const WORKSHOP_PAYMENT_METHODS = ["bank_transfer", "wire_transfer", "ach", "check", "cash", "other"];
export const RESERVING_WORKSHOP_BOOKING_STATUSES = ["pending", "awaiting_payment", "confirmed"];
export const WORKSHOP_BOOKING_TRANSITIONS = {
  pending: ["awaiting_payment", "cancelled", "rejected"],
  awaiting_payment: ["cancelled", "rejected"],
  confirmed: ["completed", "cancelled"],
  cancelled: [], rejected: [], completed: [],
};
export const DEFAULT_WORKSHOP_CURRENCY = "USD";
