import pool from "../config/db.js";

const WORKSHOP_ADMIN_COLUMNS = `w.id, w.title_en, w.title_ar, w.description_en, w.description_ar,
  w.subject_en, w.subject_ar, w.category_id, w.presenter_id, w.image_url,
  w.duration_minutes, w.price, w.currency_code, w.mode, w.gender_eligibility,
  w.min_age, w.max_age, w.registration_instructions_en,
  w.registration_instructions_ar, w.publication_status, w.created_at, w.updated_at`;

const WORKSHOP_JOIN_COLUMNS = `${WORKSHOP_ADMIN_COLUMNS},
  c.name_en AS category_name_en, c.name_ar AS category_name_ar,
  p.name_en AS presenter_name_en, p.name_ar AS presenter_name_ar,
  p.bio_en AS presenter_bio_en, p.bio_ar AS presenter_bio_ar,
  p.professional_title_en AS presenter_title_en,
  p.professional_title_ar AS presenter_title_ar, p.image_url AS presenter_image_url`;

const BOOKING_COLUMNS = `b.id, b.reference_number, b.user_id, b.workshop_id, b.session_id,
  b.attendee_full_name, b.attendee_email, b.attendee_phone, b.attendee_age,
  b.attendee_gender, b.address_line1, b.address_line2, b.city, b.state,
  b.postal_code, b.country, b.workshop_title_en_snapshot,
  b.workshop_title_ar_snapshot, b.presenter_name_en_snapshot,
  b.presenter_name_ar_snapshot, b.category_name_en_snapshot,
  b.category_name_ar_snapshot, b.mode_snapshot, b.session_starts_at_snapshot,
  b.session_ends_at_snapshot, b.session_timezone_snapshot, b.price_snapshot,
  b.currency_code, b.registration_instructions_en_snapshot,
  b.registration_instructions_ar_snapshot, b.meeting_link_snapshot, b.venue_name_snapshot,
  b.location_address_snapshot, b.location_instructions_snapshot,
  b.booking_status, b.payment_status, b.attendance_status, b.confirmed_at,
  b.attendance_marked_at, b.attendance_marked_by_admin_id,
  b.created_at, b.updated_at`;

const BOOKING_RETURNING_COLUMNS = BOOKING_COLUMNS.replaceAll("b.", "");

const CATEGORY_COLUMNS = "id,name_en,name_ar,description_en,description_ar,is_active,created_at,updated_at";
const PRESENTER_COLUMNS = "id,name_en,name_ar,bio_en,bio_ar,professional_title_en,professional_title_ar,email,phone,image_url,is_active,created_at,updated_at";
const SESSION_COLUMNS = "id,workshop_id,starts_at,ends_at,timezone,seat_capacity,status,price_override,meeting_link,venue_name,address_line1,address_line2,city,state,postal_code,country,location_instructions,map_url,created_at,updated_at";
const WORKSHOP_RETURNING_COLUMNS = WORKSHOP_ADMIN_COLUMNS.replaceAll("w.", "");

