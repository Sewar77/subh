-- Subh Book / Curriculum Request System
-- Migration: 004_book_request_system.sql
--
-- Purpose:
--   Adds the B2B/B2C request workflow used when a customer requests bulk books/curriculum.
--   Payment is NOT processed on the website; payments are recorded by an admin as an audit ledger.
--
-- Important design rules:
--   * Individuals and companies remain normal users. Company-only data lives in company_profiles.
--   * Request, contact, payment, fulfillment, and quote statuses are independent.
--   * Catalog prices/shipping are snapshotted on request items so old requests do not change when books change.
--   * Agreed/final pricing is separate from the initial estimate.
--   * Paid/remaining balance is derived from request_payments; it is intentionally NOT duplicated on book_requests.
--   * Requests should be cancelled/rejected, not physically deleted, at the application layer.
--
-- This migration is additive and does not modify/drop existing users/books/categories/authors data.

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Company profiles
-- ---------------------------------------------------------------------------

CREATE TABLE company_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE
        REFERENCES users(id) ON DELETE CASCADE,

    company_name TEXT NOT NULL,
    ein TEXT,
    registration_number TEXT,
    registration_state TEXT,
    employee_count INTEGER NOT NULL,
    website TEXT,

    verification_status TEXT NOT NULL DEFAULT 'unverified'
        CHECK (verification_status IN ('unverified', 'verified', 'rejected')),
    reviewed_at TIMESTAMPTZ,
    reviewed_by_admin_id INTEGER
        REFERENCES users(id) ON DELETE SET NULL,
    verification_note TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT company_profiles_company_name_nonblank
        CHECK (BTRIM(company_name) <> ''),

    CONSTRAINT company_profiles_identifier_required
        CHECK (
            NULLIF(BTRIM(COALESCE(ein, '')), '') IS NOT NULL
            OR NULLIF(BTRIM(COALESCE(registration_number, '')), '') IS NOT NULL
        ),

    CONSTRAINT company_profiles_employee_count_positive
        CHECK (employee_count > 0)
);

CREATE INDEX idx_company_profiles_company_name
    ON company_profiles (LOWER(company_name));

CREATE INDEX idx_company_profiles_verification_status
    ON company_profiles (verification_status);


-- ---------------------------------------------------------------------------
-- 2. Main book requests
-- ---------------------------------------------------------------------------

