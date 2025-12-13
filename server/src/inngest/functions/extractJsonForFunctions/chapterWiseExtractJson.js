export const chapterWiseExtractJson = (text) => {
  if (!text) throw new Error("Empty response received from AI.");

  text = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  // Extract only JSON object
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first === -1 || last === -1) throw new Error("No JSON found.");

  let jsonString = text.substring(first, last + 1);

  // ❌ REMOVE THIS (breaking newlines)
  // jsonString = jsonString.replace(/\\/g, "\\\\");

  // Keep only this to clean invisible control chars
  jsonString = jsonString.replace(/[\u0000-\u001F]+/g, " ");

  return JSON.parse(jsonString);
};