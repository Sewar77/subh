import { getValidated } from "../middleware/validate.Middleware.js";
import {
  getBookRequestPaymentSummary,
  listBookRequestPayments,
} from "../models/requestPayment.Model.js";
import {
  recordOfflineBookRequestPayment,
  recordOfflineBookRequestRefund,
  voidOfflineBookRequestPayment,
} from "../services/bookRequests/requestPaymentService.js";
import {
  serializeAdminPaymentRecord,
  serializePaymentSummary,
} from "../utils/requestPaymentSerializer.js";

const paymentErrorResponse = (res, error) => {
  if (
    error?.code === "BOOK_REQUEST_NOT_FOUND" ||
    error?.code === "PAYMENT_RECORD_NOT_FOUND"
  ) {
    return res.status(404).json({ message: error.message });
  }
  if (
    error?.code === "FINAL_TOTAL_REQUIRED" ||
    error?.code === "PAYMENT_NOT_ALLOWED" ||
    error?.code === "PAYMENT_NOT_REQUIRED"
  ) {
    return res.status(400).json({ message: error.message });
  }
  if (
    error?.code === "OVERPAYMENT_NOT_ALLOWED" ||
    error?.code === "OVER_REFUND_NOT_ALLOWED" ||
    error?.code === "PAYMENT_ALREADY_VOIDED" ||
    error?.code === "INVALID_PAYMENT_BALANCE"
  ) {
    return res.status(409).json({ message: error.message });
  }
  return res.status(500).json({ message: "Internal server error" });
};

const loadPaymentLedger = async (requestId) => {
  const [summary, payments] = await Promise.all([
    getBookRequestPaymentSummary(requestId),
    listBookRequestPayments(requestId),
  ]);
  if (!summary) return null;
  return {
    paymentSummary: serializePaymentSummary(summary, summary.payment_status),
    payments: payments.map(serializeAdminPaymentRecord),
  };
};

export const listBookRequestPaymentsController = async (req, res) => {
  try {
    const ledger = await loadPaymentLedger(getValidated(req, "params").id);
    if (!ledger) {
      return res.status(404).json({ message: "Book request not found" });
    }
    return res.status(200).json(ledger);
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const recordEntry = (kind) => async (req, res) => {
  const requestId = getValidated(req, "params").id;
  try {
    const operation =
      kind === "payment"
        ? recordOfflineBookRequestPayment
        : recordOfflineBookRequestRefund;
    await operation({
      requestId,
      adminId: req.user.id,
      payment: getValidated(req, "body"),
    });
    return res.status(201).json(await loadPaymentLedger(requestId));
  } catch (error) {
    return paymentErrorResponse(res, error);
  }
};

export const recordBookRequestPaymentController = recordEntry("payment");
export const recordBookRequestRefundController = recordEntry("refund");

export const voidBookRequestPaymentController = async (req, res) => {
  const params = getValidated(req, "params");
  try {
    await voidOfflineBookRequestPayment({
      requestId: params.id,
      paymentId: params.paymentId,
      adminId: req.user.id,
      reason: getValidated(req, "body").reason,
    });
    return res.status(200).json(await loadPaymentLedger(params.id));
  } catch (error) {
    return paymentErrorResponse(res, error);
  }
};
