export const ANALYTICS_EVENT_NAMES = [
  "page_view",
  "book_view",
  "category_view",
  "workshop_view",
  "books_search",
  "categories_search",
  "workshops_search",
  "book_request_started",
  "book_added_to_request",
  "book_removed_from_request",
  "book_request_submitted",
  "workshop_booking_started",
  "workshop_booking_submitted",
  "registration_completed",
  "login_completed",
];

export const ANALYTICS_ENTITY_TYPES = [
  "book",
  "category",
  "workshop",
  "workshop_session",
  "book_request",
  "workshop_booking",
];

export const ANALYTICS_DEVICE_CATEGORIES = ["desktop", "tablet", "mobile", "other"];
export const ANALYTICS_LOCALES = ["en", "ar"];
export const ANALYTICS_SESSION_TIMEOUT_MS = 30 * 60 * 1000;
export const ANALYTICS_PROPERTIES_MAX_BYTES = 2048;
export const ANALYTICS_DEFAULT_TIMEZONE = "Africa/Cairo";
export const ANALYTICS_MAX_RANGE_DAYS = 366;
export const ANALYTICS_LOYAL_PURCHASE_THRESHOLD = 3;

export const ANALYTICS_EVENT_PROPERTY_ALLOWLIST = {
  page_view: [],
  book_view: [],
  category_view: [],
  workshop_view: [],
  books_search: ["resultCount"],
  categories_search: ["resultCount"],
  workshops_search: ["resultCount"],
  book_request_started: ["itemCount"],
  book_added_to_request: ["quantity"],
  book_removed_from_request: ["quantity"],
  book_request_submitted: ["itemCount", "totalQuantity"],
  workshop_booking_started: [],
  workshop_booking_submitted: [],
  registration_completed: [],
  login_completed: [],
};

export const ANALYTICS_EVENT_ENTITY_RULES = {
  book_view: ["book"],
  category_view: ["category"],
  workshop_view: ["workshop"],
  book_added_to_request: ["book"],
  book_removed_from_request: ["book"],
  book_request_submitted: ["book_request"],
  workshop_booking_started: ["workshop_session"],
  workshop_booking_submitted: ["workshop_booking"],
};

export const PURCHASED_BOOK_REQUEST_SQL = `
  COALESCE(payment.net_paid, 0) > 0
  AND request.payment_status IN ('partially_paid', 'paid')
  AND request.request_status NOT IN ('cancelled', 'rejected')
`;

