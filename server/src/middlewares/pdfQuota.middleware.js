export const pdfUploadQuotaCheck = async (req, res, next) => {
  try {
    const user = req.user; // must come from auth middleware

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required",
      });
    }

    const now = new Date();
    const resetAt = new Date(user.pdfUploadResetAt);
    const ONE_MONTH = 30 * 24 * 60 * 60 * 1000;

    // ✅ AUTO RESET LOGIC
    if (now - resetAt >= ONE_MONTH) {
      user.pdfUploadsThisMonth = 0;
      user.pdfUploadResetAt = now;
      await user.save();
    }

    // ✅ PLAN LIMITS
    let maxUploads = 0;

    if (user.planType === "BASIC") maxUploads = 20;
    if (user.planType === "PRO") maxUploads = 100;

    // ✅ FREE USERS BLOCKED
    if (user.planType === "FREE" || !maxUploads) {
      return res.status(403).json({
        status: "error",
        message: "Only premium users can upload PDFs. Please upgrade.",
      });
    }

    // ✅ LIMIT CHECK
    if (user.pdfUploadsThisMonth >= maxUploads) {
      return res.status(403).json({
        status: "error",
        message: `Your ${user.planType} plan PDF upload limit is exhausted for this month.`,
      });
    }

    // ✅ PASS TO NEXT
    next();
  } catch (error) {
    console.error("PDF quota middleware error:", error);
    return res.status(500).json({
      status: "error",
      message: "PDF quota check failed",
    });
  }
};
