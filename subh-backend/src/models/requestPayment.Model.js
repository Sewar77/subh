import pool from "../config/db.js";

const PAYMENT_COLUMNS = `
  p.id,
  p.request_id,
  p.payment_kind,
  p.amount,
  p.currency_code,
  p.payment_method,
  p.paid_at,
  p.external_reference,
  p.purchase_order_number,
  p.note,
  p.record_status,
  p.created_at,
  recorded.id AS recorded_by_id,
  recorded.full_name AS recorded_by_name,
  recorded.email AS recorded_by_email,
  p.voided_at,
  voided.id AS voided_by_id,
  voided.full_name AS voided_by_name,
  voided.email AS voided_by_email,
  p.void_reason
`;

export const getPaymentRequestForUpdate = async (client, requestId) => {
  const result = await client.query(
    `
      SELECT id, request_status, quote_status, payment_status,
        final_total, currency_code
      FROM book_requests
      WHERE id = $1
      FOR UPDATE
    `,
    [requestId],
  );
  return result.rows[0] || null;
};

export const getBookRequestPaymentSummary = async (
  requestId,
  client = pool,
) => {
  const result = await client.query(
    `
      SELECT summary.request_id, summary.final_total, summary.currency_code,
        summary.total_payments, summary.total_refunds, summary.net_paid,
        summary.remaining_balance, request.payment_status
      FROM book_request_payment_summary summary
      JOIN book_requests request ON request.id = summary.request_id
      WHERE summary.request_id = $1
    `,
    [requestId],
  );
  return result.rows[0] || null;
};

export const listBookRequestPayments = async (requestId, client = pool) => {
  const result = await client.query(
    `
      SELECT ${PAYMENT_COLUMNS}
      FROM request_payments p
      JOIN users recorded ON recorded.id = p.recorded_by_admin_id
      LEFT JOIN users voided ON voided.id = p.voided_by_admin_id
      WHERE p.request_id = $1
      ORDER BY p.paid_at DESC, p.id DESC
    `,
    [requestId],
  );
  return result.rows;
};

export const insertBookRequestPayment = async (
  client,
  { requestId, kind, amount, currency, method, paidAt, externalReference,
    purchaseOrderNumber, note, adminId },
) => {
  const result = await client.query(
    `
      INSERT INTO request_payments (
        request_id, payment_kind, amount, currency_code, payment_method,
        paid_at, external_reference, purchase_order_number, note,
        recorded_by_admin_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, request_id, payment_kind, amount, currency_code,
        payment_method, paid_at, external_reference, purchase_order_number,
        note, record_status, recorded_by_admin_id, created_at
    `,
    [
      requestId,
      kind,
      amount,
      currency,
      method,
      paidAt,
      externalReference,
      purchaseOrderNumber,
      note,
      adminId,
    ],
  );
  return result.rows[0] || null;
};

export const getPaymentRecordForUpdate = async (
  client,
  requestId,
  paymentId,
) => {
  const result = await client.query(
    `
      SELECT id, request_id, payment_kind, amount, record_status
      FROM request_payments
      WHERE id = $1 AND request_id = $2
      FOR UPDATE
    `,
    [paymentId, requestId],
  );
  return result.rows[0] || null;
};

export const voidBookRequestPayment = async (
  client,
  { requestId, paymentId, adminId, reason },
) => {
  const result = await client.query(
    `
      UPDATE request_payments
      SET record_status = 'voided',
          voided_at = NOW(),
          voided_by_admin_id = $3,
          void_reason = $4
      WHERE id = $1 AND request_id = $2 AND record_status = 'recorded'
      RETURNING id, request_id, payment_kind, amount, record_status,
        voided_at, voided_by_admin_id, void_reason
    `,
    [paymentId, requestId, adminId, reason],
  );
  return result.rows[0] || null;
};

export const updateBookRequestPaymentStatus = async (
  client,
  requestId,
  paymentStatus,
) => {
  const result = await client.query(
    `
      UPDATE book_requests
      SET payment_status = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, payment_status, updated_at
    `,
    [requestId, paymentStatus],
  );
  return result.rows[0] || null;
};
