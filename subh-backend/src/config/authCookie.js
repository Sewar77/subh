export const AUTH_COOKIE_NAME = "token";
const AUTH_COOKIE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

const getSameSite = (environment) => {
  const configured = environment.COOKIE_SAME_SITE?.toLowerCase();
  return ["strict", "lax", "none"].includes(configured)
    ? configured
    : "lax";
};

export const getAuthCookieOptions = (
  { clear = false } = {},
  environment = process.env,
) => {
  const sameSite = getSameSite(environment);
  const secure = environment.NODE_ENV === "production" || sameSite === "none";

  return {
    httpOnly: true,
    path: "/",
    sameSite,
    secure,
    ...(environment.COOKIE_DOMAIN
      ? { domain: environment.COOKIE_DOMAIN }
      : {}),
    ...(clear
      ? { expires: new Date(0) }
      : { maxAge: AUTH_COOKIE_MAX_AGE_MS }),
  };
};
