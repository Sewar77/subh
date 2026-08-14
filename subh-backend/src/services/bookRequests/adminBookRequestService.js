import pool from "../../config/db.js";
import {
  BOOK_REQUEST_STATUS_COLUMNS,
  BOOK_REQUEST_TRANSITIONS,
  CONTACT_OUTCOME_STATUSES,
} from "../../config/bookRequest.js";
import {
  getActiveAdminForAssignment,
  getAdminBookRequestForUpdate,
  getRequestItemsForUpdate,
  insertRequestContactHistory,
  insertRequestStatusHistory,
  updateNegotiatedRequestItems,
  updateRequestAssignment,
  updateRequestContactSnapshot,
  updateRequestNotes,
  updateRequestQuote,
  updateRequestWorkflowStatus,
} from "../../models/adminBookRequest.Model.js";
import { minorUnitsToMoney, moneyToMinorUnits } from "../../utils/money.js";
import { synchronizeBookRequestPaymentStatus } from "./requestPaymentService.js";

const MAX_NUMERIC_14_2_MINOR_UNITS = 99999999999999n;

const nullableText = (value) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed || null;
};

const createWorkflowError = (code, message) => {
  const error = new Error(message);
  error.code = code;
  return error;
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

const getStatusValue = (request, statusType) => {
  const column = BOOK_REQUEST_STATUS_COLUMNS[statusType];
  return column ? request[column] : undefined;
};

export const assertBookRequestTransition = (
  statusType,
  oldStatus,
  newStatus,
) => {
  if (oldStatus === newStatus) {
    throw createWorkflowError(
      "INVALID_STATUS_TRANSITION",
      "Status is already set to that value",
    );
  }
  if (!BOOK_REQUEST_TRANSITIONS[statusType]?.[oldStatus]?.includes(newStatus)) {
    throw createWorkflowError(
      "INVALID_STATUS_TRANSITION",
      `Cannot change ${statusType} status from ${oldStatus} to ${newStatus}`,
    );
  }
};

const requireRequest = (request) => {
  if (!request) {
    throw createWorkflowError("BOOK_REQUEST_NOT_FOUND", "Book request not found");
  }
  return request;
};

export const assignBookRequestAdmin = async (
  { requestId, assignedAdminId },
  { dbPool = pool } = {},
) =>
  withTransaction(async (client) => {
    requireRequest(await getAdminBookRequestForUpdate(client, requestId));
    if (assignedAdminId !== null) {
      const admin = await getActiveAdminForAssignment(client, assignedAdminId);
      if (!admin) {
        throw createWorkflowError(
          "INVALID_ASSIGNED_ADMIN",
          "Assigned user must be an active administrator",
        );
      }
    }
    return updateRequestAssignment(client, requestId, assignedAdminId);
  }, dbPool);

export const changeBookRequestStatus = async (
  { requestId, adminId, statusType, status, note },
  { dbPool = pool } = {},
) =>
  withTransaction(async (client) => {
    const request = requireRequest(
      await getAdminBookRequestForUpdate(client, requestId),
    );
    const oldStatus = getStatusValue(request, statusType);
    assertBookRequestTransition(statusType, oldStatus, status);
    const updated = await updateRequestWorkflowStatus(
      client,
      requestId,
      statusType,
      status,
    );
    await insertRequestStatusHistory(client, {
      requestId,
      statusType,
      oldStatus,
      newStatus: status,
      adminId,
      note: nullableText(note),
    });
    if (["request", "quote"].includes(statusType)) {
      await synchronizeBookRequestPaymentStatus(client, {
        request: {
          ...request,
          [BOOK_REQUEST_STATUS_COLUMNS[statusType]]: status,
        },
        adminId,
        note: `Payment status recalculated after ${statusType} status change`,
      });
    }
    return updated;
  }, dbPool);

export const prepareBookRequestQuote = async (
  { requestId, adminId, quote },
  { dbPool = pool } = {},
) =>
  withTransaction(async (client) => {
    const request = requireRequest(
      await getAdminBookRequestForUpdate(client, requestId),
    );
    const existingItems = await getRequestItemsForUpdate(client, requestId);
    const existingIds = new Set(existingItems.map(({ id }) => id));
    const suppliedIds = new Set(quote.items.map(({ itemId }) => itemId));
    if (
      existingIds.size !== suppliedIds.size ||
      [...existingIds].some((id) => !suppliedIds.has(id))
    ) {
      throw createWorkflowError(
        "QUOTE_ITEMS_MISMATCH",
        "Quote must include every request item exactly once",
      );
    }

    const expectedSubtotalMinor = quote.items.reduce((sum, item) => {
      const lineTotal =
        BigInt(item.agreedQuantity) * moneyToMinorUnits(item.agreedUnitPrice);
      if (lineTotal > MAX_NUMERIC_14_2_MINOR_UNITS) {
        throw createWorkflowError(
          "QUOTE_AMOUNT_TOO_LARGE",
          "A negotiated line total exceeds the supported amount",
        );
      }
      return sum + lineTotal;
    }, 0n);
    if (expectedSubtotalMinor > MAX_NUMERIC_14_2_MINOR_UNITS) {
      throw createWorkflowError(
        "QUOTE_AMOUNT_TOO_LARGE",
        "The negotiated subtotal exceeds the supported amount",
      );
    }

    const updatedItems = await updateNegotiatedRequestItems(
      client,
      requestId,
      quote.items.map((item) => ({
        item_id: item.itemId,
        agreed_quantity: item.agreedQuantity,
        agreed_unit_price: item.agreedUnitPrice,
      })),
    );
    if (updatedItems.length !== existingItems.length) {
      throw createWorkflowError(
        "QUOTE_ITEMS_MISMATCH",
        "Quote items could not be updated safely",
      );
    }

    const agreedSubtotalMinor = updatedItems.reduce(
      (sum, item) => sum + moneyToMinorUnits(item.agreed_line_subtotal),
      0n,
    );
    if (agreedSubtotalMinor !== expectedSubtotalMinor) {
      throw createWorkflowError(
        "QUOTE_CALCULATION_MISMATCH",
        "Negotiated totals could not be calculated safely",
      );
    }
    const shippingMinor = moneyToMinorUnits(quote.shippingCost);
    const discountMinor = moneyToMinorUnits(quote.discountAmount);
    const taxMinor = moneyToMinorUnits(quote.taxAmount);
    const finalTotalMinor =
      agreedSubtotalMinor + shippingMinor + taxMinor - discountMinor;
    if (finalTotalMinor < 0n) {
      throw createWorkflowError(
        "NEGATIVE_FINAL_TOTAL",
        "Discount cannot make the final total negative",
      );
    }
    if (finalTotalMinor > MAX_NUMERIC_14_2_MINOR_UNITS) {
      throw createWorkflowError(
        "QUOTE_AMOUNT_TOO_LARGE",
        "The final total exceeds the supported amount",
      );
    }

    const oldQuoteStatus = request.quote_status;
    if (oldQuoteStatus !== "draft") {
      assertBookRequestTransition("quote", oldQuoteStatus, "draft");
    }
    const updatedRequest = await updateRequestQuote(client, requestId, {
      agreedSubtotal: minorUnitsToMoney(agreedSubtotalMinor),
      shippingCost: quote.shippingCost,
      discountAmount: quote.discountAmount,
      taxAmount: quote.taxAmount,
      quoteValidUntil: quote.quoteValidUntil,
      customerVisibleNote: nullableText(quote.customerVisibleNote),
    });
    if (oldQuoteStatus !== "draft") {
      await insertRequestStatusHistory(client, {
        requestId,
        statusType: "quote",
        oldStatus: oldQuoteStatus,
        newStatus: "draft",
        adminId,
        note: nullableText(quote.historyNote),
      });
    }
    await synchronizeBookRequestPaymentStatus(client, {
      request: { ...request, ...updatedRequest },
      adminId,
      note: "Payment status recalculated after quote preparation",
    });

    return { request: updatedRequest, items: updatedItems };
  }, dbPool);

export const changeBookRequestNotes = async ({ requestId, notes }) => {
  const updated = await updateRequestNotes(requestId, {
    customerVisibleNote: nullableText(notes.customerVisibleNote),
    adminInternalNote: nullableText(notes.adminInternalNote),
  });
  return requireRequest(updated);
};

export const recordBookRequestContact = async (
  { requestId, adminId, contact },
  { dbPool = pool } = {},
) =>
  withTransaction(async (client) => {
    const request = requireRequest(
      await getAdminBookRequestForUpdate(client, requestId),
    );
    const newContactStatus = CONTACT_OUTCOME_STATUSES[contact.outcome];
    const oldContactStatus = request.contact_status;
    if (newContactStatus !== oldContactStatus) {
      assertBookRequestTransition(
        "contact",
        oldContactStatus,
        newContactStatus,
      );
    }
    const history = await insertRequestContactHistory(
      client,
      requestId,
      adminId,
      {
        contactMethod: contact.contactMethod,
        outcome: contact.outcome,
        note: nullableText(contact.note),
        contactedAt: contact.contactedAt ?? null,
        nextFollowUpAt: contact.nextFollowUpAt ?? null,
      },
    );
    const updated = await updateRequestContactSnapshot(client, requestId, {
      contactedAt: history.contacted_at,
      nextFollowUpAt: history.next_follow_up_at,
      contactStatus: newContactStatus,
    });
    if (newContactStatus !== oldContactStatus) {
      await insertRequestStatusHistory(client, {
        requestId,
        statusType: "contact",
        oldStatus: oldContactStatus,
        newStatus: newContactStatus,
        adminId,
        note: nullableText(contact.note),
      });
    }
    return { request: updated, contact: history };
  }, dbPool);
