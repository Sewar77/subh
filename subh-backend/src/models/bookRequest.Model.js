import pool from "../config/db.js";
import { getBookRequestPaymentSummary } from "./requestPayment.Model.js";

const REQUEST_SUMMARY_COLUMNS = `
  r.id,
  r.reference_number,
  r.request_status,
  r.contact_status,
  r.payment_status,
  r.fulfillment_status,
  r.quote_status,
  r.estimated_total,
  r.currency_code,
  COUNT(i.id)::int AS item_count,
  COALESCE(SUM(i.requested_quantity), 0)::int AS total_quantity,
  r.created_at
`;

const REQUEST_DETAIL_COLUMNS = `
  r.id,
  r.reference_number,
  r.customer_full_name,
  r.customer_email,
  r.customer_phone,
  r.customer_user_type,
  r.customer_company_name,
  r.request_status,
  r.contact_status,
  r.payment_status,
  r.fulfillment_status,
  r.quote_status,
  r.estimated_subtotal,
  r.estimated_shipping_cost,
  r.estimated_total,
  r.agreed_subtotal,
  r.shipping_cost,
  r.discount_amount,
  r.tax_amount,
  r.final_total,
  r.currency_code,
  r.quoted_at,
  r.quote_valid_until,
  r.shipping_recipient,
  r.shipping_company,
  r.shipping_phone,
  r.shipping_address_line1,
  r.shipping_address_line2,
  r.shipping_city,
  r.shipping_state,
  r.shipping_postal_code,
  r.shipping_country,
  r.shipping_notes,
  r.shipping_carrier,
  r.tracking_number,
  r.shipped_at,
  r.delivered_at,
  r.customer_note,
  r.customer_visible_note,
  r.created_at,
  r.updated_at
`;

const REQUEST_ITEM_COLUMNS = `
  id,
  request_id,
  book_id,
  book_name_en_snapshot,
  book_name_ar_snapshot,
  isbn_snapshot,
  requested_quantity,
  unit_price_snapshot,
  unit_shipping_cost_snapshot,
  estimated_line_subtotal,
  estimated_line_shipping,
  agreed_quantity,
  agreed_unit_price,
  agreed_line_subtotal,
  created_at,
  updated_at
`;

export const loadBookSnapshotsForRequest = async (client, items) => {
  const bookIds = items.map(({ bookId }) => bookId);
  const quantities = items.map(({ quantity }) => quantity);
  const result = await client.query(
    `
      WITH requested AS (
        SELECT book_id, requested_quantity, ordinal
        FROM UNNEST($1::integer[], $2::integer[])
          WITH ORDINALITY AS input(book_id, requested_quantity, ordinal)
      )
      SELECT
        b.id AS book_id,
        b.name_en AS book_name_en_snapshot,
        b.name_ar AS book_name_ar_snapshot,
        b.isbn AS isbn_snapshot,
        requested.requested_quantity,
        b.price::numeric(12,2)::text AS unit_price_snapshot,
        COALESCE(b.shipping_cost, 0)::numeric(12,2)::text
          AS unit_shipping_cost_snapshot,
        (requested.requested_quantity * b.price)::numeric(14,2)::text
          AS estimated_line_subtotal,
        (
          requested.requested_quantity * COALESCE(b.shipping_cost, 0)
        )::numeric(14,2)::text AS estimated_line_shipping
      FROM requested
      JOIN books b ON b.id = requested.book_id
      ORDER BY requested.ordinal
      FOR SHARE OF b
    `,
    [bookIds, quantities],
  );

  return result.rows;
};

