import pool from "../config/db.js";
import { PURCHASED_BOOK_REQUEST_SQL } from "../config/analytics.js";

const runAnalyticsQuery = async (db, label, sql, values) => {
  try {
    return await db.query(sql, values);
  } catch (error) {
    error.analyticsQuery = label;
    throw error;
  }
};

export const ingestAnalyticsEvent = async (data, dbPool = pool) => {
  const client = await dbPool.connect();
  try {
    await client.query("BEGIN");
    const visitorResult = await client.query(
      `INSERT INTO analytics_visitors (visitor_key)
       VALUES ($1)
       ON CONFLICT (visitor_key) DO UPDATE
       SET last_seen_at = NOW(), updated_at = NOW()
       RETURNING id`,
      [data.visitorKey],
    );
    const visitorId = visitorResult.rows[0].id;
    const sessionResult = await client.query(
      `INSERT INTO analytics_sessions (
         session_key, visitor_id, user_id, landing_path, referrer_host, locale,
         utm_source, utm_medium, utm_campaign, device_category
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (session_key) DO UPDATE
       SET last_seen_at = NOW(), updated_at = NOW(),
           user_id = COALESCE(EXCLUDED.user_id, analytics_sessions.user_id)
       WHERE analytics_sessions.visitor_id = EXCLUDED.visitor_id
       RETURNING id`,
      [
        data.sessionKey,
        visitorId,
        data.userId,
        data.landingPath,
        data.referrerHost,
        data.locale,
        data.utmSource,
        data.utmMedium,
        data.utmCampaign,
        data.deviceCategory,
      ],
    );
    if (!sessionResult.rows[0]) {
      const error = new Error("Analytics session identity does not match visitor");
      error.code = "ANALYTICS_SESSION_MISMATCH";
      error.status = 409;
      error.publicMessage = "Analytics session could not be accepted";
      throw error;
    }
    const eventResult = await client.query(
      `INSERT INTO analytics_events (
         event_key, visitor_id, session_id, user_id, event_name, event_version,
         page_path, locale, entity_type, entity_id, properties
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb)
       ON CONFLICT (event_key) DO NOTHING
       RETURNING id`,
      [
        data.eventKey,
        visitorId,
        sessionResult.rows[0].id,
        data.userId,
        data.eventName,
        data.eventVersion,
        data.pagePath,
        data.locale,
        data.entityType,
        data.entityId,
        JSON.stringify(data.properties),
      ],
    );
    await client.query("COMMIT");
    return { accepted: true, duplicate: eventResult.rowCount === 0 };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const rangeValues = (range) => [
  range.currentStart,
  range.currentEnd,
  range.previousStart,
  range.previousEnd,
];

export const getOverviewMetrics = async (range, db = pool) => {
  const values = rangeValues(range);
  const [traffic, users, requests, workshops, money] = await Promise.all([
    db.query(
      `SELECT
        COUNT(DISTINCT visitor_id) FILTER (WHERE started_at >= $1 AND started_at < $2)::INTEGER AS visitors_current,
        COUNT(DISTINCT visitor_id) FILTER (WHERE started_at >= $3 AND started_at < $4)::INTEGER AS visitors_previous,
        COUNT(*) FILTER (WHERE started_at >= $1 AND started_at < $2)::INTEGER AS sessions_current,
        COUNT(*) FILTER (WHERE started_at >= $3 AND started_at < $4)::INTEGER AS sessions_previous,
        COUNT(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL AND started_at >= $1 AND started_at < $2)::INTEGER AS known_current,
        COUNT(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL AND started_at >= $3 AND started_at < $4)::INTEGER AS known_previous
       FROM analytics_sessions`,
      values,
    ),
    db.query(
      `SELECT COUNT(*)::INTEGER AS total_accounts,
        COUNT(*) FILTER (WHERE created_at >= $1 AND created_at < $2)::INTEGER AS new_current,
        COUNT(*) FILTER (WHERE created_at >= $3 AND created_at < $4)::INTEGER AS new_previous,
        COUNT(*) FILTER (WHERE user_type='individual')::INTEGER AS individuals,
        COUNT(*) FILTER (WHERE user_type='company')::INTEGER AS companies,
        COUNT(*) FILTER (WHERE is_active=TRUE)::INTEGER AS active_accounts,
        COUNT(*) FILTER (WHERE is_active=FALSE)::INTEGER AS inactive_accounts
       FROM users`,
      values,
    ),
    db.query(
      `SELECT COUNT(*) FILTER (WHERE request.created_at >= $1 AND request.created_at < $2)::INTEGER AS requests_current,
        COUNT(*) FILTER (WHERE request.created_at >= $3 AND request.created_at < $4)::INTEGER AS requests_previous,
        COUNT(DISTINCT request.user_id) FILTER (WHERE request.created_at >= $1 AND request.created_at < $2 AND ${PURCHASED_BOOK_REQUEST_SQL})::INTEGER AS purchasers_current,
        COUNT(DISTINCT request.user_id) FILTER (WHERE request.created_at >= $3 AND request.created_at < $4 AND ${PURCHASED_BOOK_REQUEST_SQL})::INTEGER AS purchasers_previous,
        COALESCE(SUM(items.quantity) FILTER (WHERE request.created_at >= $1 AND request.created_at < $2),0)::BIGINT AS quantity_current
       FROM book_requests request
       LEFT JOIN book_request_payment_summary payment ON payment.request_id=request.id
       LEFT JOIN (SELECT request_id,SUM(requested_quantity)::BIGINT quantity FROM book_request_items GROUP BY request_id) items ON items.request_id=request.id`,
      values,
    ),
    db.query(
      `SELECT COUNT(*) FILTER (WHERE created_at >= $1 AND created_at < $2)::INTEGER AS bookings_current,
        COUNT(*) FILTER (WHERE created_at >= $3 AND created_at < $4)::INTEGER AS bookings_previous,
        COUNT(*) FILTER (WHERE booking_status='confirmed' AND created_at >= $1 AND created_at < $2)::INTEGER AS confirmed_current,
        COUNT(*) FILTER (WHERE payment_status='awaiting_payment' AND created_at >= $1 AND created_at < $2)::INTEGER AS awaiting_payment_current
       FROM workshop_bookings`,
      values,
    ),
    db.query(
      `WITH book_revenue AS (
        SELECT currency_code,
          SUM(CASE payment_kind WHEN 'payment' THEN amount ELSE -amount END) FILTER (WHERE paid_at >= $1 AND paid_at < $2) revenue_current,
          SUM(CASE payment_kind WHEN 'payment' THEN amount ELSE -amount END) FILTER (WHERE paid_at >= $3 AND paid_at < $4) revenue_previous
        FROM request_payments WHERE record_status='recorded' GROUP BY currency_code
       ), book_outstanding AS (
        SELECT summary.currency_code,SUM(GREATEST(summary.remaining_balance,0)) outstanding_current
        FROM book_request_payment_summary summary JOIN book_requests request ON request.id=summary.request_id
        WHERE request.created_at >= $1 AND request.created_at < $2 AND request.request_status NOT IN ('cancelled','rejected')
        GROUP BY summary.currency_code
       ) SELECT 'book_request' AS source,COALESCE(book_revenue.currency_code,book_outstanding.currency_code) currency_code,
        COALESCE(book_revenue.revenue_current,0) revenue_current,COALESCE(book_revenue.revenue_previous,0) revenue_previous,
        COALESCE(book_outstanding.outstanding_current,0) outstanding_current
       FROM book_revenue FULL JOIN book_outstanding USING(currency_code)
       UNION ALL
       SELECT 'workshop', currency_code,
        COALESCE(SUM(amount) FILTER (WHERE paid_at >= $1 AND paid_at < $2 AND record_status='recorded'),0),
        COALESCE(SUM(amount) FILTER (WHERE paid_at >= $3 AND paid_at < $4 AND record_status='recorded'),0),
        0::NUMERIC
       FROM workshop_booking_payments GROUP BY currency_code`,
      values,
    ),
  ]);
  const pageViews = await db.query(
    `SELECT COUNT(*) FILTER (WHERE occurred_at >= $1 AND occurred_at < $2)::INTEGER AS current,
      COUNT(*) FILTER (WHERE occurred_at >= $3 AND occurred_at < $4)::INTEGER AS previous
     FROM analytics_events WHERE event_name='page_view'`,
    values,
  );
  const visitorTypes = await db.query(
    `SELECT
      COUNT(DISTINCT session.visitor_id) FILTER (WHERE visitor.first_seen_at >= $1 AND visitor.first_seen_at < $2)::INTEGER AS new_visitors,
      COUNT(DISTINCT session.visitor_id) FILTER (WHERE visitor.first_seen_at < $1)::INTEGER AS returning_visitors
     FROM analytics_sessions session JOIN analytics_visitors visitor ON visitor.id=session.visitor_id
     WHERE session.started_at >= $1 AND session.started_at < $2`,
    [range.currentStart, range.currentEnd],
  );
  return {
    traffic: traffic.rows[0],
    users: users.rows[0],
    requests: requests.rows[0],
    workshops: workshops.rows[0],
    money: money.rows,
    pageViews: pageViews.rows[0],
    visitorTypes: visitorTypes.rows[0],
  };
};

export const getTrafficMetrics = async (range, db = pool) => {
  const rangeValues = [range.currentStart, range.currentEnd];
  const trendValues = [...rangeValues, range.timezone];
  const query = (label, sql, values) => runAnalyticsQuery(db, `traffic.${label}`, sql, values);
  const [trend, pages, devices, languages, referrers, campaigns] = await Promise.all([
    query(
      "trend",
      `WITH days AS (
        SELECT generate_series(
          date_trunc('day',$1::timestamptz AT TIME ZONE $3),
          date_trunc('day',($2::timestamptz - interval '1 microsecond') AT TIME ZONE $3),
          interval '1 day'
        ) AS day
      ), session_daily AS (
        SELECT date_trunc('day',started_at AT TIME ZONE $3) AS day,
          COUNT(*)::INTEGER sessions,COUNT(DISTINCT visitor_id)::INTEGER visitors
        FROM analytics_sessions WHERE started_at >= $1 AND started_at < $2 GROUP BY 1
      ), event_daily AS (
        SELECT date_trunc('day',occurred_at AT TIME ZONE $3) AS day,COUNT(*)::INTEGER page_views
        FROM analytics_events WHERE event_name='page_view' AND occurred_at >= $1 AND occurred_at < $2 GROUP BY 1
      ) SELECT days.day,COALESCE(session_daily.sessions,0) sessions,
        COALESCE(session_daily.visitors,0) visitors,COALESCE(event_daily.page_views,0) page_views
       FROM days LEFT JOIN session_daily USING(day) LEFT JOIN event_daily USING(day) ORDER BY days.day`,
      trendValues,
    ),
    query(
      "top-pages",
      `SELECT page_path,COUNT(*)::INTEGER page_views,COUNT(DISTINCT visitor_id)::INTEGER visitors
       FROM analytics_events WHERE event_name='page_view' AND occurred_at >= $1 AND occurred_at < $2 AND page_path IS NOT NULL
       GROUP BY page_path ORDER BY page_views DESC,page_path LIMIT 20`,
      rangeValues,
    ),
    query(
      "devices",
      `SELECT COALESCE(device_category,'other') label,COUNT(*)::INTEGER value
       FROM analytics_sessions WHERE started_at >= $1 AND started_at < $2 GROUP BY 1 ORDER BY value DESC`,
      rangeValues,
    ),
    query(
      "languages",
      `SELECT COALESCE(locale,'unknown') label,COUNT(*)::INTEGER value
       FROM analytics_sessions WHERE started_at >= $1 AND started_at < $2 GROUP BY 1 ORDER BY value DESC`,
      rangeValues,
    ),
    query(
      "referrers",
      `SELECT COALESCE(referrer_host,'Direct') label,COUNT(*)::INTEGER value
       FROM analytics_sessions WHERE started_at >= $1 AND started_at < $2 GROUP BY 1 ORDER BY value DESC LIMIT 15`,
      rangeValues,
    ),
    query(
      "campaigns",
      `SELECT COALESCE(utm_source,'Direct') source,COALESCE(utm_medium,'None') medium,
        COALESCE(utm_campaign,'None') campaign,COUNT(*)::INTEGER sessions
       FROM analytics_sessions WHERE started_at >= $1 AND started_at < $2
       GROUP BY 1,2,3 ORDER BY sessions DESC LIMIT 20`,
      rangeValues,
    ),
  ]);
  return { trend: trend.rows, pages: pages.rows, devices: devices.rows, languages: languages.rows, referrers: referrers.rows, campaigns: campaigns.rows };
};

const customerStatsCte = `WITH customer_stats AS (
  SELECT user_account.id,user_account.full_name,user_account.email,user_account.user_type,
    COUNT(request.id)::INTEGER request_count,
    COUNT(request.id) FILTER (WHERE ${PURCHASED_BOOK_REQUEST_SQL})::INTEGER purchase_count,
    COALESCE(SUM(payment.net_paid),0) total_paid,
    COALESCE(SUM(GREATEST(payment.remaining_balance,0)) FILTER (WHERE request.request_status NOT IN ('cancelled','rejected')),0) outstanding,
    MAX(request.created_at) last_request_at,
    MAX(request.created_at) FILTER (WHERE ${PURCHASED_BOOK_REQUEST_SQL}) last_purchase_at
  FROM users user_account
  LEFT JOIN book_requests request ON request.user_id=user_account.id AND request.created_at < $1
  LEFT JOIN book_request_payment_summary payment ON payment.request_id=request.id
  WHERE user_account.role='user'
  GROUP BY user_account.id
)`;

export const getCustomerMetrics = async (range, { page, limit, segment }, db = pool) => {
  const segmentSql = {
    all: "TRUE",
    request_only: "request_count > 0 AND purchase_count = 0",
    one_time: "purchase_count = 1",
    repeat: "purchase_count >= 2",
    loyal: "purchase_count >= 3",
    high_value: "purchase_count > 0",
  }[segment];
  const summaryValues = [range.currentEnd];
  const customerValues = [range.currentEnd, limit, (page - 1) * limit];
  const query = (label, sql, values) => runAnalyticsQuery(db, `customers.${label}`, sql, values);
  const [summary, customers] = await Promise.all([
    query(
      "summary",
      `${customerStatsCte} SELECT
        COUNT(*) FILTER (WHERE request_count > 0 AND purchase_count=0)::INTEGER request_only,
        COUNT(*) FILTER (WHERE purchase_count=1)::INTEGER one_time,
        COUNT(*) FILTER (WHERE purchase_count>=2)::INTEGER repeat,
        COUNT(*) FILTER (WHERE purchase_count>=3)::INTEGER loyal,
        COUNT(*) FILTER (WHERE user_type='individual' AND request_count>0)::INTEGER individuals,
        COUNT(*) FILTER (WHERE user_type='company' AND request_count>0)::INTEGER companies
       FROM customer_stats`,
      summaryValues,
    ),
    query(
      "list",
      `${customerStatsCte} SELECT id,full_name,email,user_type,request_count,purchase_count,total_paid,
        outstanding,last_request_at,last_purchase_at,COUNT(*) OVER()::INTEGER total_count
       FROM customer_stats WHERE ${segmentSql}
       ORDER BY ${segment === "high_value" ? "total_paid DESC," : "purchase_count DESC,"} last_request_at DESC NULLS LAST,id DESC
       LIMIT $2 OFFSET $3`,
      customerValues,
    ),
  ]);
  return { summary: summary.rows[0], customers: customers.rows };
};

export const getBookRequestMetrics = async (range, db = pool) => {
  const values = [range.currentStart, range.currentEnd];
  const [summary, statuses, funnel, books, categories] = await Promise.all([
    db.query(
      `SELECT COUNT(*)::INTEGER requests_created,
        COUNT(DISTINCT request.user_id)::INTEGER submitted_customers,
        COUNT(*) FILTER (WHERE request_status='confirmed')::INTEGER confirmed,
        COUNT(*) FILTER (WHERE request_status='completed')::INTEGER completed,
        COUNT(*) FILTER (WHERE request_status='cancelled')::INTEGER cancelled,
        COUNT(*) FILTER (WHERE request_status='rejected')::INTEGER rejected,
        COALESCE(SUM(item_totals.quantity),0)::BIGINT total_quantity,
        COALESCE(SUM(request.estimated_total),0) estimated_value,
        COALESCE(AVG(request.estimated_total),0) average_request_value,
        COALESCE(AVG(item_totals.quantity),0) average_quantity,
        COUNT(*) FILTER (WHERE ${PURCHASED_BOOK_REQUEST_SQL})::INTEGER purchased_requests,
        COUNT(DISTINCT request.user_id) FILTER (WHERE ${PURCHASED_BOOK_REQUEST_SQL})::INTEGER purchasing_customers
       FROM book_requests request
       LEFT JOIN book_request_payment_summary payment ON payment.request_id=request.id
       LEFT JOIN (SELECT request_id,SUM(requested_quantity) quantity FROM book_request_items GROUP BY request_id) item_totals ON item_totals.request_id=request.id
       WHERE request.created_at >= $1 AND request.created_at < $2`,
      values,
    ),
    db.query(
      `SELECT request_status label,COUNT(*)::INTEGER value FROM book_requests
       WHERE created_at >= $1 AND created_at < $2 GROUP BY request_status ORDER BY value DESC`,
      values,
    ),
    db.query(
      `SELECT
        COUNT(DISTINCT visitor_id) FILTER (WHERE event_name='book_view')::INTEGER book_viewed,
        COUNT(DISTINCT visitor_id) FILTER (WHERE event_name='book_request_started')::INTEGER request_started
       FROM analytics_events WHERE occurred_at >= $1 AND occurred_at < $2 AND event_name IN ('book_view','book_request_started')`,
      values,
    ),
    db.query(
      `SELECT item.book_id,item.book_name_en_snapshot name_en,item.book_name_ar_snapshot name_ar,
        COUNT(DISTINCT item.request_id)::INTEGER request_count,
        SUM(item.requested_quantity)::BIGINT requested_quantity,
        SUM(item.estimated_line_subtotal) estimated_value,
        SUM(item.agreed_line_subtotal) FILTER (WHERE ${PURCHASED_BOOK_REQUEST_SQL}) purchased_line_value
       FROM book_request_items item JOIN book_requests request ON request.id=item.request_id
       LEFT JOIN book_request_payment_summary payment ON payment.request_id=request.id
       WHERE request.created_at >= $1 AND request.created_at < $2
       GROUP BY item.book_id,item.book_name_en_snapshot,item.book_name_ar_snapshot
       ORDER BY requested_quantity DESC LIMIT 15`,
      values,
    ),
    db.query(
      `SELECT category.id,category.name_en,category.name_ar,COUNT(DISTINCT item.request_id)::INTEGER request_count,
        SUM(item.requested_quantity)::BIGINT requested_quantity,SUM(item.estimated_line_subtotal) estimated_value
       FROM book_request_items item JOIN book_requests request ON request.id=item.request_id
       JOIN books book ON book.id=item.book_id JOIN categories category ON category.id=book.category_id
       WHERE request.created_at >= $1 AND request.created_at < $2
       GROUP BY category.id ORDER BY requested_quantity DESC LIMIT 15`,
      values,
    ),
  ]);
  const monetary = await db.query(
    `WITH revenue AS (
      SELECT currency_code,SUM(CASE payment_kind WHEN 'payment' THEN amount ELSE -amount END) revenue
      FROM request_payments WHERE paid_at >= $1 AND paid_at < $2 AND record_status='recorded' GROUP BY currency_code
     ), outstanding AS (
      SELECT payment.currency_code,SUM(GREATEST(payment.remaining_balance,0)) outstanding
      FROM book_request_payment_summary payment JOIN book_requests request ON request.id=payment.request_id
      WHERE request.created_at >= $1 AND request.created_at < $2 AND request.request_status NOT IN ('cancelled','rejected') GROUP BY payment.currency_code
     ) SELECT COALESCE(revenue.currency_code,outstanding.currency_code) currency_code,
      COALESCE(revenue.revenue,0) revenue,COALESCE(outstanding.outstanding,0) outstanding
     FROM revenue FULL JOIN outstanding USING(currency_code)`,
    values,
  );
  return { summary: summary.rows[0], statuses: statuses.rows, funnel: funnel.rows[0], books: books.rows, categories: categories.rows, monetary: monetary.rows };
};

export const getWorkshopMetrics = async (range, db = pool) => {
  const values = [range.currentStart, range.currentEnd];
  const [summary, occupancy, attendance, workshops, sessions, categories, presenters, modes, attendees, demographics, monetary] = await Promise.all([
    db.query(
      `SELECT
        (SELECT COUNT(*)::INTEGER FROM workshops WHERE publication_status='published') published_workshops,
        (SELECT COUNT(*)::INTEGER FROM workshop_sessions WHERE status='open' AND starts_at > NOW()) available_sessions,
        (SELECT COUNT(DISTINCT booking.user_id)::INTEGER FROM workshop_booking_payments payment JOIN workshop_bookings booking ON booking.id=payment.booking_id WHERE payment.confirmed_at >= $1 AND payment.confirmed_at < $2 AND payment.record_status='recorded') payment_confirmed_customers,
        COUNT(*)::INTEGER bookings_created,
        COUNT(DISTINCT user_id)::INTEGER submitted_customers,
        COUNT(*) FILTER (WHERE booking_status='confirmed')::INTEGER confirmed,
        COUNT(*) FILTER (WHERE booking_status='awaiting_payment')::INTEGER awaiting_payment,
        COUNT(*) FILTER (WHERE booking_status='cancelled')::INTEGER cancelled,
        COUNT(*) FILTER (WHERE booking_status='rejected')::INTEGER rejected
       FROM workshop_bookings WHERE created_at >= $1 AND created_at < $2`,
      values,
    ),
    db.query(
      `WITH session_occupancy AS (
        SELECT session.id,session.seat_capacity,
          COUNT(booking.id) FILTER (WHERE booking.booking_status IN ('pending','awaiting_payment','confirmed'))::INTEGER reserved,
          COUNT(booking.id) FILTER (WHERE booking.booking_status IN ('confirmed','completed'))::INTEGER confirmed
        FROM workshop_sessions session LEFT JOIN workshop_bookings booking ON booking.session_id=session.id
        WHERE session.starts_at >= $1 AND session.starts_at < $2 AND session.status <> 'cancelled'
        GROUP BY session.id
       ) SELECT COALESCE(SUM(seat_capacity),0)::INTEGER capacity,
        COALESCE(SUM(reserved),0)::INTEGER reserved,COALESCE(SUM(confirmed),0)::INTEGER confirmed
       FROM session_occupancy`,
      values,
    ),
    db.query(
      `SELECT COUNT(*) FILTER (WHERE attendance_status='attended')::INTEGER attended,
        COUNT(DISTINCT user_id) FILTER (WHERE attendance_status='attended')::INTEGER attended_customers,
        COUNT(*) FILTER (WHERE attendance_status='no_show')::INTEGER no_show,
        COUNT(*) FILTER (WHERE attendance_status='not_marked')::INTEGER not_marked
       FROM workshop_bookings
       WHERE session_ends_at_snapshot < $2 AND session_ends_at_snapshot >= $1
         AND booking_status NOT IN ('cancelled','rejected')`,
      values,
    ),
    db.query(
      `SELECT workshop_id,workshop_title_en_snapshot name_en,workshop_title_ar_snapshot name_ar,
        COUNT(*)::INTEGER bookings,COUNT(*) FILTER (WHERE booking_status IN ('confirmed','completed'))::INTEGER confirmed
       FROM workshop_bookings WHERE created_at >= $1 AND created_at < $2
       GROUP BY workshop_id,workshop_title_en_snapshot,workshop_title_ar_snapshot ORDER BY bookings DESC LIMIT 15`,
      values,
    ),
    db.query(
      `SELECT session_id,workshop_id,workshop_title_en_snapshot name_en,workshop_title_ar_snapshot name_ar,
        MIN(session_starts_at_snapshot) starts_at,COUNT(*)::INTEGER bookings,
        COUNT(*) FILTER (WHERE booking_status IN ('confirmed','completed'))::INTEGER confirmed
       FROM workshop_bookings WHERE created_at >= $1 AND created_at < $2
       GROUP BY session_id,workshop_id,workshop_title_en_snapshot,workshop_title_ar_snapshot ORDER BY bookings DESC LIMIT 15`,
      values,
    ),
    db.query(
      `SELECT category_name_en_snapshot name_en,category_name_ar_snapshot name_ar,COUNT(*)::INTEGER bookings,
        COUNT(*) FILTER (WHERE booking_status IN ('confirmed','completed'))::INTEGER confirmed
       FROM workshop_bookings WHERE created_at >= $1 AND created_at < $2 GROUP BY 1,2 ORDER BY bookings DESC LIMIT 15`,
      values,
    ),
    db.query(
      `SELECT presenter_name_en_snapshot name_en,presenter_name_ar_snapshot name_ar,COUNT(*)::INTEGER bookings,
        COUNT(*) FILTER (WHERE booking_status IN ('confirmed','completed'))::INTEGER confirmed,
        COUNT(*) FILTER (WHERE attendance_status='attended')::INTEGER attended
       FROM workshop_bookings WHERE created_at >= $1 AND created_at < $2 GROUP BY 1,2 ORDER BY confirmed DESC,bookings DESC LIMIT 15`,
      values,
    ),
    db.query(
      `SELECT mode_snapshot label,COUNT(*)::INTEGER bookings,
        COUNT(*) FILTER (WHERE booking_status IN ('confirmed','completed'))::INTEGER confirmed
       FROM workshop_bookings WHERE created_at >= $1 AND created_at < $2 GROUP BY mode_snapshot ORDER BY bookings DESC`,
      values,
    ),
    db.query(
      `WITH attendee_counts AS (SELECT user_id,COUNT(*) FILTER (WHERE booking_status IN ('confirmed','completed')) confirmed
       FROM workshop_bookings WHERE created_at < $1 GROUP BY user_id)
       SELECT COUNT(*) FILTER (WHERE confirmed=1)::INTEGER first_time,
        COUNT(*) FILTER (WHERE confirmed>=2)::INTEGER repeat FROM attendee_counts`,
      [range.currentEnd],
    ),
    db.query(
      `SELECT attendee_gender gender,
        CASE WHEN attendee_age < 18 THEN 'under_18' WHEN attendee_age < 25 THEN '18_24'
          WHEN attendee_age < 35 THEN '25_34' WHEN attendee_age < 45 THEN '35_44' ELSE '45_plus' END age_band,
        COUNT(*)::INTEGER value
       FROM workshop_bookings WHERE created_at >= $1 AND created_at < $2
         AND booking_status NOT IN ('cancelled','rejected') GROUP BY attendee_gender,age_band ORDER BY age_band,attendee_gender`,
      values,
    ),
    db.query(
      `SELECT currency_code,COALESCE(SUM(amount),0) revenue FROM workshop_booking_payments
       WHERE paid_at >= $1 AND paid_at < $2 AND record_status='recorded' GROUP BY currency_code`,
      values,
    ),
  ]);
  const funnel = await db.query(
    `SELECT COUNT(DISTINCT visitor_id) FILTER (WHERE event_name='workshop_view')::INTEGER viewed,
      COUNT(DISTINCT visitor_id) FILTER (WHERE event_name='workshop_booking_started')::INTEGER started
     FROM analytics_events WHERE occurred_at >= $1 AND occurred_at < $2
       AND event_name IN ('workshop_view','workshop_booking_started')`,
    values,
  );
  return { summary: summary.rows[0], occupancy: occupancy.rows[0], attendance: attendance.rows[0], workshops: workshops.rows, sessions: sessions.rows, categories: categories.rows, presenters: presenters.rows, modes: modes.rows, attendees: attendees.rows[0], demographics: demographics.rows, monetary: monetary.rows, funnel: funnel.rows[0] };
};
