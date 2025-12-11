import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import RateLimitMongo from "rate-limit-mongo";
import { configDotenv } from "dotenv";
configDotenv();

const mongoUrl = process.env.DATABASE_URL;

const defaultHandler = (req, res) => {
  res.status(429).json({
    status: "error",
    message: "Monthly request limit reached. Upgrade your plan.",
  });
};

// ✅ Key generator: user > IP
const keyGenerator = (req) => {
  if (req.user?._id) return req.user._id.toString();
  return ipKeyGenerator(req);
};

const ONE_MONTH = 30 * 24 * 60 * 60 * 1000;

// ✅ Correct Mongo Limiter Factory
const createMongoLimiter = (maxRequests) =>
  rateLimit({
    store: new RateLimitMongo({
      uri: mongoUrl,
      collectionName: "rateLimits",
      expireTimeMs: ONE_MONTH,
      errorHandler: console.error.bind(null, "rate-limit-mongo"),
      resetExpireDateOnChange: true,
    }),
    windowMs: ONE_MONTH,
    max: maxRequests,
    keyGenerator,
    handler: defaultHandler,
    standardHeaders: true,
    legacyHeaders: false,
  });

// ✅ Plan-based limiters
export const freeLimiter = createMongoLimiter(40);   // 40 / month
export const basicLimiter = createMongoLimiter(700); // 700 / month
export const proLimiter = createMongoLimiter(1000);   // 1000 / month

// ✅ Login limiter
export const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => req.body?.email || ipKeyGenerator(req),
  handler: (req, res) => {
    res.status(429).json({
      status: "error",
      message: "Too many login attempts. Try again in 10 minutes.",
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ✅ Register limiter
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => req.body?.email || ipKeyGenerator(req),
  handler: (req, res) => {
    res.status(429).json({
      status: "error",
      message: "Too many registration attempts. Try again after 1 hour.",
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ✅ Apply limiter by plan
export const rateLimitByPlan = (req, res, next) => {
  const plan = req.user?.planType || "FREE";

  if (plan === "PRO") return proLimiter(req, res, next);
  if (plan === "BASIC") return basicLimiter(req, res, next);

  return freeLimiter(req, res, next);
};