export const listPublicWorkshops = async ({ lang, search, categoryId, presenterId, mode, upcoming, page, limit }, db = pool) => {
  const localized = lang === "ar" ? { title: "w.title_ar", description: "w.description_ar", subject: "w.subject_ar", category: "c.name_ar", presenter: "p.name_ar", bio: "p.bio_ar", presenterTitle: "p.professional_title_ar" } : { title: "w.title_en", description: "w.description_en", subject: "w.subject_en", category: "c.name_en", presenter: "p.name_en", bio: "p.bio_en", presenterTitle: "p.professional_title_en" };
  const values = [];
  const where = ["w.publication_status = 'published'", "c.is_active = TRUE", "p.is_active = TRUE"];
  const add = (clause, value) => { values.push(value); where.push(clause.replace("?", `$${values.length}`)); };
  if (search) {
    const term = `%${search}%`;
    values.push(term, term, term);
    where.push(`(${localized.title} ILIKE $${values.length - 2} OR ${localized.description} ILIKE $${values.length - 1} OR ${localized.subject} ILIKE $${values.length})`);
  }
  if (categoryId) add("w.category_id = ?", categoryId);
  if (presenterId) add("w.presenter_id = ?", presenterId);
  if (mode) add("w.mode = ?", mode);
  if (upcoming) where.push("EXISTS (SELECT 1 FROM workshop_sessions ux WHERE ux.workshop_id = w.id AND ux.status = 'open' AND ux.starts_at > NOW())");
  values.push(limit, (page - 1) * limit);
  const result = await db.query(`
    SELECT w.id, ${localized.title} AS title, ${localized.description} AS description,
      ${localized.subject} AS subject, w.image_url, w.duration_minutes, w.price,
      w.currency_code, w.mode, w.gender_eligibility, w.min_age, w.max_age,
      json_build_object('id', c.id, 'name', ${localized.category}) AS category,
      json_build_object('id', p.id, 'name', ${localized.presenter}, 'bio', ${localized.bio},
        'professionalTitle', ${localized.presenterTitle}, 'imageUrl', p.image_url) AS presenter,
      next_session.id AS next_session_id, next_session.starts_at AS next_session_starts_at,
      next_session.ends_at AS next_session_ends_at, next_session.timezone AS next_session_timezone,
      next_session.seat_capacity, next_session.reserved_seats,
      COUNT(*) OVER()::INTEGER AS total_count
    FROM workshops w JOIN workshop_categories c ON c.id = w.category_id
    JOIN workshop_presenters p ON p.id = w.presenter_id
    LEFT JOIN LATERAL (
      SELECT s.id, s.starts_at, s.ends_at, s.timezone, s.seat_capacity,
        COUNT(b.id) FILTER (WHERE b.booking_status IN ('pending','awaiting_payment','confirmed'))::INTEGER AS reserved_seats
      FROM workshop_sessions s LEFT JOIN workshop_bookings b ON b.session_id = s.id
      WHERE s.workshop_id = w.id AND s.status = 'open' AND s.starts_at > NOW()
      GROUP BY s.id ORDER BY s.starts_at LIMIT 1
    ) next_session ON TRUE
    WHERE ${where.join(" AND ")}
    ORDER BY next_session.starts_at NULLS LAST, w.id DESC LIMIT $${values.length - 1} OFFSET $${values.length}
  `, values);
  return result.rows;
};

export const getPublicWorkshopById = async (id, lang, db = pool) => {
  const l = lang === "ar" ? "ar" : "en";
  const result = await db.query(`SELECT w.id, w.title_${l} AS title, w.description_${l} AS description,
    w.subject_${l} AS subject, w.image_url, w.duration_minutes, w.price, w.currency_code,
    w.mode, w.gender_eligibility, w.min_age, w.max_age,
    w.registration_instructions_${l} AS registration_instructions,
    json_build_object('id', c.id, 'name', c.name_${l}) AS category,
    json_build_object('id', p.id, 'name', p.name_${l}, 'bio', p.bio_${l},
      'professionalTitle', p.professional_title_${l}, 'imageUrl', p.image_url) AS presenter
    FROM workshops w JOIN workshop_categories c ON c.id = w.category_id
    JOIN workshop_presenters p ON p.id = w.presenter_id
    WHERE w.id = $1 AND w.publication_status = 'published' AND c.is_active = TRUE AND p.is_active = TRUE`, [id]);
  return result.rows[0] || null;
};

export const listPublicWorkshopSessions = async (workshopId, db = pool) => (await db.query(`
  SELECT s.id, s.starts_at, s.ends_at, s.timezone, s.seat_capacity,
    COALESCE(s.price_override, w.price) AS price, w.currency_code,
    s.venue_name, s.city, s.state, s.country,
    COUNT(b.id) FILTER (WHERE b.booking_status IN ('pending','awaiting_payment','confirmed'))::INTEGER AS reserved_seats
  FROM workshop_sessions s JOIN workshops w ON w.id = s.workshop_id
  LEFT JOIN workshop_bookings b ON b.session_id = s.id
  WHERE s.workshop_id = $1 AND s.status = 'open' AND s.starts_at > NOW()
  GROUP BY s.id, w.id ORDER BY s.starts_at`, [workshopId])).rows;

