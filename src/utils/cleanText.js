export function cleanText(text) {
  return text
    .replace(/\s+/g, " ")
    .replace(/[^a-zA-Z0-9.,?! ]/g, "")
    .trim();
}