CREATE TABLE book_requests (
    id SERIAL PRIMARY KEY,

    -- Database-owned human-friendly reference, populated by trigger below.
    reference_number TEXT NOT NULL UNIQUE,

    user_id INTEGER NOT NULL
        REFERENCES users(id) ON DELETE RESTRICT,

    assigned_admin_id INTEGER
        REFERENCES users(id) ON DELETE SET NULL,

    -- Snapshot of the customer/contact at submission time.
    customer_full_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_user_type TEXT NOT NULL
        CHECK (customer_user_type IN ('individual', 'company')),
    customer_company_name TEXT,

    -- Independent workflow states.
    request_status TEXT NOT NULL DEFAULT 'pending'
        CHECK (
            request_status IN (
                'pending',
                'under_review',
                'quote_sent',
                'confirmed',
                'cancelled',
                'rejected',
                'completed'
            )
        ),

    contact_status TEXT NOT NULL DEFAULT 'not_contacted'
        CHECK (
            contact_status IN (
                'not_contacted',
                'attempted',
                'contacted',
                'waiting_customer',
                'follow_up_required',
                'resolved'
            )
        ),

    payment_status TEXT NOT NULL DEFAULT 'not_required_yet'
        CHECK (
            payment_status IN (
                'not_required_yet',
                'awaiting_payment',
                'partially_paid',
                'paid',
                'refunded',
                'cancelled'
            )
        ),

    fulfillment_status TEXT NOT NULL DEFAULT 'not_started'
        CHECK (
            fulfillment_status IN (
                'not_started',
                'preparing',
                'ready',
                'shipped',
                'delivered'
            )
        ),

    quote_status TEXT NOT NULL DEFAULT 'not_prepared'
        CHECK (
            quote_status IN (
                'not_prepared',
                'draft',
                'sent',
                'accepted',
                'declined',
                'expired'
            )
        ),

    -- Initial estimate captured at submission.
    estimated_subtotal NUMERIC(14,2) NOT NULL DEFAULT 0
        CHECK (estimated_subtotal >= 0),
    estimated_shipping_cost NUMERIC(14,2) NOT NULL DEFAULT 0
        CHECK (estimated_shipping_cost >= 0),
    estimated_total NUMERIC(14,2) NOT NULL DEFAULT 0
        CHECK (estimated_total >= 0),

    -- Agreed/quoted values. These stay NULL until an admin prepares pricing.
    agreed_subtotal NUMERIC(14,2)
        CHECK (agreed_subtotal IS NULL OR agreed_subtotal >= 0),
    shipping_cost NUMERIC(14,2)
        CHECK (shipping_cost IS NULL OR shipping_cost >= 0),
    discount_amount NUMERIC(14,2) NOT NULL DEFAULT 0
        CHECK (discount_amount >= 0),
    tax_amount NUMERIC(14,2) NOT NULL DEFAULT 0
        CHECK (tax_amount >= 0),
    final_total NUMERIC(14,2)
        CHECK (final_total IS NULL OR final_total >= 0),

    currency_code CHAR(3) NOT NULL DEFAULT 'USD'
        CHECK (currency_code = UPPER(currency_code)),

    purchase_order_number TEXT,

    quoted_at TIMESTAMPTZ,
    quote_valid_until DATE,

    -- Shipping/contact snapshot. The request does not depend on a mutable user address.
    shipping_recipient TEXT NOT NULL,
    shipping_company TEXT,
    shipping_phone TEXT NOT NULL,
    shipping_address_line1 TEXT NOT NULL,
    shipping_address_line2 TEXT,
    shipping_city TEXT NOT NULL,
    shipping_state TEXT NOT NULL,
    shipping_postal_code TEXT NOT NULL,
    shipping_country CHAR(2) NOT NULL DEFAULT 'US'
        CHECK (shipping_country = UPPER(shipping_country)),
    shipping_notes TEXT,

    -- Shipping progress data.
    shipping_carrier TEXT,
    tracking_number TEXT,
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,

    -- Visibility boundary:
    -- customer_note: supplied by customer
    -- customer_visible_note: written by admin and safe for customer
    -- admin_internal_note: NEVER serialize to normal users
    customer_note TEXT,
    customer_visible_note TEXT,
    admin_internal_note TEXT,

    last_contacted_at TIMESTAMPTZ,
    next_follow_up_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT book_requests_reference_nonblank
        CHECK (BTRIM(reference_number) <> ''),

    CONSTRAINT book_requests_customer_name_nonblank
        CHECK (BTRIM(customer_full_name) <> ''),

    CONSTRAINT book_requests_customer_email_nonblank
        CHECK (BTRIM(customer_email) <> ''),

    CONSTRAINT book_requests_customer_phone_nonblank
        CHECK (BTRIM(customer_phone) <> ''),

    CONSTRAINT book_requests_company_snapshot_consistency
        CHECK (
            customer_user_type <> 'company'
            OR NULLIF(BTRIM(COALESCE(customer_company_name, '')), '') IS NOT NULL
        ),

    CONSTRAINT book_requests_shipping_recipient_nonblank
        CHECK (BTRIM(shipping_recipient) <> ''),

    CONSTRAINT book_requests_shipping_phone_nonblank
        CHECK (BTRIM(shipping_phone) <> ''),

    CONSTRAINT book_requests_shipping_address_nonblank
        CHECK (
            BTRIM(shipping_address_line1) <> ''
            AND BTRIM(shipping_city) <> ''
            AND BTRIM(shipping_state) <> ''
            AND BTRIM(shipping_postal_code) <> ''
        ),

    CONSTRAINT book_requests_estimated_total_consistency
        CHECK (
            estimated_total =
                estimated_subtotal + estimated_shipping_cost
        ),

    CONSTRAINT book_requests_final_total_consistency
        CHECK (
            final_total IS NULL
            OR (
                agreed_subtotal IS NOT NULL
                AND final_total =
                    agreed_subtotal
                    + COALESCE(shipping_cost, 0)
                    + tax_amount
                    - discount_amount
            )
        ),

    CONSTRAINT book_requests_quote_dates_consistency
        CHECK (
            quote_valid_until IS NULL
            OR quoted_at IS NOT NULL
        ),

    CONSTRAINT book_requests_delivery_dates_consistency
        CHECK (
            delivered_at IS NULL
            OR shipped_at IS NOT NULL
        )
);

CREATE INDEX idx_book_requests_user_created
    ON book_requests (user_id, created_at DESC);

CREATE INDEX idx_book_requests_request_status
    ON book_requests (request_status, created_at DESC);

