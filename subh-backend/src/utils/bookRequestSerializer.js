export const serializeMoney = (value) => {
  if (value === null || value === undefined) return null;
  const text = String(value);
  const match = text.match(/^(\d+)(?:\.(\d+))?$/);
  if (!match) return text;
  return `${match[1]}.${(match[2] || "").padEnd(2, "0").slice(0, 2)}`;
};

const serializeRequestItem = (item, lang, includeAgreed) => {
  const serialized = {
    id: item.id,
    bookId: item.book_id,
    name:
      lang === "ar"
        ? item.book_name_ar_snapshot
        : item.book_name_en_snapshot,
    isbn: item.isbn_snapshot,
    quantity: item.requested_quantity,
    unitPrice: serializeMoney(item.unit_price_snapshot),
    unitShippingCost: serializeMoney(item.unit_shipping_cost_snapshot),
    estimatedLineSubtotal: serializeMoney(item.estimated_line_subtotal),
    estimatedLineShipping: serializeMoney(item.estimated_line_shipping),
  };

  if (
    includeAgreed &&
    item.agreed_quantity !== null &&
    item.agreed_quantity !== undefined &&
    item.agreed_unit_price !== null &&
    item.agreed_unit_price !== undefined &&
    item.agreed_line_subtotal !== null &&
    item.agreed_line_subtotal !== undefined
  ) {
    serialized.agreedQuantity = item.agreed_quantity;
    serialized.agreedUnitPrice = serializeMoney(item.agreed_unit_price);
    serialized.agreedLineSubtotal = serializeMoney(item.agreed_line_subtotal);
  }

  return serialized;
};

export const serializeBookRequestSummary = (request) => ({
  id: request.id,
  referenceNumber: request.reference_number,
  requestStatus: request.request_status,
  contactStatus: request.contact_status,
  paymentStatus: request.payment_status,
  fulfillmentStatus: request.fulfillment_status,
  quoteStatus: request.quote_status,
  estimatedTotal: serializeMoney(request.estimated_total),
  currency: request.currency_code,
  itemCount: request.item_count,
  totalQuantity: request.total_quantity,
  createdAt: request.created_at,
});

export const serializeBookRequestDetail = (
  request,
  items,
  lang = "en",
  paymentSummary = null,
) => {
  const quoteIsCustomerVisible = [
    "sent",
    "accepted",
    "declined",
    "expired",
  ].includes(request.quote_status);
  const serialized = {
    id: request.id,
    referenceNumber: request.reference_number,
    requestStatus: request.request_status,
    contactStatus: request.contact_status,
    paymentStatus: request.payment_status,
    fulfillmentStatus: request.fulfillment_status,
    quoteStatus: request.quote_status,
    currency: request.currency_code,
    customer: {
      fullName: request.customer_full_name,
      email: request.customer_email,
      phone: request.customer_phone,
      userType: request.customer_user_type,
      companyName: request.customer_company_name,
    },
    items: items.map((item) =>
      serializeRequestItem(item, lang, quoteIsCustomerVisible),
    ),
    estimates: {
      subtotal: serializeMoney(request.estimated_subtotal),
      shippingCost: serializeMoney(request.estimated_shipping_cost),
      total: serializeMoney(request.estimated_total),
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
    },
    customerNote: request.customer_note,
    customerVisibleAdminNote: request.customer_visible_note,
    createdAt: request.created_at,
    updatedAt: request.updated_at,
  };

  if (
    quoteIsCustomerVisible &&
    request.agreed_subtotal !== null &&
    request.agreed_subtotal !== undefined
  ) {
    serialized.quote = {
      agreedSubtotal: serializeMoney(request.agreed_subtotal),
      shippingCost: serializeMoney(request.shipping_cost),
      discountAmount: serializeMoney(request.discount_amount),
      taxAmount: serializeMoney(request.tax_amount),
      finalTotal: serializeMoney(request.final_total),
      quotedAt: request.quoted_at,
      validUntil: request.quote_valid_until,
    };
  }

  if (
    quoteIsCustomerVisible &&
    paymentSummary?.final_total !== null &&
    paymentSummary?.final_total !== undefined
  ) {
    serialized.paymentSummary = {
      totalPayments: serializeMoney(paymentSummary.total_payments),
      totalRefunds: serializeMoney(paymentSummary.total_refunds),
      netPaid: serializeMoney(paymentSummary.net_paid),
      remainingBalance: serializeMoney(paymentSummary.remaining_balance),
      finalTotal: serializeMoney(paymentSummary.final_total),
      currency: paymentSummary.currency_code,
      paymentStatus: request.payment_status,
    };
  }

  if (
    request.shipping_carrier ||
    request.tracking_number ||
    request.shipped_at ||
    request.delivered_at
  ) {
    serialized.tracking = {
      carrier: request.shipping_carrier,
      trackingNumber: request.tracking_number,
      shippedAt: request.shipped_at,
      deliveredAt: request.delivered_at,
    };
  }

  return serialized;
};
