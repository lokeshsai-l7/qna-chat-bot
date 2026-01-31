export function chunkText(text, chunkSize = 500) {
  if (typeof text !== "string" || text.trim().length === 0) {
    return [];
  }

  const words = text.split(/\s+/);
  const chunks = [];

  for (let i = 0; i < words.length; i += chunkSize) {
    chunks.push(words.slice(i, i + chunkSize).join(" "));
  }

  return chunks;
}
