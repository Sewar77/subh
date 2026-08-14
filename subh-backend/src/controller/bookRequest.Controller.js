import { getValidated } from "../middleware/validate.Middleware.js";
import {
  getOwnBookRequestById,
  listOwnBookRequests,
} from "../models/bookRequest.Model.js";
import { createCustomerBookRequest } from "../services/bookRequests/bookRequestService.js";
import {
  serializeBookRequestDetail,
  serializeBookRequestSummary,
} from "../utils/bookRequestSerializer.js";

const creationErrorResponse = (res, error) => {
  if (error?.code === "BOOK_NOT_FOUND") {
    return res.status(404).json({ message: error.message });
  }
  if (
    error?.code === "ACCOUNT_PROFILE_INCOMPLETE" ||
    error?.code === "COMPANY_PROFILE_REQUIRED"
  ) {
    return res.status(409).json({ message: error.message });
  }
  return res.status(500).json({ message: "Internal server error" });
};

export const createBookRequestController = async (req, res) => {
  try {
    const result = await createCustomerBookRequest({
      user: req.user,
      payload: getValidated(req, "body"),
    });
    const { lang } = getValidated(req, "query");

    return res.status(201).json({
      request: serializeBookRequestDetail(result.request, result.items, lang),
    });
  } catch (error) {
    return creationErrorResponse(res, error);
  }
};

export const listMyBookRequestsController = async (req, res) => {
  try {
    const result = await listOwnBookRequests(
      req.user.id,
      getValidated(req, "query"),
    );
    return res.status(200).json({
      requests: result.requests.map(serializeBookRequestSummary),
      pagination: result.pagination,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getMyBookRequestController = async (req, res) => {
  try {
    const result = await getOwnBookRequestById(
      req.user.id,
      getValidated(req, "params").id,
    );
    if (!result) {
      return res.status(404).json({ message: "Book request not found" });
    }
    return res.status(200).json({
      request: serializeBookRequestDetail(
        result.request,
        result.items,
        getValidated(req, "query").lang,
        result.paymentSummary,
      ),
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