export const createBookRequest = async (client, payload) => {
  const result = await client.query(
    `
      INSERT INTO book_requests (
        user_id,
        customer_full_name,
        customer_email,
        customer_phone,
        customer_user_type,
        customer_company_name,
        estimated_subtotal,
        estimated_shipping_cost,
        estimated_total,
        shipping_recipient,
        shipping_company,
        shipping_phone,
        shipping_address_line1,
        shipping_address_line2,
        shipping_city,
        shipping_state,
        shipping_postal_code,
        shipping_country,
        shipping_notes,
        customer_note
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
      )
      RETURNING ${REQUEST_DETAIL_COLUMNS.replaceAll("r.", "")}
    `,
    [
      payload.userId,
      payload.customerFullName,
      payload.customerEmail,
      payload.customerPhone,
      payload.customerUserType,
      payload.customerCompanyName,
      payload.estimatedSubtotal,
      payload.estimatedShippingCost,
      payload.estimatedTotal,
      payload.shipping.recipient,
      payload.shipping.company,
      payload.shipping.phone,
      payload.shipping.addressLine1,
      payload.shipping.addressLine2,
      payload.shipping.city,
      payload.shipping.state,
      payload.shipping.postalCode,
      payload.shipping.country,
      payload.shipping.notes,
      payload.customerNote,
    ],
  );

  return result.rows[0] || null;
};

export const createBookRequestItems = async (client, requestId, snapshots) => {
  const result = await client.query(
    `
      INSERT INTO book_request_items (
        request_id,
        book_id,
        book_name_en_snapshot,
        book_name_ar_snapshot,
        isbn_snapshot,
        requested_quantity,
        unit_price_snapshot,
        unit_shipping_cost_snapshot,
        estimated_line_subtotal,
        estimated_line_shipping
      )
      SELECT
        $1,
        item.book_id,
        item.book_name_en_snapshot,
        item.book_name_ar_snapshot,
        item.isbn_snapshot,
        item.requested_quantity,
        item.unit_price_snapshot,
        item.unit_shipping_cost_snapshot,
        item.estimated_line_subtotal,
        item.estimated_line_shipping
      FROM jsonb_to_recordset($2::jsonb) AS item(
        book_id integer,
        book_name_en_snapshot text,
        book_name_ar_snapshot text,
        isbn_snapshot text,
        requested_quantity integer,
        unit_price_snapshot numeric(12,2),
        unit_shipping_cost_snapshot numeric(12,2),
        estimated_line_subtotal numeric(14,2),
        estimated_line_shipping numeric(14,2)
      )
      RETURNING ${REQUEST_ITEM_COLUMNS}
    `,
    [requestId, JSON.stringify(snapshots)],
  );

  return result.rows;
};

export const listOwnBookRequests = async (
  userId,
  { page, limit },
  client = pool,
) => {
  const offset = (page - 1) * limit;
  const countResult = await client.query(
    "SELECT COUNT(*)::int AS total FROM book_requests WHERE user_id = $1",
    [userId],
  );
  const total = countResult.rows[0]?.total ?? 0;
  const result = await client.query(
    `
      SELECT ${REQUEST_SUMMARY_COLUMNS}
      FROM book_requests r
      LEFT JOIN book_request_items i ON i.request_id = r.id
      WHERE r.user_id = $1
      GROUP BY r.id
      ORDER BY r.created_at DESC, r.id DESC
      LIMIT $2 OFFSET $3
    `,
    [userId, limit, offset],
  );

  return {
    requests: result.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    },
  };
};

export const getOwnBookRequestById = async (
  userId,
  requestId,
  client = pool,
) => {
  const requestResult = await client.query(
    `
      SELECT ${REQUEST_DETAIL_COLUMNS}
      FROM book_requests r
      WHERE r.id = $1 AND r.user_id = $2
    `,
    [requestId, userId],
  );
  const request = requestResult.rows[0] || null;
  if (!request) return null;

  const [itemsResult, paymentSummary] = await Promise.all([
    client.query(
      `
        SELECT ${REQUEST_ITEM_COLUMNS}
        FROM book_request_items
        WHERE request_id = $1
        ORDER BY id ASC
      `,
      [requestId],
    ),
    getBookRequestPaymentSummary(requestId, client),
  ]);

  return { request, items: itemsResult.rows, paymentSummary };
};
