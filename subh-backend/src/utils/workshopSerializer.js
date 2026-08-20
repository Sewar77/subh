const camel = (row, key) => row?.[key] ?? null;
const pageResult = (rows, page, limit, mapper) => ({
  items: rows.map(mapper),
  pagination: { page, limit, total: Number(rows[0]?.total_count || 0), totalPages: Math.ceil(Number(rows[0]?.total_count || 0) / limit) },
});

const safeSession = (session) => ({
  id: session.id,
  startsAt: camel(session, "starts_at"), endsAt: camel(session, "ends_at"),
  timezone: session.timezone, seatCapacity: Number(session.seat_capacity),
  reservedSeats: Number(session.reserved_seats || 0),
  remainingSeats: Math.max(0, Number(session.seat_capacity) - Number(session.reserved_seats || 0)),
  full: Number(session.reserved_seats || 0) >= Number(session.seat_capacity),
  price: session.price, currencyCode: session.currency_code,
  generalLocation: [session.city, session.state, session.country].filter(Boolean).join(", ") || null,
});

export const serializePublicWorkshop = (row) => ({
  id: row.id, title: row.title, description: row.description, subject: row.subject,
  imageUrl: row.image_url, durationMinutes: row.duration_minutes, price: row.price,
  currencyCode: row.currency_code, mode: row.mode,
  genderEligibility: row.gender_eligibility, minAge: row.min_age, maxAge: row.max_age,
  registrationInstructions: row.registration_instructions ?? null,
  category: row.category, presenter: row.presenter,
  nextSession: row.next_session_id ? safeSession({ id: row.next_session_id, starts_at: row.next_session_starts_at, ends_at: row.next_session_ends_at, timezone: row.next_session_timezone, seat_capacity: row.seat_capacity, reserved_seats: row.reserved_seats, price: row.price, currency_code: row.currency_code }) : null,
});
export const serializePublicWorkshopPage = (rows, page, limit) => pageResult(rows, page, limit, serializePublicWorkshop);
export const serializePublicSession = safeSession;

export const serializeAdminWorkshop = (row) => ({
  id: row.id, titleEn: row.title_en, titleAr: row.title_ar,
  descriptionEn: row.description_en, descriptionAr: row.description_ar,
  subjectEn: row.subject_en, subjectAr: row.subject_ar,
  categoryId: row.category_id, presenterId: row.presenter_id, imageUrl: row.image_url,
  durationMinutes: row.duration_minutes, price: row.price, currencyCode: row.currency_code,
  mode: row.mode, genderEligibility: row.gender_eligibility, minAge: row.min_age,
  maxAge: row.max_age, registrationInstructionsEn: row.registration_instructions_en,
  registrationInstructionsAr: row.registration_instructions_ar,
  publicationStatus: row.publication_status,
  category: row.category_name_en ? { nameEn: row.category_name_en, nameAr: row.category_name_ar } : undefined,
  presenter: row.presenter_name_en ? { nameEn: row.presenter_name_en, nameAr: row.presenter_name_ar } : undefined,
  upcomingSessionCount: Number(row.upcoming_session_count || 0), bookingCount: Number(row.booking_count || 0),
  upcomingCapacity: Number(row.upcoming_capacity || 0), createdAt: row.created_at, updatedAt: row.updated_at,
});
export const serializeAdminWorkshopPage = (rows, page, limit) => pageResult(rows, page, limit, serializeAdminWorkshop);

export const serializeAdminSession = (row) => ({
  id: row.id, workshopId: row.workshop_id, startsAt: row.starts_at, endsAt: row.ends_at,
  timezone: row.timezone, seatCapacity: row.seat_capacity, status: row.status,
  priceOverride: row.price_override, meetingLink: row.meeting_link,
  venueName: row.venue_name, addressLine1: row.address_line1, addressLine2: row.address_line2,
  city: row.city, state: row.state, postalCode: row.postal_code, country: row.country,
  locationInstructions: row.location_instructions, mapUrl: row.map_url,
  reservedSeats: Number(row.reserved_seats || 0), confirmedSeats: Number(row.confirmed_seats || 0),
  remainingSeats: Math.max(0, Number(row.seat_capacity) - Number(row.reserved_seats || 0)),
});

