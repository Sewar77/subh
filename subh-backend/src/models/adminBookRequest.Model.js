import pool from "../config/db.js";
import { BOOK_REQUEST_STATUS_COLUMNS } from "../config/bookRequest.js";
import {
  getBookRequestPaymentSummary,
  listBookRequestPayments,
} from "./requestPayment.Model.js";

const ADMIN_REQUEST_DETAIL_COLUMNS = `
  r.id,
  r.reference_number,
  r.user_id,
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
  r.purchase_order_number,
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
  r.admin_internal_note,
  r.last_contacted_at,
  r.next_follow_up_at,
  r.created_at,
  r.updated_at,
  assigned.id AS assigned_admin_id,
  assigned.full_name AS assigned_admin_name,
  assigned.email AS assigned_admin_email
`;

const ADMIN_ITEM_COLUMNS = `
  i.id,
  i.request_id,
  i.book_id,
  i.book_name_en_snapshot,
  i.book_name_ar_snapshot,
  i.isbn_snapshot,
  i.requested_quantity,
  i.unit_price_snapshot,
  i.unit_shipping_cost_snapshot,
  i.estimated_line_subtotal,
  i.estimated_line_shipping,
  i.agreed_quantity,
  i.agreed_unit_price,
  i.agreed_line_subtotal,
  i.created_at,
  i.updated_at
`;

const buildAdminFilters = (filters = {}) => {
  const clauses = [];
  const values = [];
  const addValue = (value) => {
    values.push(value);
    return `$${values.length}`;
  };
  const equalityFilters = {
    requestStatus: "r.request_status",
    contactStatus: "r.contact_status",
    paymentStatus: "r.payment_status",
    fulfillmentStatus: "r.fulfillment_status",
    quoteStatus: "r.quote_status",
    customerType: "r.customer_user_type",
  };

  for (const [field, column] of Object.entries(equalityFilters)) {
    if (filters[field] !== undefined) {
      clauses.push(`${column} = ${addValue(filters[field])}`);
    }
  }
  if (filters.assignedAdminId === null) {
    clauses.push("r.assigned_admin_id IS NULL");
  } else if (filters.assignedAdminId !== undefined) {
    clauses.push(`r.assigned_admin_id = ${addValue(filters.assignedAdminId)}`);
  }
  if (filters.followUpDue === true) {
    clauses.push("r.next_follow_up_at IS NOT NULL AND r.next_follow_up_at <= NOW()");
  } else if (filters.followUpDue === false) {
    clauses.push("(r.next_follow_up_at IS NULL OR r.next_follow_up_at > NOW())");
  }
  if (filters.createdFrom) {
    clauses.push(`r.created_at >= ${addValue(filters.createdFrom)}`);
  }
  if (filters.createdTo) {
    clauses.push(`r.created_at <= ${addValue(filters.createdTo)}`);
  }
  if (filters.search) {
    const placeholder = addValue(`%${filters.search}%`);
    clauses.push(`(
      r.reference_number ILIKE ${placeholder}
      OR r.customer_full_name ILIKE ${placeholder}
      OR r.customer_email ILIKE ${placeholder}
      OR r.customer_phone ILIKE ${placeholder}
      OR COALESCE(r.customer_company_name, '') ILIKE ${placeholder}
    )`);
  }

  return {
    where: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "",
    values,
  };
};

