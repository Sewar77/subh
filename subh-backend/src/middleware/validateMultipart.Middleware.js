import { cleanupUploadedFile } from "./uploadImage.Middleware.js";

export const validateMultipartBody = (schema) => {
  return async function multipartBodyValidation(req, res, next) {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: false,
    });

    if (error) {
      await cleanupUploadedFile(req.file);
      req.file = undefined;
      return res.status(400).json({
        success: false,
        errors: error.details.map((detail) => ({
          field: detail.path[0],
          message: detail.message,
        })),
      });
    }

    req.validated = {
      ...(req.validated || {}),
      body: value,
    };
    return next();
  };
};