const bookingBase = (row, lang = "en") => ({
  id: row.id, referenceNumber: row.reference_number,
  workshopId: row.workshop_id, sessionId: row.session_id,
  workshopTitle: lang === "ar" ? row.workshop_title_ar_snapshot : row.workshop_title_en_snapshot,
  presenterName: lang === "ar" ? row.presenter_name_ar_snapshot : row.presenter_name_en_snapshot,
  categoryName: lang === "ar" ? row.category_name_ar_snapshot : row.category_name_en_snapshot,
  mode: row.mode_snapshot, startsAt: row.session_starts_at_snapshot,
  endsAt: row.session_ends_at_snapshot, timezone: row.session_timezone_snapshot,
  price: row.price_snapshot, currencyCode: row.currency_code,
  registrationInstructions: lang === "ar" ? row.registration_instructions_ar_snapshot : row.registration_instructions_en_snapshot,
  bookingStatus: row.booking_status, paymentStatus: row.payment_status,
  attendanceStatus: row.attendance_status, confirmedAt: row.confirmed_at,
  createdAt: row.created_at, updatedAt: row.updated_at,
});

export const serializeCustomerBooking = (row, lang = "en") => {
  const confirmed = row.booking_status === "confirmed" || row.booking_status === "completed";
  return {
    ...bookingBase(row, lang),
    attendee: { fullName: row.attendee_full_name, email: row.attendee_email, phone: row.attendee_phone, age: row.attendee_age, gender: row.attendee_gender, addressLine1: row.address_line1, addressLine2: row.address_line2, city: row.city, state: row.state, postalCode: row.postal_code, country: row.country },
    ...(confirmed && row.mode_snapshot === "online" ? { meetingLink: row.meeting_link_snapshot } : {}),
    ...(confirmed && row.mode_snapshot === "offline" ? { location: { venueName: row.venue_name_snapshot, address: row.location_address_snapshot, instructions: row.location_instructions_snapshot } } : {}),
  };
};
export const serializeCustomerBookingPage = (rows, page, limit, lang) => pageResult(rows, page, limit, (row) => bookingBase(row, lang));
export const serializeAdminBooking = (row) => ({ ...bookingBase(row), userId: row.user_id, attendee: { fullName: row.attendee_full_name, email: row.attendee_email, phone: row.attendee_phone, age: row.attendee_age, gender: row.attendee_gender, addressLine1: row.address_line1, addressLine2: row.address_line2, city: row.city, state: row.state, postalCode: row.postal_code, country: row.country }, meetingLink: row.meeting_link_snapshot, location: { venueName: row.venue_name_snapshot, address: row.location_address_snapshot, instructions: row.location_instructions_snapshot }, attendanceMarkedAt: row.attendance_marked_at, history: row.history || [] });
export const serializeAdminBookingPage = (rows, page, limit) => pageResult(rows, page, limit, serializeAdminBooking);

export const serializeWorkshopCategory = (row) => ({ id: row.id, nameEn: row.name_en, nameAr: row.name_ar, descriptionEn: row.description_en, descriptionAr: row.description_ar, isActive: row.is_active, createdAt: row.created_at, updatedAt: row.updated_at });
export const serializeWorkshopPresenter = (row, { publicView = false } = {}) => ({ id: row.id, nameEn: row.name_en, nameAr: row.name_ar, bioEn: row.bio_en, bioAr: row.bio_ar, professionalTitleEn: row.professional_title_en, professionalTitleAr: row.professional_title_ar, imageUrl: row.image_url, ...(publicView ? {} : { email: row.email, phone: row.phone, isActive: row.is_active }), createdAt: row.created_at, updatedAt: row.updated_at });
