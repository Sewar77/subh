import { getValidated } from "../middleware/validate.Middleware.js";
import {
  getAdminBookRequestById,
  listAdminBookRequests,
} from "../models/adminBookRequest.Model.js";
import {
  assignBookRequestAdmin,
  changeBookRequestNotes,
  changeBookRequestStatus,
  prepareBookRequestQuote,
  recordBookRequestContact,
} from "../services/bookRequests/adminBookRequestService.js";
import {
  serializeAdminBookRequestDetail,
  serializeAdminBookRequestSummary,
} from "../utils/adminBookRequestSerializer.js";

const workflowErrorResponse = (res, error) => {
  if (error?.code === "BOOK_REQUEST_NOT_FOUND") {
    return res.status(404).json({ message: error.message });
  }
  if (
    error?.code === "INVALID_ASSIGNED_ADMIN" ||
    error?.code === "QUOTE_ITEMS_MISMATCH" ||
    error?.code === "NEGATIVE_FINAL_TOTAL" ||
    error?.code === "QUOTE_AMOUNT_TOO_LARGE" ||
    error?.code === "QUOTE_CALCULATION_MISMATCH"
  ) {
    return res.status(400).json({ message: error.message });
  }
  if (error?.code === "INVALID_STATUS_TRANSITION") {
    return res.status(409).json({ message: error.message });
  }
  return res.status(500).json({ message: "Internal server error" });
};

const loadAdminRequest = async (requestId) => {
  const result = await getAdminBookRequestById(requestId);
  return result ? serializeAdminBookRequestDetail(result) : null;
};

export const listAdminBookRequestsController = async (req, res) => {
  try {
    const result = await listAdminBookRequests(getValidated(req, "query"));
    return res.status(200).json({
      requests: result.requests.map(serializeAdminBookRequestSummary),
      pagination: result.pagination,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAdminBookRequestController = async (req, res) => {
  try {
    const request = await loadAdminRequest(getValidated(req, "params").id);
    if (!request) {
      return res.status(404).json({ message: "Book request not found" });
    }
    return res.status(200).json({ request });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const assignAdminBookRequestController = async (req, res) => {
  const requestId = getValidated(req, "params").id;
  try {
    await assignBookRequestAdmin({
      requestId,
      assignedAdminId: getValidated(req, "body").assignedAdminId,
    });
    return res.status(200).json({ request: await loadAdminRequest(requestId) });
  } catch (error) {
    return workflowErrorResponse(res, error);
  }
};

export const updateAdminBookRequestStatusController = async (req, res) => {
  const requestId = getValidated(req, "params").id;
  const body = getValidated(req, "body");
  try {
    await changeBookRequestStatus({
      requestId,
      adminId: req.user.id,
      statusType: body.statusType,
      status: body.status,
      note: body.note,
    });
    return res.status(200).json({ request: await loadAdminRequest(requestId) });
  } catch (error) {
    return workflowErrorResponse(res, error);
  }
};

export const prepareAdminBookRequestQuoteController = async (req, res) => {
  const requestId = getValidated(req, "params").id;
  try {
    await prepareBookRequestQuote({
      requestId,
      adminId: req.user.id,
      quote: getValidated(req, "body"),
    });
    return res.status(200).json({ request: await loadAdminRequest(requestId) });
  } catch (error) {
    return workflowErrorResponse(res, error);
  }
};

export const updateAdminBookRequestNotesController = async (req, res) => {
  const requestId = getValidated(req, "params").id;
  try {
    await changeBookRequestNotes({
      requestId,
      notes: getValidated(req, "body"),
    });
    return res.status(200).json({ request: await loadAdminRequest(requestId) });
  } catch (error) {
    return workflowErrorResponse(res, error);
  }
};

export const recordAdminBookRequestContactController = async (req, res) => {
  const requestId = getValidated(req, "params").id;
  try {
    await recordBookRequestContact({
      requestId,
      adminId: req.user.id,
      contact: getValidated(req, "body"),
    });
    return res.status(201).json({ request: await loadAdminRequest(requestId) });
  } catch (error) {
    return workflowErrorResponse(res, error);
  }
};