CREATE INDEX idx_book_requests_contact_status
    ON book_requests (contact_status, created_at DESC);

CREATE INDEX idx_book_requests_payment_status
    ON book_requests (payment_status, created_at DESC);

CREATE INDEX idx_book_requests_fulfillment_status
    ON book_requests (fulfillment_status, created_at DESC);

CREATE INDEX idx_book_requests_assigned_admin
    ON book_requests (assigned_admin_id, created_at DESC);

CREATE INDEX idx_book_requests_follow_up
    ON book_requests (next_follow_up_at)
    WHERE next_follow_up_at IS NOT NULL;


-- ---------------------------------------------------------------------------
-- 3. Request line items
-- ---------------------------------------------------------------------------

CREATE TABLE book_request_items (
    id SERIAL PRIMARY KEY,

    request_id INTEGER NOT NULL
        REFERENCES book_requests(id) ON DELETE CASCADE,

    -- Nullable so historical requests survive if a catalog book is removed.
    book_id INTEGER
        REFERENCES books(id) ON DELETE SET NULL,

    -- Bilingual historical snapshot. Public serializers still return one requested language.
    book_name_en_snapshot TEXT NOT NULL,
    book_name_ar_snapshot TEXT NOT NULL,
    isbn_snapshot TEXT,

    requested_quantity INTEGER NOT NULL
        CHECK (requested_quantity > 0),

    unit_price_snapshot NUMERIC(12,2) NOT NULL
        CHECK (unit_price_snapshot >= 0),

    -- Snapshot of the catalog's per-unit/default shipping value at request time.
    -- Final negotiated request shipping is stored on book_requests.shipping_cost.
    unit_shipping_cost_snapshot NUMERIC(12,2) NOT NULL DEFAULT 0
        CHECK (unit_shipping_cost_snapshot >= 0),

    estimated_line_subtotal NUMERIC(14,2) NOT NULL
        CHECK (estimated_line_subtotal >= 0),

    estimated_line_shipping NUMERIC(14,2) NOT NULL DEFAULT 0
        CHECK (estimated_line_shipping >= 0),

    -- Filled together when quantity/price are negotiated.
    agreed_quantity INTEGER
        CHECK (agreed_quantity IS NULL OR agreed_quantity > 0),

    agreed_unit_price NUMERIC(12,2)
        CHECK (agreed_unit_price IS NULL OR agreed_unit_price >= 0),

    agreed_line_subtotal NUMERIC(14,2)
        CHECK (agreed_line_subtotal IS NULL OR agreed_line_subtotal >= 0),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT book_request_items_name_en_nonblank
        CHECK (BTRIM(book_name_en_snapshot) <> ''),

    CONSTRAINT book_request_items_name_ar_nonblank
        CHECK (BTRIM(book_name_ar_snapshot) <> ''),

    CONSTRAINT book_request_items_estimated_subtotal_consistency
        CHECK (
            estimated_line_subtotal =
                requested_quantity * unit_price_snapshot
        ),

    CONSTRAINT book_request_items_estimated_shipping_consistency
        CHECK (
            estimated_line_shipping =
                requested_quantity * unit_shipping_cost_snapshot
        ),

    CONSTRAINT book_request_items_agreed_values_consistency
        CHECK (
            (
                agreed_quantity IS NULL
                AND agreed_unit_price IS NULL
                AND agreed_line_subtotal IS NULL
            )
            OR
            (
                agreed_quantity IS NOT NULL
                AND agreed_unit_price IS NOT NULL
                AND agreed_line_subtotal =
                    agreed_quantity * agreed_unit_price
            )
        )
);

CREATE INDEX idx_book_request_items_request
    ON book_request_items (request_id);

CREATE INDEX idx_book_request_items_book
    ON book_request_items (book_id)
    WHERE book_id IS NOT NULL;

-- One active catalog book should appear once per request.
CREATE UNIQUE INDEX uq_book_request_items_request_book
    ON book_request_items (request_id, book_id)
    WHERE book_id IS NOT NULL;


-- ---------------------------------------------------------------------------
-- 4. Offline payment ledger
-- ---------------------------------------------------------------------------

