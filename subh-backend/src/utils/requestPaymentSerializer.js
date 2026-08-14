import { serializeMoney } from "./bookRequestSerializer.js";

export const serializePaymentSummary = (summary, paymentStatus) =>
  summary
    ? {
        totalPayments: serializeMoney(summary.total_payments),
        totalRefunds: serializeMoney(summary.total_refunds),
        netPaid: serializeMoney(summary.net_paid),
        remainingBalance: serializeMoney(summary.remaining_balance),
        finalTotal: serializeMoney(summary.final_total),
        currency: summary.currency_code,
        paymentStatus,
      }
    : null;

export const serializeAdminPaymentRecord = (payment) => ({
  id: payment.id,
  kind: payment.payment_kind,
  amount: serializeMoney(payment.amount),
  currency: payment.currency_code,
  method: payment.payment_method,
  paidAt: payment.paid_at,
  externalReference: payment.external_reference,
  purchaseOrderNumber: payment.purchase_order_number,
  note: payment.note,
  recordStatus: payment.record_status,
  recordedBy: {
    id: payment.recorded_by_id,
    name: payment.recorded_by_name,
    email: payment.recorded_by_email,
  },
  createdAt: payment.created_at,
  voidAudit:
    payment.record_status === "voided"
      ? {
          voidedAt: payment.voided_at,
          voidedBy: {
            id: payment.voided_by_id,
            name: payment.voided_by_name,
            email: payment.voided_by_email,
          },
          reason: payment.void_reason,
        }
      : null,
});