export const lockBookableSession = async (client, sessionId) => {
  const result = await client.query(`SELECT s.id, s.workshop_id, s.starts_at, s.ends_at, s.timezone,
    s.seat_capacity, s.status, s.price_override, s.meeting_link, s.venue_name,
    s.address_line1, s.address_line2, s.city, s.state, s.postal_code, s.country,
    s.location_instructions, w.title_en, w.title_ar, w.mode, w.price, w.currency_code,
    w.gender_eligibility, w.min_age, w.max_age, w.publication_status,
    w.registration_instructions_en, w.registration_instructions_ar,
    c.name_en AS category_name_en, c.name_ar AS category_name_ar,
    p.name_en AS presenter_name_en, p.name_ar AS presenter_name_ar
    FROM workshop_sessions s JOIN workshops w ON w.id = s.workshop_id
    JOIN workshop_categories c ON c.id = w.category_id JOIN workshop_presenters p ON p.id = w.presenter_id
    WHERE s.id = $1 AND c.is_active=TRUE AND p.is_active=TRUE FOR UPDATE OF s`, [sessionId]);
  return result.rows[0] || null;
};

export const countReservedSessionSeats = async (client, sessionId) => Number((await client.query("SELECT COUNT(*)::INTEGER AS count FROM workshop_bookings WHERE session_id = $1 AND booking_status IN ('pending','awaiting_payment','confirmed')", [sessionId])).rows[0]?.count || 0);
export const getActiveUserSessionBooking = async (client, sessionId, userId) => (await client.query("SELECT id FROM workshop_bookings WHERE session_id=$1 AND user_id=$2 AND booking_status IN ('pending','awaiting_payment','confirmed') LIMIT 1", [sessionId, userId])).rows[0] || null;

export const insertWorkshopBooking = async (client, data) => {
  const result = await client.query(`INSERT INTO workshop_bookings (
    user_id, workshop_id, session_id, attendee_full_name, attendee_email, attendee_phone,
    attendee_age, attendee_gender, address_line1, address_line2, city, state, postal_code,
    country, workshop_title_en_snapshot, workshop_title_ar_snapshot,
    presenter_name_en_snapshot, presenter_name_ar_snapshot, category_name_en_snapshot,
    category_name_ar_snapshot, mode_snapshot, session_starts_at_snapshot,
    session_ends_at_snapshot, session_timezone_snapshot, price_snapshot, currency_code,
    registration_instructions_en_snapshot, registration_instructions_ar_snapshot,
    meeting_link_snapshot, venue_name_snapshot, location_address_snapshot,
    location_instructions_snapshot, booking_status, payment_status)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,'awaiting_payment','awaiting_payment')
    RETURNING ${BOOKING_RETURNING_COLUMNS}`, [data.userId, data.workshopId, data.sessionId, data.fullName, data.email,
      data.phone, data.age, data.gender, data.addressLine1, data.addressLine2, data.city, data.state,
      data.postalCode, data.country, data.titleEn, data.titleAr, data.presenterEn, data.presenterAr,
      data.categoryEn, data.categoryAr, data.mode, data.startsAt, data.endsAt, data.timezone,
      data.price, data.currencyCode, data.registrationInstructionsEn, data.registrationInstructionsAr,
      data.meetingLink, data.venueName, data.locationAddress,
      data.locationInstructions]);
  return result.rows[0] || null;
};

export const insertBookingHistory = async (client, { bookingId, oldStatus, newStatus, changedByUserId, changedByAdminId, note }) => client.query(`INSERT INTO workshop_booking_status_history (booking_id, old_status, new_status, changed_by_user_id, changed_by_admin_id, note) VALUES ($1,$2,$3,$4,$5,$6)`, [bookingId, oldStatus, newStatus, changedByUserId, changedByAdminId, note]);

export const listCustomerBookings = async ({ userId, page, limit }, db = pool) => (await db.query(`SELECT ${BOOKING_COLUMNS}, COUNT(*) OVER()::INTEGER AS total_count FROM workshop_bookings b WHERE b.user_id = $1 ORDER BY b.created_at DESC LIMIT $2 OFFSET $3`, [userId, limit, (page - 1) * limit])).rows;
export const getCustomerBooking = async (id, userId, db = pool) => (await db.query(`SELECT ${BOOKING_COLUMNS} FROM workshop_bookings b WHERE b.id = $1 AND b.user_id = $2`, [id, userId])).rows[0] || null;

