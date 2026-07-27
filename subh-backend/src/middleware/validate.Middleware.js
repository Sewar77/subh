export const getValidated = (req, target) =>
  req.validated?.[target] ?? req[target];

export const validate = (schema, target = "body") => {
  return (req, res, next) => {
    const { error, value } = schema.validate(getValidated(req, target), {
      abortEarly: false,
      allowUnknown: false,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        errors: error.details.map((err) => ({
          field: err.path[0],
          message: err.message,
        })),
      });
    }

    req.validated = {
      ...(req.validated || {}),
      [target]: value,
    };
    return next();
  };
};
