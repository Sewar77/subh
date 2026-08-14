import { serializeMoney } from "./bookRequestSerializer.js";
import {
  serializeAdminPaymentRecord,
  serializePaymentSummary,
} from "./requestPaymentSerializer.js";

const serializeAdminSummary = (request) => ({
  id: request.id,
  referenceNumber: request.reference_number,
  customer: {
    fullName: request.customer_full_name,
    userType: request.customer_user_type,
    companyName: request.customer_company_name,
  },
  requestStatus: request.request_status,
  contactStatus: request.contact_status,
  paymentStatus: request.payment_status,
  fulfillmentStatus: request.fulfillment_status,
  quoteStatus: request.quote_status,
  estimatedTotal: serializeMoney(request.estimated_total),
  finalTotal: serializeMoney(request.final_total),
  currency: request.currency_code,
  itemCount: request.item_count,
  totalQuantity: request.total_quantity,
  assignedAdmin: request.assigned_admin_id
    ? {
        id: request.assigned_admin_id,
        name: request.assigned_admin_name,
        email: request.assigned_admin_email,
      }
    : null,
  nextFollowUpAt: request.next_follow_up_at,
  createdAt: request.created_at,
});

const serializeAdminItem = (item) => {
  const serialized = {
    id: item.id,
    bookId: item.book_id,
    nameEn: item.book_name_en_snapshot,
    nameAr: item.book_name_ar_snapshot,
    isbn: item.isbn_snapshot,
    requestedQuantity: item.requested_quantity,
    unitPriceSnapshot: serializeMoney(item.unit_price_snapshot),
    unitShippingCostSnapshot: serializeMoney(
      item.unit_shipping_cost_snapshot,
    ),
    estimatedLineSubtotal: serializeMoney(item.estimated_line_subtotal),
    estimatedLineShipping: serializeMoney(item.estimated_line_shipping),
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
  if (item.agreed_quantity !== null && item.agreed_quantity !== undefined) {
    serialized.agreedQuantity = item.agreed_quantity;
    serialized.agreedUnitPrice = serializeMoney(item.agreed_unit_price);
    serialized.agreedLineSubtotal = serializeMoney(item.agreed_line_subtotal);
  }
  return serialized;
};

const serializeContact = (contact) => ({
  id: contact.id,
  admin: {
    id: contact.admin_id,
    name: contact.admin_name,
    email: contact.admin_email,
  },
  contactMethod: contact.contact_method,
  outcome: contact.outcome,
  note: contact.note,
  contactedAt: contact.contacted_at,
  nextFollowUpAt: contact.next_follow_up_at,
  createdAt: contact.created_at,
});

const serializeStatusHistory = (history) => ({
  id: history.id,
  statusType: history.status_type,
  oldStatus: history.old_status,
  newStatus: history.new_status,
  note: history.note,
  changedBy: {
    id: history.changed_by_id,
    name: history.changed_by_name,
    email: history.changed_by_email,
  },
  createdAt: history.created_at,
});

export const serializeAdminBookRequestSummary = serializeAdminSummary;

export const serializeAdminBookRequestDetail = ({
  request,
  items,
  contactHistory,
  statusHistory,
  paymentSummary = null,
  payments = [],
}) => ({
  id: request.id,
  referenceNumber: request.reference_number,
  customer: {
    userId: request.user_id,
    fullName: request.customer_full_name,
    email: request.customer_email,
    phone: request.customer_phone,
    userType: request.customer_user_type,
    companyName: request.customer_company_name,
  },
  assignedAdmin: request.assigned_admin_id
    ? {
        id: request.assigned_admin_id,
        name: request.assigned_admin_name,
        email: request.assigned_admin_email,
      }
    : null,
  requestStatus: request.request_status,
  contactStatus: request.contact_status,
  paymentStatus: request.payment_status,
  fulfillmentStatus: request.fulfillment_status,
  quoteStatus: request.quote_status,
  items: items.map(serializeAdminItem),
  estimates: {
    subtotal: serializeMoney(request.estimated_subtotal),
    shippingCost: serializeMoney(request.estimated_shipping_cost),
    total: serializeMoney(request.estimated_total),
  },
  quote: {
    agreedSubtotal: serializeMoney(request.agreed_subtotal),
    shippingCost: serializeMoney(request.shipping_cost),
    discountAmount: serializeMoney(request.discount_amount),
    taxAmount: serializeMoney(request.tax_amount),
    finalTotal: serializeMoney(request.final_total),
    currency: request.currency_code,
    purchaseOrderNumber: request.purchase_order_number,
    quotedAt: request.quoted_at,
    validUntil: request.quote_valid_until,
  },
  shipping: {
    recipient: request.shipping_recipient,
    company: request.shipping_company,
    phone: request.shipping_phone,
    addressLine1: request.shipping_address_line1,
    addressLine2: request.shipping_address_line2,
    city: request.shipping_city,
    state: request.shipping_state,
    postalCode: request.shipping_postal_code,
    country: request.shipping_country,
    notes: request.shipping_notes,
    carrier: request.shipping_carrier,
    trackingNumber: request.tracking_number,
    shippedAt: request.shipped_at,
    deliveredAt: request.delivered_at,
  },
  notes: {
    customer: request.customer_note,
    customerVisibleAdmin: request.customer_visible_note,
    adminInternal: request.admin_internal_note,
  },
  lastContactedAt: request.last_contacted_at,
  nextFollowUpAt: request.next_follow_up_at,
  contactHistory: contactHistory.map(serializeContact),
  statusHistory: statusHistory.map(serializeStatusHistory),
  paymentSummary: serializePaymentSummary(
    paymentSummary,
    request.payment_status,
  ),
  payments: payments.map(serializeAdminPaymentRecord),
  createdAt: request.created_at,
  updatedAt: request.updated_at,
});