export const listAdminWorkshops = async ({ page, limit, search, categoryId, presenterId, mode, publicationStatus }, db = pool) => {
  const values = [];
  const where = [];
  const add = (column, value) => { values.push(value); where.push(`${column}=$${values.length}`); };
  if (search) { const term = `%${search}%`; values.push(term, term); where.push(`(w.title_en ILIKE $${values.length - 1} OR w.title_ar ILIKE $${values.length})`); }
  if (categoryId) add("w.category_id", categoryId);
  if (presenterId) add("w.presenter_id", presenterId);
  if (mode) add("w.mode", mode);
  if (publicationStatus) add("w.publication_status", publicationStatus);
  values.push(limit, (page - 1) * limit);
  return (await db.query(`SELECT ${WORKSHOP_JOIN_COLUMNS},
    (SELECT COUNT(*)::INTEGER FROM workshop_sessions s WHERE s.workshop_id=w.id AND s.starts_at>NOW()) AS upcoming_session_count,
    (SELECT COUNT(*)::INTEGER FROM workshop_bookings b WHERE b.workshop_id=w.id) AS booking_count,
    (SELECT COALESCE(SUM(s.seat_capacity),0)::INTEGER FROM workshop_sessions s WHERE s.workshop_id=w.id AND s.starts_at>NOW()) AS upcoming_capacity,
    COUNT(*) OVER()::INTEGER AS total_count
    FROM workshops w JOIN workshop_categories c ON c.id=w.category_id
    JOIN workshop_presenters p ON p.id=w.presenter_id
    ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
    ORDER BY w.created_at DESC
    LIMIT $${values.length - 1} OFFSET $${values.length}`, values)).rows;
};
export const getAdminWorkshop = async (id, db = pool) => (await db.query(`SELECT ${WORKSHOP_JOIN_COLUMNS},
  (SELECT COUNT(*)::INTEGER FROM workshop_sessions s WHERE s.workshop_id=w.id AND s.starts_at>NOW()) AS upcoming_session_count,
  (SELECT COUNT(*)::INTEGER FROM workshop_bookings b WHERE b.workshop_id=w.id) AS booking_count,
  (SELECT COALESCE(SUM(s.seat_capacity),0)::INTEGER FROM workshop_sessions s WHERE s.workshop_id=w.id AND s.starts_at>NOW()) AS upcoming_capacity
  FROM workshops w JOIN workshop_categories c ON c.id=w.category_id JOIN workshop_presenters p ON p.id=w.presenter_id WHERE w.id=$1`, [id])).rows[0] || null;
export const listAdminWorkshopSessions = async (workshopId, db = pool) => (await db.query(`SELECT s.id,s.workshop_id,s.starts_at,s.ends_at,s.timezone,s.seat_capacity,s.status,s.price_override,s.meeting_link,s.venue_name,s.address_line1,s.address_line2,s.city,s.state,s.postal_code,s.country,s.location_instructions,s.map_url,s.created_at,s.updated_at,COUNT(b.id) FILTER (WHERE b.booking_status IN ('pending','awaiting_payment','confirmed'))::INTEGER AS reserved_seats,COUNT(b.id) FILTER (WHERE b.booking_status='confirmed')::INTEGER AS confirmed_seats FROM workshop_sessions s LEFT JOIN workshop_bookings b ON b.session_id=s.id WHERE s.workshop_id=$1 GROUP BY s.id ORDER BY s.starts_at`, [workshopId])).rows;

const insertResource = async (table, fields, values, returning, db) => (await db.query(`INSERT INTO ${table} (${fields.join(",")}) VALUES (${values.map((_, i) => `$${i + 1}`).join(",")}) RETURNING ${returning}`, values)).rows[0] || null;
export const createWorkshopCategory = (data, db = pool) => insertResource("workshop_categories", ["name_en","name_ar","description_en","description_ar"], [data.nameEn,data.nameAr,data.descriptionEn||null,data.descriptionAr||null], CATEGORY_COLUMNS, db);
export const createWorkshopPresenter = (data, db = pool) => insertResource("workshop_presenters", ["name_en","name_ar","bio_en","bio_ar","professional_title_en","professional_title_ar","email","phone","image_url"], [data.nameEn,data.nameAr,data.bioEn||null,data.bioAr||null,data.professionalTitleEn||null,data.professionalTitleAr||null,data.email||null,data.phone||null,data.imageUrl||null], PRESENTER_COLUMNS, db);
export const listWorkshopCategories = async (db = pool) => (await db.query("SELECT id,name_en,name_ar,description_en,description_ar,is_active,created_at,updated_at FROM workshop_categories ORDER BY name_en")).rows;
export const listWorkshopPresenters = async (db = pool) => (await db.query("SELECT id,name_en,name_ar,bio_en,bio_ar,professional_title_en,professional_title_ar,email,phone,image_url,is_active,created_at,updated_at FROM workshop_presenters ORDER BY name_en")).rows;
export const listPublicWorkshopCategories = async (lang, db = pool) => {
  const column = lang === "ar" ? "name_ar" : "name_en";
  return (await db.query(`SELECT id,${column} AS name FROM workshop_categories WHERE is_active=TRUE ORDER BY ${column}`)).rows;
};

