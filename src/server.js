import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { crawlWebsite } from "./crawler/crawlWebsite.js";
import { chunkText } from "./utils/chunkText.js";
import { embedText } from "./embeddings/embedtext.js";
import { storeEmbedding } from "./vector/vectorStore.js";
import { answerQuestion } from "./rag/answerQuestion.js";
console.log(
  "OPENAI_API_KEY:",
  process.env.OPENAI_API_KEY ? "LOADED" : "MISSING",
);
const app = express();
app.use(express.json());

app.post("/ingest", async (req, res) => {
  const { url, maxPages = 10 } = req.body;

  const pages = await crawlWebsite(url, maxPages);

  for (const page of pages) {
    const chunks = chunkText(page.text); // ✅ now defined

    for (const chunk of chunks) {
      const embedding = await embedText(chunk);

      await storeEmbedding({
        content: chunk,
        url: page.url,
        title: page.title,
        embedding,
      });
    }
  }

  res.json({
    message: "Website indexed successfully",
    pagesIndexed: pages.length,
  });
});

// Ask Question
app.post("/ask", async (req, res) => {
  const { question } = req.body;
  const answer = await answerQuestion(question);
  res.json({ answer });
});

app.listen(3000, () => console.log("🚀 Q&A Support Bot running on port 3000"));
