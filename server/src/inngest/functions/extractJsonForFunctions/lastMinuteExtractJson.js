export const lastMinuteExtractJson = (text) => {
  if (!text || typeof text !== "string") return null;

  // Remove markdown fences safely
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  // Find first valid JSON object using balance tracking
  let start = -1;
  let depth = 0;

  for (let i = 0; i < cleaned.length; i++) {
    if (cleaned[i] === "{") {
      if (depth === 0) start = i;
      depth++;
    } else if (cleaned[i] === "}") {
      depth--;
      if (depth === 0 && start !== -1) {
        const candidate = cleaned.slice(start, i + 1);

        try {
          return JSON.parse(candidate);
        } catch {
          // continue searching
        }
      }
    }
  }

  return null; // ❗ never throw
};

