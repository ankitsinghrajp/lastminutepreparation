export async function safeInngestSend(promise, rollback) {
  try {
    return await promise;
  } catch (err) {
    if (rollback) {
      try {
        await rollback();
      } catch (e) {
        console.error("Rollback failed:", e.message);
      }
    }
    throw err;
  }
}
