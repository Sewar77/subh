export const createRateLimiter = ({ windowMs, max, message }) => {
  const clients = new Map();

  return function rateLimit(req, res, next) {
    const now = Date.now();
    const key = req.ip || req.socket?.remoteAddress || "unknown";
    const current = clients.get(key);
    const entry = !current || current.resetAt <= now
      ? { count: 0, resetAt: now + windowMs }
      : current;

    entry.count += 1;
    clients.set(key, entry);

    if (clients.size > 10_000) {
      for (const [clientKey, value] of clients) {
        if (value.resetAt <= now) clients.delete(clientKey);
      }
    }

    res.set("RateLimit-Limit", String(max));
    res.set("RateLimit-Remaining", String(Math.max(0, max - entry.count)));
    res.set("RateLimit-Reset", String(Math.ceil(entry.resetAt / 1000)));

    if (entry.count > max) {
      res.set("Retry-After", String(Math.ceil((entry.resetAt - now) / 1000)));
      return res.status(429).json({ message });
    }

    return next();
  };
};

export const authRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many authentication attempts. Please try again later.",
});

export const uploadRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: "Too many upload attempts. Please try again later.",
});
