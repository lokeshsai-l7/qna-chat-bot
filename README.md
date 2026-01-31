# Q&A Support Bot with Web Crawling and Vector Search

A full-stack Node.js project that allows you to **crawl websites**, generate **OpenAI embeddings** of content, store them in **PostgreSQL with pgvector**, and answer questions using **retrieved context**.

This project combines **web scraping**, **embedding-based semantic search**, and **OpenAI GPT-4o-mini** to provide context-aware answers.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Running the Project](#running-the-project)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Notes](#notes)

---

## Project Overview

Many websites contain valuable information that users may want to query. This project allows you to:

1. **Crawl** a website and extract text from paragraphs, headings, and lists.
2. **Chunk and clean** the text for embeddings.
3. **Generate embeddings** using OpenAI's `text-embedding-3-small`.
4. **Store embeddings** in PostgreSQL using `pgvector` for fast similarity search.
5. **Answer questions** using GPT-4o-mini by retrieving the most relevant chunks.

---

## Features

- Web crawler with internal link discovery.
- Text cleaning and chunking.
- OpenAI embeddings for semantic search.
- PostgreSQL + pgvector for storing and querying embeddings.
- REST API endpoints for ingestion (`/ingest`) and querying (`/ask`).

---

## Tech Stack

- **Backend:** Node.js + Express.js
- **Database:** PostgreSQL (Neon compatible) + `pgvector`
- **OpenAI API:** `text-embedding-3-small` for embeddings, `gpt-4o-mini` for question answering
- **Web Scraping:** Axios + Cheerio
- **Utilities:** dotenv for environment variables

---

## Project Structure

```
qna-chat-bot/
│
├─ src/
│ ├─ server.js
│ ├─ crawler/
│ │ └─ crawlWebsite.js
│ ├─ embeddings/
│ │ └─ embedText.js
│ ├─ rag/
│ │ └─ answerQuestion.js
│ ├─ vector/
│ │ └─ vectorStore.js
│ └─ utils/
│ ├─ chunkText.js
│ └─ cleanText.js
│
├─ .env
├─ package.json
└─ README.md
```

---

## Setup & Installation

1. **Clone the repo:**

```bash
git clone https://github.com/yourusername/qna-chat-bot.git
cd qna-chat-bot
```

2. **Install dependencies:**

```
npm install
```

3. **Setup .env file:**

```Create .env in the root:
OPENAI_API_KEY=your_openai_api_key
DATABASE_URL=postgres://user:password@host:port/dbname
```

4. **Ensure your Postgres database has pgvector enabled and a table documents:**

```
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE documents (
id SERIAL PRIMARY KEY,
content TEXT,
url TEXT,
title TEXT,
embedding vector(1536) -- dimension matches text-embedding-3-small
);
```

5. **Running the Project**

```
node --env-file=.env src/server.js
```

6. **You should see:**

```
OPENAI_API_KEY: LOADED
🚀 Q&A Support Bot running on port 3000
```

## API Endpoints

1. **Ingest Website**

Crawl a website, generate embeddings, and store in the database.

```
POST /ingest
Content-Type: application/json

Body:

{
"url": "https://example.com",
"maxPages": 5
}

Response:

{
"message": "Website indexed successfully",
"pagesIndexed": 3,
"chunksProcessed": 10
}
```

2. **Ask a Question**

Retrieve relevant chunks and get answer from OpenAI.

```
POST /ask
Content-Type: application/json

Body:

{
"question": "What is this website about?"
}

Response:

{
"answer": "This website provides information about...",
"sources": [
"https://example.com/page1",
"https://example.com/page2"
]
}
```

## Testing

1. **Ingest a website first:**

```
curl -X POST http://localhost:3000/ingest \
-H "Content-Type: application/json" \
-d '{"url":"https://example.com","maxPages":1}'
```

2. **Ask a question:**

```
curl -X POST http://localhost:3000/ask \
-H "Content-Type: application/json" \
-d '{"question":"What is this website about?"}'
```

## Notes

Make sure embedding format is stored as comma-separated numbers in array , not JSON arrays.

For large websites, increase maxPages and chunk size carefully.

Ensure your PostgreSQL supports pgvector.

You can change chunkSize in chunkText.js for more granular embeddings.

Always handle errors — the crawler might fail on some pages.