export const createWorkshopRecord = async (data, db = pool) => insertResource("workshops", ["title_en","title_ar","description_en","description_ar","subject_en","subject_ar","category_id","presenter_id","image_url","duration_minutes","price","currency_code","mode","gender_eligibility","min_age","max_age","registration_instructions_en","registration_instructions_ar","publication_status"], [data.titleEn,data.titleAr,data.descriptionEn,data.descriptionAr,data.subjectEn,data.subjectAr,data.categoryId,data.presenterId,data.imageUrl||null,data.durationMinutes,data.price,data.currencyCode,data.mode,data.genderEligibility,data.minAge??null,data.maxAge??null,data.registrationInstructionsEn||null,data.registrationInstructionsAr||null,data.publicationStatus], WORKSHOP_RETURNING_COLUMNS, db);
export const createWorkshopSessionRecord = async (workshopId, data, db = pool) => insertResource("workshop_sessions", ["workshop_id","starts_at","ends_at","timezone","seat_capacity","status","price_override","meeting_link","venue_name","address_line1","address_line2","city","state","postal_code","country","location_instructions","map_url"], [workshopId,data.startsAt,data.endsAt,data.timezone,data.seatCapacity,data.status,data.priceOverride||null,data.meetingLink||null,data.venueName||null,data.addressLine1||null,data.addressLine2||null,data.city||null,data.state||null,data.postalCode||null,data.country||null,data.locationInstructions||null,data.mapUrl||null], SESSION_COLUMNS, db);

export const updateWorkshopResource = async (table, id, columnMap, data, db = pool) => {
  const returningByTable = {
    workshops: WORKSHOP_RETURNING_COLUMNS,
    workshop_categories: CATEGORY_COLUMNS,
    workshop_presenters: PRESENTER_COLUMNS,
    workshop_sessions: SESSION_COLUMNS,
  };
  const returning = returningByTable[table];
  if (!returning) throw new Error("Unsupported Workshop resource");
  const entries = Object.entries(data).filter(([key]) => columnMap[key]);
  if (!entries.length) return null;
  const values = entries.map(([, value]) => value === "" ? null : value);
  values.push(id);
  const set = entries.map(([key], index) => `${columnMap[key]}=$${index + 1}`).join(",");
  return (await db.query(`UPDATE ${table} SET ${set}, updated_at=NOW() WHERE id=$${values.length} RETURNING ${returning}`, values)).rows[0] || null;
};

export const lockAdminBooking = async (client, bookingId) => (await client.query(`SELECT ${BOOKING_COLUMNS} FROM workshop_bookings b WHERE b.id=$1 FOR UPDATE`, [bookingId])).rows[0] || null;
export const updateBookingStatus = async (client, id, status) => (await client.query(`UPDATE workshop_bookings SET booking_status=$2, confirmed_at=CASE WHEN $2='confirmed' THEN COALESCE(confirmed_at,NOW()) ELSE confirmed_at END, updated_at=NOW() WHERE id=$1 RETURNING ${BOOKING_RETURNING_COLUMNS}`, [id,status])).rows[0] || null;
export const insertWorkshopPayment = async (client, data) => (await client.query(`INSERT INTO workshop_booking_payments (booking_id,amount,currency_code,payment_method,external_reference,paid_at,note,confirmed_by_admin_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id,booking_id,amount,currency_code,payment_method,external_reference,paid_at,note,confirmed_by_admin_id,confirmed_at,record_status`, [data.bookingId,data.amount,data.currencyCode,data.paymentMethod,data.externalReference,data.paidAt,data.note,data.adminId])).rows[0] || null;
export const markBookingPaid = (client, id) => client.query("UPDATE workshop_bookings SET payment_status='paid', updated_at=NOW() WHERE id=$1", [id]);
export const insertWorkshopEmailOutbox = async (client, bookingId) => (await client.query("INSERT INTO workshop_notification_outbox (booking_id,event_type,idempotency_key) VALUES ($1,'booking_confirmed',$2) ON CONFLICT (idempotency_key) DO NOTHING RETURNING id", [bookingId,`workshop-booking-confirmed:${bookingId}`])).rows[0] || null;
export const updateBookingAttendance = async (client, { id, status, adminId }) => (await client.query(`UPDATE workshop_bookings SET attendance_status=$2,attendance_marked_at=NOW(),attendance_marked_by_admin_id=$3,updated_at=NOW() WHERE id=$1 RETURNING ${BOOKING_RETURNING_COLUMNS}`, [id,status,adminId])).rows[0] || null;
export const insertAttendanceHistory = (client, { bookingId, oldStatus, newStatus, adminId, note }) => client.query("INSERT INTO workshop_attendance_history (booking_id,old_status,new_status,changed_by_admin_id,note) VALUES ($1,$2,$3,$4,$5)", [bookingId,oldStatus,newStatus,adminId,note]);

