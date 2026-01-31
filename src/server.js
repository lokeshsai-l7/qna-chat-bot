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

  try {
    const pages = await crawlWebsite(url, maxPages);
    console.log("CRAWLED PAGES:", pages.length);

    const CONCURRENCY_LIMIT = 5;
    const chunksQueue = [];

    for (const page of pages) {
      const chunks = chunkText(page.text, 300);
      for (const chunk of chunks) {
        chunksQueue.push({
          content: chunk,
          url: page.url,
          title: page.title,
        });
      }
    }

    console.log("TOTAL CHUNKS TO PROCESS:", chunksQueue.length);

    async function processChunkQueue(queue, limit) {
      let index = 0;

      async function worker() {
        while (index < queue.length) {
          const currentIndex = index++;
          const { content, url, title } = queue[currentIndex];

          try {
            const embedding = await embedText(content);
            await storeEmbedding({ content, url, title, embedding });
          } catch (err) {
            console.error(
              `❌ Failed to process chunk for ${url}:`,
              err.message,
            );
          }
        }
      }

      const workers = Array.from({ length: limit }, () => worker());
      await Promise.all(workers);
    }

    await processChunkQueue(chunksQueue, CONCURRENCY_LIMIT);

    res.json({
      message: "Website indexed successfully",
      pagesIndexed: pages.length,
      chunksProcessed: chunksQueue.length,
    });
  } catch (err) {
    console.error("❌ Ingestion failed:", err);
    res.status(500).json({ error: "Ingestion failed" });
  }
});

app.post("/ask", async (req, res) => {
  const { question } = req.body;
  const answer = await answerQuestion(question);
  res.json({ answer });
});

app.listen(3000, () => console.log("🚀 Q&A Support Bot running on port 3000"));
