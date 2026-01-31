import OpenAI from "openai";
import { embedText } from "../embeddings/embedtext.js";
import { similaritySearch } from "../vector/vectorStore.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function answerQuestion(question) {
  // Embed the question
  const questionEmbedding = await embedText(question);

  // Retrieve relevant chunks
  const results = await similaritySearch(questionEmbedding, 3);

  const context = results.map((r) => r.content).join("\n");

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a support bot. Answer ONLY from the provided context. If the answer is not present, say 'I don’t know'.",
      },
      {
        role: "user",
        content: `Context:\n${context}\n\nQuestion:\n${question}`,
      },
    ],
  });

  return {
    answer: response.choices[0].message.content,
    sources: results.map((r) => r.url),
  };
}
