// middlewares/premiumOnly.js

export const premiumOnly = (req, res, next) => {
  if (!req.user || req.user.planType === "FREE") {
    res.status(429).json({
    status: "error",
    message: "This is the premium feature only. Upgrade to premium",
  });
  }
  next();
};