CREATE TABLE request_payments (
    id SERIAL PRIMARY KEY,

    request_id INTEGER NOT NULL
        REFERENCES book_requests(id) ON DELETE CASCADE,

    payment_kind TEXT NOT NULL DEFAULT 'payment'
        CHECK (payment_kind IN ('payment', 'refund')),

    amount NUMERIC(14,2) NOT NULL
        CHECK (amount > 0),

    currency_code CHAR(3) NOT NULL DEFAULT 'USD'
        CHECK (currency_code = UPPER(currency_code)),

    payment_method TEXT NOT NULL
        CHECK (
            payment_method IN (
                'bank_transfer',
                'wire_transfer',
                'ach',
                'check',
                'cash',
                'other'
            )
        ),

    paid_at TIMESTAMPTZ NOT NULL,

    external_reference TEXT,
    purchase_order_number TEXT,
    note TEXT,

    -- Never physically remove an incorrect payment record; void it.
    record_status TEXT NOT NULL DEFAULT 'recorded'
        CHECK (record_status IN ('recorded', 'voided')),

    recorded_by_admin_id INTEGER NOT NULL
        REFERENCES users(id) ON DELETE RESTRICT,

    voided_at TIMESTAMPTZ,
    voided_by_admin_id INTEGER
        REFERENCES users(id) ON DELETE RESTRICT,
    void_reason TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT request_payments_void_consistency
        CHECK (
            (
                record_status = 'recorded'
                AND voided_at IS NULL
                AND voided_by_admin_id IS NULL
                AND void_reason IS NULL
            )
            OR
            (
                record_status = 'voided'
                AND voided_at IS NOT NULL
                AND voided_by_admin_id IS NOT NULL
                AND NULLIF(BTRIM(COALESCE(void_reason, '')), '') IS NOT NULL
            )
        )
);

CREATE INDEX idx_request_payments_request_paid
    ON request_payments (request_id, paid_at DESC);

CREATE INDEX idx_request_payments_active
    ON request_payments (request_id, payment_kind)
    WHERE record_status = 'recorded';


-- ---------------------------------------------------------------------------
-- 5. Derived payment summary
-- ---------------------------------------------------------------------------
-- Do not duplicate amount_paid / remaining_balance on book_requests.
-- This view derives them from the append-only payment/refund ledger.
-- Only non-voided records participate.

CREATE VIEW book_request_payment_summary AS
SELECT
    r.id AS request_id,
    r.reference_number,
    r.currency_code,
    r.final_total,

    COALESCE(
        SUM(
            CASE
                WHEN p.record_status = 'recorded'
                 AND p.payment_kind = 'payment'
                THEN p.amount
                ELSE 0
            END
        ),
        0
    )::NUMERIC(14,2) AS total_payments,

    COALESCE(
        SUM(
            CASE
                WHEN p.record_status = 'recorded'
                 AND p.payment_kind = 'refund'
                THEN p.amount
                ELSE 0
            END
        ),
        0
    )::NUMERIC(14,2) AS total_refunds,

    (
        COALESCE(
            SUM(
                CASE
                    WHEN p.record_status = 'recorded'
                     AND p.payment_kind = 'payment'
                    THEN p.amount
                    ELSE 0
                END
            ),
            0
        )
        -
        COALESCE(
            SUM(
                CASE
                    WHEN p.record_status = 'recorded'
                     AND p.payment_kind = 'refund'
                    THEN p.amount
                    ELSE 0
                END
            ),
            0
        )
    )::NUMERIC(14,2) AS net_paid,

    CASE
        WHEN r.final_total IS NULL THEN NULL
        ELSE (
            r.final_total
            -
            (
                COALESCE(
                    SUM(
                        CASE
                            WHEN p.record_status = 'recorded'
                             AND p.payment_kind = 'payment'
                            THEN p.amount
                            ELSE 0
                        END
                    ),
                    0
                )
                -
                COALESCE(
                    SUM(
                        CASE
                            WHEN p.record_status = 'recorded'
                             AND p.payment_kind = 'refund'
                            THEN p.amount
                            ELSE 0
                        END
                    ),
                    0
                )
            )
        )::NUMERIC(14,2)
    END AS remaining_balance

FROM book_requests r
LEFT JOIN request_payments p
    ON p.request_id = r.id
GROUP BY
    r.id,
    r.reference_number,
    r.currency_code,
    r.final_total;


-- ---------------------------------------------------------------------------
-- 6. Status history / audit trail
-- ---------------------------------------------------------------------------

