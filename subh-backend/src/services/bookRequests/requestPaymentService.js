import pool from "../../config/db.js";
import {
  PAYMENT_BLOCKED_REQUEST_STATUSES,
  PAYMENT_REQUIRED_REQUEST_STATUSES,
} from "../../config/requestPayment.js";
import { insertRequestStatusHistory } from "../../models/adminBookRequest.Model.js";
import {
  getBookRequestPaymentSummary,
  getPaymentRecordForUpdate,
  getPaymentRequestForUpdate,
  insertBookRequestPayment,
  updateBookRequestPaymentStatus,
  voidBookRequestPayment,
} from "../../models/requestPayment.Model.js";
import { moneyToMinorUnits } from "../../utils/money.js";

const nullableText = (value) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
};

const paymentError = (code, message) => {
  const error = new Error(message);
  error.code = code;
  return error;
};

const requireRequest = (request) => {
  if (!request) {
    throw paymentError("BOOK_REQUEST_NOT_FOUND", "Book request not found");
  }
  return request;
};

const withTransaction = async (work, dbPool = pool) => {
  const client = await dbPool.connect();
  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const paymentIsRequired = (request) =>
  request.quote_status === "accepted" ||
  PAYMENT_REQUIRED_REQUEST_STATUSES.includes(request.request_status) ||
  !["not_required_yet", "cancelled"].includes(request.payment_status);

export const deriveBookRequestPaymentStatus = (request, summary) => {
  const finalTotal = summary?.final_total ?? request.final_total;
  if (finalTotal === null || finalTotal === undefined) {
    return "not_required_yet";
  }
  const finalMinor = moneyToMinorUnits(finalTotal);
  if (finalMinor <= 0n) return "not_required_yet";

  const paymentsMinor = moneyToMinorUnits(summary?.total_payments ?? "0.00");
  const refundsMinor = moneyToMinorUnits(summary?.total_refunds ?? "0.00");
  const netMinor = paymentsMinor - refundsMinor;
  if (netMinor < 0n || netMinor > finalMinor) {
    throw paymentError(
      "INVALID_PAYMENT_BALANCE",
      "Payment ledger balance is outside the supported request total",
    );
  }
  if (paymentsMinor > 0n && refundsMinor > 0n && netMinor === 0n) {
    return "refunded";
  }
  if (netMinor === finalMinor) return "paid";
  if (netMinor > 0n) return "partially_paid";
  if (PAYMENT_BLOCKED_REQUEST_STATUSES.includes(request.request_status)) {
    return "cancelled";
  }
  return paymentIsRequired(request) ? "awaiting_payment" : "not_required_yet";
};

export const synchronizeBookRequestPaymentStatus = async (
  client,
  { request, adminId, note },
) => {
  const summary = await getBookRequestPaymentSummary(request.id, client);
  if (!summary) {
    throw paymentError("BOOK_REQUEST_NOT_FOUND", "Book request not found");
  }
  const nextStatus = deriveBookRequestPaymentStatus(request, summary);
  const oldStatus = request.payment_status;
  if (nextStatus !== oldStatus) {
    await updateBookRequestPaymentStatus(client, request.id, nextStatus);
    await insertRequestStatusHistory(client, {
      requestId: request.id,
      statusType: "payment",
      oldStatus,
      newStatus: nextStatus,
      adminId,
      note: nullableText(note),
    });
  }
  return { ...summary, payment_status: nextStatus };
};

const assertPaymentCanBeRecorded = (request, summary, amount) => {
  if (PAYMENT_BLOCKED_REQUEST_STATUSES.includes(request.request_status)) {
    throw paymentError(
      "PAYMENT_NOT_ALLOWED",
      "Payments cannot be recorded for cancelled or rejected requests",
    );
  }
  if (request.final_total === null || moneyToMinorUnits(request.final_total) <= 0n) {
    throw paymentError(
      "FINAL_TOTAL_REQUIRED",
      "A positive final total is required before recording payment",
    );
  }
  if (!paymentIsRequired(request)) {
    throw paymentError(
      "PAYMENT_NOT_REQUIRED",
      "The quote must be accepted or the request confirmed before payment",
    );
  }
  const amountMinor = moneyToMinorUnits(amount);
  const netMinor =
    moneyToMinorUnits(summary.total_payments) -
    moneyToMinorUnits(summary.total_refunds);
  const remainingMinor = moneyToMinorUnits(request.final_total) - netMinor;
  if (amountMinor > remainingMinor) {
    throw paymentError(
      "OVERPAYMENT_NOT_ALLOWED",
      "Payment amount exceeds the remaining request balance",
    );
  }
};

const recordLedgerEntry = async (
  { requestId, adminId, kind, payment },
  { dbPool = pool } = {},
) =>
  withTransaction(async (client) => {
    const request = requireRequest(
      await getPaymentRequestForUpdate(client, requestId),
    );
    const currentSummary = await getBookRequestPaymentSummary(requestId, client);
    if (!currentSummary) {
      throw paymentError("BOOK_REQUEST_NOT_FOUND", "Book request not found");
    }
    if (kind === "payment") {
      assertPaymentCanBeRecorded(request, currentSummary, payment.amount);
    } else {
      const amountMinor = moneyToMinorUnits(payment.amount);
      const refundableMinor =
        moneyToMinorUnits(currentSummary.total_payments) -
        moneyToMinorUnits(currentSummary.total_refunds);
      if (amountMinor > refundableMinor) {
        throw paymentError(
          "OVER_REFUND_NOT_ALLOWED",
          "Refund amount exceeds the currently refundable balance",
        );
      }
    }

    const entry = await insertBookRequestPayment(client, {
      requestId,
      kind,
      amount: payment.amount,
      currency: request.currency_code,
      method: payment.method,
      paidAt: payment.paidAt,
      externalReference: nullableText(payment.externalReference),
      purchaseOrderNumber:
        kind === "payment" ? nullableText(payment.purchaseOrderNumber) : null,
      note: nullableText(payment.note),
      adminId,
    });
    const summary = await synchronizeBookRequestPaymentStatus(client, {
      request,
      adminId,
      note:
        kind === "payment"
          ? `Offline payment recorded (${entry.id})`
          : `Offline refund recorded (${entry.id})`,
    });
    return { entry, summary };
  }, dbPool);

export const recordOfflineBookRequestPayment = (input, options) =>
  recordLedgerEntry({ ...input, kind: "payment" }, options);

export const recordOfflineBookRequestRefund = (input, options) =>
  recordLedgerEntry({ ...input, kind: "refund" }, options);

export const voidOfflineBookRequestPayment = async (
  { requestId, paymentId, adminId, reason },
  { dbPool = pool } = {},
) =>
  withTransaction(async (client) => {
    const request = requireRequest(
      await getPaymentRequestForUpdate(client, requestId),
    );
    const payment = await getPaymentRecordForUpdate(
      client,
      requestId,
      paymentId,
    );
    if (!payment) {
      throw paymentError("PAYMENT_RECORD_NOT_FOUND", "Payment record not found");
    }
    if (payment.record_status === "voided") {
      throw paymentError(
        "PAYMENT_ALREADY_VOIDED",
        "Payment record has already been voided",
      );
    }
    const voided = await voidBookRequestPayment(client, {
      requestId,
      paymentId,
      adminId,
      reason: reason.trim(),
    });
    if (!voided) {
      throw paymentError(
        "PAYMENT_ALREADY_VOIDED",
        "Payment record has already been voided",
      );
    }
    const summary = await synchronizeBookRequestPaymentStatus(client, {
      request,
      adminId,
      note: `Offline ${payment.payment_kind} record voided (${paymentId})`,
    });
    return { entry: voided, summary };
  }, dbPool);
