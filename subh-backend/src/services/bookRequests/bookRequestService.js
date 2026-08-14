import pool from "../../config/db.js";
import { getCompanyProfileByUserId } from "../../models/companyProfile.Model.js";
import {
  createBookRequest,
  createBookRequestItems,
  loadBookSnapshotsForRequest,
} from "../../models/bookRequest.Model.js";
import { minorUnitsToMoney, moneyToMinorUnits } from "../../utils/money.js";

const nullableText = (value) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
};

const createPublicError = (code, message) => {
  const error = new Error(message);
  error.code = code;
  return error;
};

const assertAccountSnapshotAvailable = (user) => {
  if (
    !user?.id ||
    !user.fullName ||
    !user.email ||
    !user.phoneNumber ||
    !["individual", "company"].includes(user.userType)
  ) {
    throw createPublicError(
      "ACCOUNT_PROFILE_INCOMPLETE",
      "Account profile is incomplete",
    );
  }
};

export const createCustomerBookRequest = async (
  { user, payload },
  { dbPool = pool } = {},
) => {
  assertAccountSnapshotAvailable(user);
  const client = await dbPool.connect();

  try {
    await client.query("BEGIN");
    const companyProfile =
      user.userType === "company"
        ? await getCompanyProfileByUserId(user.id, client)
        : null;

    if (user.userType === "company" && !companyProfile?.company_name) {
      throw createPublicError(
        "COMPANY_PROFILE_REQUIRED",
        "Company profile is required",
      );
    }

    const snapshots = await loadBookSnapshotsForRequest(client, payload.items);
    if (snapshots.length !== payload.items.length) {
      throw createPublicError(
        "BOOK_NOT_FOUND",
        "One or more books were not found",
      );
    }

    const estimatedSubtotalMinor = snapshots.reduce(
      (sum, item) => sum + moneyToMinorUnits(item.estimated_line_subtotal),
      0n,
    );
    const estimatedShippingMinor = snapshots.reduce(
      (sum, item) => sum + moneyToMinorUnits(item.estimated_line_shipping),
      0n,
    );
    const shipping = payload.shipping;
    const request = await createBookRequest(client, {
      userId: user.id,
      customerFullName: user.fullName,
      customerEmail: user.email,
      customerPhone: user.phoneNumber,
      customerUserType: user.userType,
      customerCompanyName: companyProfile?.company_name ?? null,
      estimatedSubtotal: minorUnitsToMoney(estimatedSubtotalMinor),
      estimatedShippingCost: minorUnitsToMoney(estimatedShippingMinor),
      estimatedTotal: minorUnitsToMoney(
        estimatedSubtotalMinor + estimatedShippingMinor,
      ),
      shipping: {
        recipient: shipping.recipient.trim(),
        company: nullableText(shipping.company),
        phone: shipping.phone.trim(),
        addressLine1: shipping.addressLine1.trim(),
        addressLine2: nullableText(shipping.addressLine2),
        city: shipping.city.trim(),
        state: shipping.state.trim(),
        postalCode: shipping.postalCode.trim(),
        country: shipping.country,
        notes: nullableText(shipping.notes),
      },
      customerNote: nullableText(payload.customerNote),
    });
    const createdItems = await createBookRequestItems(
      client,
      request.id,
      snapshots,
    );
    await client.query("COMMIT");

    return { request, items: createdItems };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