CREATE TABLE request_status_history (
    id SERIAL PRIMARY KEY,

    request_id INTEGER NOT NULL
        REFERENCES book_requests(id) ON DELETE CASCADE,

    status_type TEXT NOT NULL
        CHECK (
            status_type IN (
                'request',
                'contact',
                'payment',
                'fulfillment',
                'quote'
            )
        ),

    old_status TEXT,
    new_status TEXT NOT NULL,

    changed_by_user_id INTEGER NOT NULL
        REFERENCES users(id) ON DELETE RESTRICT,

    note TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT request_status_history_new_status_nonblank
        CHECK (BTRIM(new_status) <> ''),

    CONSTRAINT request_status_history_old_status_nonblank
        CHECK (
            old_status IS NULL
            OR BTRIM(old_status) <> ''
        )
);

CREATE INDEX idx_request_status_history_request
    ON request_status_history (request_id, created_at DESC);


-- ---------------------------------------------------------------------------
-- 7. Contact history / lightweight CRM
-- ---------------------------------------------------------------------------

CREATE TABLE request_contact_history (
    id SERIAL PRIMARY KEY,

    request_id INTEGER NOT NULL
        REFERENCES book_requests(id) ON DELETE CASCADE,

    admin_id INTEGER NOT NULL
        REFERENCES users(id) ON DELETE RESTRICT,

    contact_method TEXT NOT NULL
        CHECK (
            contact_method IN (
                'phone',
                'email',
                'meeting',
                'sms',
                'other'
            )
        ),

    outcome TEXT NOT NULL
        CHECK (
            outcome IN (
                'no_answer',
                'voicemail',
                'left_message',
                'spoke_customer',
                'waiting_customer',
                'follow_up_required',
                'resolved',
                'other'
            )
        ),

    note TEXT,

    contacted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    next_follow_up_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_request_contact_history_request
    ON request_contact_history (request_id, contacted_at DESC);

CREATE INDEX idx_request_contact_history_follow_up
    ON request_contact_history (next_follow_up_at)
    WHERE next_follow_up_at IS NOT NULL;


-- ---------------------------------------------------------------------------
-- 8. Database-owned request reference
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION set_book_request_reference()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- NEW.id already contains its sequence-generated value before this trigger runs.
    NEW.reference_number :=
        'SUBH-'
        || TO_CHAR(COALESCE(NEW.created_at, NOW()), 'YYYY')
        || '-'
        || LPAD(NEW.id::TEXT, 6, '0');

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_book_requests_reference
BEFORE INSERT ON book_requests
FOR EACH ROW
EXECUTE FUNCTION set_book_request_reference();


-- ---------------------------------------------------------------------------
-- 9. updated_at maintenance for mutable request-domain tables
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION set_book_request_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_company_profiles_updated_at
BEFORE UPDATE ON company_profiles
FOR EACH ROW
EXECUTE FUNCTION set_book_request_updated_at();

CREATE TRIGGER trg_book_requests_updated_at
BEFORE UPDATE ON book_requests
FOR EACH ROW
EXECUTE FUNCTION set_book_request_updated_at();

CREATE TRIGGER trg_book_request_items_updated_at
BEFORE UPDATE ON book_request_items
FOR EACH ROW
EXECUTE FUNCTION set_book_request_updated_at();


-- ---------------------------------------------------------------------------
-- 10. Helpful documentation inside PostgreSQL
-- ---------------------------------------------------------------------------

COMMENT ON TABLE company_profiles IS
    'Optional company-only profile for users; company accounts still authenticate and authorize as normal users.';

COMMENT ON TABLE book_requests IS
    'Bulk book/curriculum request. Commercial agreement and payment happen offline; status is tracked in Subh.';

COMMENT ON TABLE book_request_items IS
    'Requested books with immutable catalog snapshots plus nullable negotiated quantity/price.';

COMMENT ON TABLE request_payments IS
    'Admin-recorded offline payment/refund ledger. Active paid balance is derived from non-voided records.';

COMMENT ON TABLE request_status_history IS
    'Audit history for request/contact/payment/fulfillment/quote status changes.';

COMMENT ON TABLE request_contact_history IS
    'Admin contact/follow-up history for a request.';

COMMENT ON COLUMN book_requests.admin_internal_note IS
    'Admin-only note. Must never be serialized to a normal user.';

COMMENT ON COLUMN book_requests.customer_visible_note IS
    'Admin-authored note safe to display to the requesting customer.';

COMMENT ON COLUMN book_requests.final_total IS
    'Final agreed amount = agreed_subtotal + shipping_cost + tax_amount - discount_amount.';

COMMENT ON COLUMN request_payments.amount IS
    'Positive amount. payment_kind determines whether the ledger entry adds payment or subtracts a refund.';


COMMIT;
