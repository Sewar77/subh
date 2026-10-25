const DEFAULT_DEVELOPMENT_ORIGIN = "https://subh-hazel.vercel.app" || "http://localhost:5173";
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

const normalizeOrigin = (value) => {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
};

export const getAllowedOrigins = (environment = process.env) => {
  const configured =
    environment.CORS_ORIGINS || environment.FRONTEND_ORIGIN || "";
  const origins = configured
    .split(",")
    .map((origin) => normalizeOrigin(origin.trim()))
    .filter(Boolean);

  if (origins.length > 0) return [...new Set(origins)];
  return environment.NODE_ENV === "production"
    ? []
    : [DEFAULT_DEVELOPMENT_ORIGIN];
};

export const assertProductionSecurityConfig = (environment = process.env) => {
  if (environment.NODE_ENV !== "production") return true;
  if (!environment.JWT_SECRET || environment.JWT_SECRET.length < 32) {
    throw new Error(
      "Production JWT_SECRET must contain at least 32 characters",
    );
  }
  if (getAllowedOrigins(environment).length === 0) {
    throw new Error("Production CORS_ORIGINS or FRONTEND_ORIGIN is required");
  }
  return true;
};

export const createCorsOptions = (environment = process.env) => {
  const allowedOrigins = new Set(getAllowedOrigins(environment));

  return {
    credentials: true,
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Accept"],
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(normalizeOrigin(origin))) {
        return callback(null, true);
      }
      return callback(new Error("Origin is not allowed by CORS"));
    },
  };
};

export const requireTrustedMutationOrigin = (environment = process.env) => {
  const allowedOrigins = new Set(getAllowedOrigins(environment));
  const isProduction = environment.NODE_ENV === "production";

  return (req, res, next) => {
    if (SAFE_METHODS.has(req.method)) return next();

    const origin = normalizeOrigin(req.get("origin") || "");

    if (origin && !allowedOrigins.has(origin)) {
      return res.status(403).json({
        message: "Untrusted request origin",
      });
    }

    if (isProduction && req.cookies?.token && !origin) {
      return res.status(403).json({
        message: "Request origin is required",
      });
    }

    return next();
  };
};