export const listAdminBookRequests = async (filters, client = pool) => {
  const { page, limit } = filters;
  const offset = (page - 1) * limit;
  const { where, values } = buildAdminFilters(filters);
  const countResult = await client.query(
    `SELECT COUNT(*)::int AS total FROM book_requests r ${where}`,
    values,
  );
  const total = countResult.rows[0]?.total ?? 0;
  const result = await client.query(
    `
      SELECT
        r.id,
        r.reference_number,
        r.customer_full_name,
        r.customer_user_type,
        r.customer_company_name,
        r.request_status,
        r.contact_status,
        r.payment_status,
        r.fulfillment_status,
        r.quote_status,
        r.estimated_total,
        r.final_total,
        r.currency_code,
        COUNT(i.id)::int AS item_count,
        COALESCE(SUM(i.requested_quantity), 0)::int AS total_quantity,
        r.next_follow_up_at,
        r.created_at,
        assigned.id AS assigned_admin_id,
        assigned.full_name AS assigned_admin_name,
        assigned.email AS assigned_admin_email
      FROM book_requests r
      LEFT JOIN book_request_items i ON i.request_id = r.id
      LEFT JOIN users assigned ON assigned.id = r.assigned_admin_id
      ${where}
      GROUP BY r.id, assigned.id
      ORDER BY r.created_at DESC, r.id DESC
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `,
    [...values, limit, offset],
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

export const getAdminBookRequestById = async (requestId, client = pool) => {
  const requestResult = await client.query(
    `
      SELECT ${ADMIN_REQUEST_DETAIL_COLUMNS}
      FROM book_requests r
      LEFT JOIN users assigned ON assigned.id = r.assigned_admin_id
      WHERE r.id = $1
    `,
    [requestId],
  );
  const request = requestResult.rows[0] || null;
  if (!request) return null;

  const [itemsResult, contactsResult, statusesResult, paymentSummary, payments] =
    await Promise.all([
    client.query(
      `SELECT ${ADMIN_ITEM_COLUMNS} FROM book_request_items i
       WHERE i.request_id = $1 ORDER BY i.id ASC`,
      [requestId],
    ),
    client.query(
      `
        SELECT
          h.id,
          h.contact_method,
          h.outcome,
          h.note,
          h.contacted_at,
          h.next_follow_up_at,
          h.created_at,
          admin.id AS admin_id,
          admin.full_name AS admin_name,
          admin.email AS admin_email
        FROM request_contact_history h
        JOIN users admin ON admin.id = h.admin_id
        WHERE h.request_id = $1
        ORDER BY h.contacted_at DESC, h.id DESC
      `,
      [requestId],
    ),
    client.query(
      `
        SELECT
          h.id,
          h.status_type,
          h.old_status,
          h.new_status,
          h.note,
          h.created_at,
          actor.id AS changed_by_id,
          actor.full_name AS changed_by_name,
          actor.email AS changed_by_email
        FROM request_status_history h
        JOIN users actor ON actor.id = h.changed_by_user_id
        WHERE h.request_id = $1
        ORDER BY h.created_at DESC, h.id DESC
      `,
      [requestId],
    ),
    getBookRequestPaymentSummary(requestId, client),
    listBookRequestPayments(requestId, client),
  ]);

  return {
    request,
    items: itemsResult.rows,
    contactHistory: contactsResult.rows,
    statusHistory: statusesResult.rows,
    paymentSummary,
    payments,
  };
};

export const getAdminBookRequestForUpdate = async (client, requestId) => {
  const result = await client.query(
    `
      SELECT
        id,
        assigned_admin_id,
        request_status,
        contact_status,
        fulfillment_status,
        quote_status,
        payment_status,
        final_total,
        currency_code
      FROM book_requests
      WHERE id = $1
      FOR UPDATE
    `,
    [requestId],
  );
  return result.rows[0] || null;
};

export const getActiveAdminForAssignment = async (client, adminId) => {
  const result = await client.query(
    `
      SELECT id, full_name, email
      FROM users
      WHERE id = $1 AND role = 'admin' AND is_active = TRUE
    `,
    [adminId],
  );
  return result.rows[0] || null;
};

export const updateRequestAssignment = async (client, requestId, adminId) => {
  const result = await client.query(
    `
      UPDATE book_requests
      SET assigned_admin_id = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, assigned_admin_id, updated_at
    `,
    [requestId, adminId],
  );
  return result.rows[0] || null;
};

export const updateRequestWorkflowStatus = async (
  client,
  requestId,
  statusType,
  status,
) => {
  const column = BOOK_REQUEST_STATUS_COLUMNS[statusType];
  if (!column) throw new Error("Unsupported status type");
  const result = await client.query(
    `
      UPDATE book_requests
      SET ${column} = $2,
          quoted_at = CASE
            WHEN $3 = 'quote' AND $2 = 'sent' THEN COALESCE(quoted_at, NOW())
            ELSE quoted_at
          END,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, request_status, contact_status, fulfillment_status,
        quote_status, quoted_at, updated_at
    `,
    [requestId, status, statusType],
  );
  return result.rows[0] || null;
};

export const insertRequestStatusHistory = async (
  client,
  { requestId, statusType, oldStatus, newStatus, adminId, note },
) => {
  const result = await client.query(
    `
      INSERT INTO request_status_history (
        request_id, status_type, old_status, new_status,
        changed_by_user_id, note
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, request_id, status_type, old_status, new_status,
        changed_by_user_id, note, created_at
    `,
    [requestId, statusType, oldStatus, newStatus, adminId, note],
  );
  return result.rows[0] || null;
};

export const getRequestItemsForUpdate = async (client, requestId) => {
  const result = await client.query(
    `
      SELECT id, request_id, requested_quantity, agreed_quantity,
        agreed_unit_price, agreed_line_subtotal
      FROM book_request_items
      WHERE request_id = $1
      ORDER BY id ASC
      FOR UPDATE
    `,
    [requestId],
  );
  return result.rows;
};

export const updateNegotiatedRequestItems = async (
  client,
  requestId,
  items,
) => {
  const result = await client.query(
    `
      UPDATE book_request_items target
      SET agreed_quantity = quote.agreed_quantity,
          agreed_unit_price = quote.agreed_unit_price,
          agreed_line_subtotal = (
            quote.agreed_quantity * quote.agreed_unit_price
          )::numeric(14,2),
          updated_at = CURRENT_TIMESTAMP
      FROM jsonb_to_recordset($2::jsonb) AS quote(
        item_id integer,
        agreed_quantity integer,
        agreed_unit_price numeric(12,2)
      )
      WHERE target.request_id = $1 AND target.id = quote.item_id
      RETURNING target.id, target.agreed_quantity, target.agreed_unit_price,
        target.agreed_line_subtotal, target.updated_at
    `,
    [requestId, JSON.stringify(items)],
  );
  return result.rows;
};

export const updateRequestQuote = async (client, requestId, quote) => {
  const result = await client.query(
    `
      UPDATE book_requests
      SET agreed_subtotal = $2,
          shipping_cost = $3,
          discount_amount = $4,
          tax_amount = $5,
          final_total = ($2::numeric + $3::numeric + $5::numeric - $4::numeric),
          quote_valid_until = $6,
          customer_visible_note = CASE WHEN $7 THEN $8 ELSE customer_visible_note END,
          quoted_at = NOW(),
          quote_status = 'draft',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, agreed_subtotal, shipping_cost, discount_amount,
        tax_amount, final_total, quote_valid_until, customer_visible_note,
        quoted_at, quote_status, updated_at
    `,
    [
      requestId,
      quote.agreedSubtotal,
      quote.shippingCost,
      quote.discountAmount,
      quote.taxAmount,
      quote.quoteValidUntil,
      quote.customerVisibleNote !== undefined,
      quote.customerVisibleNote ?? null,
    ],
  );
  return result.rows[0] || null;
};

export const updateRequestNotes = async (requestId, notes, client = pool) => {
  const assignments = [];
  const values = [requestId];
  if (notes.customerVisibleNote !== undefined) {
    values.push(notes.customerVisibleNote);
    assignments.push(`customer_visible_note = $${values.length}`);
  }
  if (notes.adminInternalNote !== undefined) {
    values.push(notes.adminInternalNote);
    assignments.push(`admin_internal_note = $${values.length}`);
  }
  const result = await client.query(
    `
      UPDATE book_requests
      SET ${assignments.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, customer_visible_note, admin_internal_note, updated_at
    `,
    values,
  );
  return result.rows[0] || null;
};

export const insertRequestContactHistory = async (
  client,
  requestId,
  adminId,
  contact,
) => {
  const result = await client.query(
    `
      INSERT INTO request_contact_history (
        request_id, admin_id, contact_method, outcome,
        note, contacted_at, next_follow_up_at
      )
      VALUES ($1, $2, $3, $4, $5, COALESCE($6, NOW()), $7)
      RETURNING id, request_id, admin_id, contact_method, outcome,
        note, contacted_at, next_follow_up_at, created_at
    `,
    [
      requestId,
      adminId,
      contact.contactMethod,
      contact.outcome,
      contact.note,
      contact.contactedAt,
      contact.nextFollowUpAt,
    ],
  );
  return result.rows[0] || null;
};

export const updateRequestContactSnapshot = async (
  client,
  requestId,
  { contactedAt, nextFollowUpAt, contactStatus },
) => {
  const result = await client.query(
    `
      UPDATE book_requests
      SET last_contacted_at = $2,
          next_follow_up_at = $3,
          contact_status = $4,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, last_contacted_at, next_follow_up_at,
        contact_status, updated_at
    `,
    [requestId, contactedAt, nextFollowUpAt, contactStatus],
  );
  return result.rows[0] || null;
};