export const listAdminBookings = async ({ page, limit, search, workshopId, sessionId, bookingStatus, paymentStatus, attendanceStatus, dateFrom, dateTo }, db = pool) => {
  const values = [];
  const where = [];
  const add = (column, value, operator = "=") => { values.push(value); where.push(`${column}${operator}$${values.length}`); };
  if (search) { const term = `%${search}%`; values.push(term, term, term); where.push(`(b.reference_number ILIKE $${values.length - 2} OR b.attendee_full_name ILIKE $${values.length - 1} OR b.attendee_email ILIKE $${values.length})`); }
  if (workshopId) add("b.workshop_id", workshopId);
  if (sessionId) add("b.session_id", sessionId);
  if (bookingStatus) add("b.booking_status", bookingStatus);
  if (paymentStatus) add("b.payment_status", paymentStatus);
  if (attendanceStatus) add("b.attendance_status", attendanceStatus);
  if (dateFrom) add("b.created_at", dateFrom, ">=");
  if (dateTo) add("b.created_at", dateTo, "<=");
  values.push(limit, (page - 1) * limit);
  return (await db.query(`SELECT ${BOOKING_COLUMNS},COUNT(*) OVER()::INTEGER AS total_count FROM workshop_bookings b ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY b.created_at DESC LIMIT $${values.length - 1} OFFSET $${values.length}`, values)).rows;
};
export const getAdminBooking = async (id, db = pool) => (await db.query(`SELECT ${BOOKING_COLUMNS},
  COALESCE(json_agg(json_build_object('oldStatus',h.old_status,'newStatus',h.new_status,'changedByUserId',h.changed_by_user_id,'changedByAdminId',h.changed_by_admin_id,'note',h.note,'createdAt',h.created_at) ORDER BY h.created_at) FILTER (WHERE h.id IS NOT NULL),'[]') AS history
  FROM workshop_bookings b LEFT JOIN workshop_booking_status_history h ON h.booking_id=b.id
  WHERE b.id=$1 GROUP BY b.id`, [id])).rows[0] || null;

export const getPendingWorkshopOutbox = async (bookingId, db = pool) => (await db.query(`SELECT o.id,o.booking_id,o.attempt_count,b.attendee_email,b.attendee_full_name,b.workshop_title_en_snapshot,b.workshop_title_ar_snapshot,b.presenter_name_en_snapshot,b.presenter_name_ar_snapshot,b.mode_snapshot,b.session_starts_at_snapshot,b.session_ends_at_snapshot,b.session_timezone_snapshot,b.reference_number,b.registration_instructions_en_snapshot,b.registration_instructions_ar_snapshot,b.meeting_link_snapshot,b.venue_name_snapshot,b.location_address_snapshot,b.location_instructions_snapshot FROM workshop_notification_outbox o JOIN workshop_bookings b ON b.id=o.booking_id WHERE o.booking_id=$1 AND o.status IN ('pending','failed') ORDER BY o.id LIMIT 1`, [bookingId])).rows[0] || null;
export const markWorkshopOutboxSent = (id, db = pool) => db.query("UPDATE workshop_notification_outbox SET status='sent',sent_at=NOW(),last_error=NULL WHERE id=$1", [id]);
export const markWorkshopOutboxFailed = (id, message, db = pool) => db.query("UPDATE workshop_notification_outbox SET status='failed',attempt_count=attempt_count+1,last_error=$2 WHERE id=$1", [id,message.slice(0,500)]);
