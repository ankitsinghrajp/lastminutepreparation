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

// FIXED KEY GENERATOR (uses ipKeyGenerator safely)
const keyGenerator = (req) => {
  // If user is logged in → limit by user ID
  if (req.user?._id) return req.user._id.toString();

  // Else → safe IPv6 handling
  return ipKeyGenerator(req);
};

const ONE_MONTH = 30 * 24 * 60 * 60 * 1000;

const createMongoLimiter = (maxRequests) =>
  rateLimit({
    store: new RateLimitMongo({
      uri: mongoUrl,
      collectionName: "rateLimits",
      expireTimeMs: ONE_MONTH,
      errorHandler: console.error.bind(null, "rate-limit-mongo"),
      resetExpireDateOnChange: true,
      points: maxRequests,
    }),
    windowMs: ONE_MONTH,
    max: maxRequests,
    keyGenerator,
    handler: defaultHandler,
    standardHeaders: true,
    legacyHeaders: false,
  });

export const freeLimiter = createMongoLimiter(20);
export const basicLimiter = createMongoLimiter(500);
export const proLimiter = createMongoLimiter(800);

// LOGIN LIMITER 
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
});

// REGISTER LIMITER

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 5, // max 5 registrations per window per IP/email
  keyGenerator: (req) => req.body?.email || ipKeyGenerator(req), // limit by email if provided, else by IP
  handler: (req, res) => {
    res.status(429).json({
      status: "error",
      message: "Too many registration attempts. Try again after 1 hour.",
    });
  },
  standardHeaders: true, // sends RateLimit-* headers
  legacyHeaders: false,
});



// RATE LIMIT BY PLAN

export const rateLimitByPlan = (req, res, next) => {
  const plan = req.user?.planType || "FREE";

  if (plan === "PRO") return proLimiter(req, res, next);
  if (plan === "BASIC") return basicLimiter(req, res, next);

  return freeLimiter(req, res, next);
};
