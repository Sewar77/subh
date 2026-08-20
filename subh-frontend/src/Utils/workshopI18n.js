const copy = {
  en: {
    workshops: "Workshops", discover: "Discover Subh Workshops", search: "Search", mode: "Mode", category: "Category",
    loading: "Loading Workshops…", empty: "No Workshops match these filters.", view: "View details", book: "Book This Session",
    full: "This session is full.", fullShort: "Full", almostFull: "Almost Full", closed: "Closed", available: "Available", seatsRemaining: "seats remaining", online: "Online", offline: "Offline", any: "Any",
    male: "Male", female: "Female", duration: "Duration", minutes: "minutes", price: "Price", free: "Free",
    eligibility: "Eligibility", sessions: "Available sessions", presenter: "Presenter", booking: "Workshop booking",
    submit: "Reserve my seat", myBookings: "My Workshops", noBookings: "You have no Workshop bookings yet.",
    back: "Back to Workshops", status: "Status", payment: "Payment", attendance: "Attendance", attendee: "Attendee",
    address: "Address", confirmedDetails: "Confirmed attendance details", viewBooking: "View booking", bookingSuccess: "Your seat has been reserved",
    paymentNotice: "Payment is completed offline. Your seat is reserved after submitting the booking. Subh will confirm your booking after payment is received.",
  },
  ar: {
    workshops: "ورش العمل", discover: "اكتشف ورش عمل صبح", search: "بحث", mode: "النوع", category: "التصنيف",
    loading: "جارٍ تحميل ورش العمل…", empty: "لا توجد ورش عمل مطابقة لهذه المرشحات.", view: "عرض التفاصيل", book: "احجز هذه الجلسة",
    full: "هذه الجلسة مكتملة.", fullShort: "مكتملة", almostFull: "أوشكت على الاكتمال", closed: "مغلقة", available: "متاح", seatsRemaining: "مقاعد متبقية", online: "عن بُعد", offline: "حضوري", any: "الجميع",
    male: "ذكر", female: "أنثى", duration: "المدة", minutes: "دقيقة", price: "السعر", free: "مجانية",
    eligibility: "شروط المشاركة", sessions: "الجلسات المتاحة", presenter: "المقدم", booking: "حجز ورشة عمل",
    submit: "احجز مقعدي", myBookings: "ورش العمل الخاصة بي", noBookings: "لا توجد لديك حجوزات ورش عمل بعد.",
    back: "العودة إلى ورش العمل", status: "الحالة", payment: "الدفع", attendance: "الحضور", attendee: "المشارك",
    address: "العنوان", confirmedDetails: "تفاصيل الحضور المؤكدة", viewBooking: "عرض الحجز", bookingSuccess: "تم حجز مقعدك",
    paymentNotice: "يتم الدفع خارج الموقع. يُحجز مقعدك بعد إرسال الحجز، وستؤكد صبح حجزك بعد استلام الدفعة.",
  },
};

export const getWorkshopCopy = (lang) => copy[lang] || copy.en;
export const workshopLocale = (lang) => lang === "ar" ? "ar-EG-u-nu-arab" : "en-US";
export const formatWorkshopDate = (value, lang, options = {}) => value
  ? new Intl.DateTimeFormat(workshopLocale(lang), { dateStyle: "medium", timeStyle: "short", ...options }).format(new Date(value))
  : "—";
export const formatWorkshopDay = (value, lang, timeZone) => value
  ? new Intl.DateTimeFormat(workshopLocale(lang), { dateStyle: "medium", ...(timeZone ? { timeZone } : {}) }).format(new Date(value))
  : "—";
export const formatWorkshopTimeRange = (startsAt, endsAt, lang, timeZone) => {
  const formatter = new Intl.DateTimeFormat(workshopLocale(lang), {
    hour: "numeric",
    minute: "2-digit",
    ...(timeZone ? { timeZone } : {}),
  });
  return startsAt && endsAt ? `${formatter.format(new Date(startsAt))} – ${formatter.format(new Date(endsAt))}` : "—";
};
export const formatWorkshopNumber = (value, lang) => new Intl.NumberFormat(workshopLocale(lang)).format(Number(value || 0));
export const formatWorkshopMoney = (value, currency, lang) => new Intl.NumberFormat(workshopLocale(lang), { style: "currency", currency: currency || "USD" }).format(Number(value || 0));

const labels = {
  pending: { en: "Pending", ar: "قيد الانتظار" }, awaiting_payment: { en: "Awaiting Payment", ar: "بانتظار الدفع" },
  confirmed: { en: "Confirmed", ar: "مؤكد" }, cancelled: { en: "Cancelled", ar: "ملغى" }, rejected: { en: "Rejected", ar: "مرفوض" },
  completed: { en: "Completed", ar: "مكتمل" }, paid: { en: "Paid", ar: "مدفوع" }, voided: { en: "Voided", ar: "ملغى" },
  not_marked: { en: "Not Marked", ar: "لم يُسجل" }, attended: { en: "Attended", ar: "حضر" }, no_show: { en: "No Show", ar: "لم يحضر" },
  draft: { en: "Draft", ar: "مسودة" }, published: { en: "Published", ar: "منشور" }, hidden: { en: "Hidden", ar: "مخفي" },
  archived: { en: "Archived", ar: "مؤرشف" }, open: { en: "Open", ar: "مفتوحة" }, closed: { en: "Closed", ar: "مغلقة" },
  online: { en: "Online", ar: "عن بُعد" }, offline: { en: "Offline", ar: "حضوري" }, any: { en: "Any", ar: "الجميع" },
  male: { en: "Male", ar: "ذكر" }, female: { en: "Female", ar: "أنثى" },
  bank_transfer: { en: "Bank Transfer", ar: "تحويل بنكي" }, wire_transfer: { en: "Wire Transfer", ar: "حوالة مصرفية" },
  ach: { en: "ACH", ar: "تحويل ACH" }, check: { en: "Check", ar: "شيك" }, cash: { en: "Cash", ar: "نقدًا" }, other: { en: "Other", ar: "أخرى" },
};
export const workshopStatusLabel = (value, lang = "en") => labels[value]?.[lang] || String(value || "—").replaceAll("_", " ");
