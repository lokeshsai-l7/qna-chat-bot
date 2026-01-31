import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 1,
  idleTimeoutMillis: 0,
  connectionTimeoutMillis: 10_000,
});

export async function storeEmbedding({ content, url, title, embedding }) {
  if (!Array.isArray(embedding) || typeof embedding[0] !== "number") {
    throw new Error("Invalid embedding format. Expected number[]");
  }

  const client = await pool.connect();
  try {
    const vectorString = `[${embedding.join(",")}]`;
    await client.query(
      `
      INSERT INTO documents (content, url, title, embedding)
      VALUES ($1, $2, $3, $4::vector)
      `,
      [content, url, title, vectorString],
    );
    console.log(`✅ Stored embedding for: ${url}`);
  } finally {
    client.release();
  }
}

export async function similaritySearch(queryEmbedding, limit = 3) {
  if (!Array.isArray(queryEmbedding) || typeof queryEmbedding[0] !== "number") {
    throw new Error("Invalid query embedding format. Expected number[]");
  }

  const client = await pool.connect();
  try {
    const vectorString = `[${queryEmbedding.join(",")}]`;
    const { rows } = await client.query(
      `
      SELECT content, url, title
      FROM documents
      ORDER BY embedding <-> $1::vector
      LIMIT $2
      `,
      [vectorString, limit],
    );

    return rows;
  } finally {
    client.release();
  }
}
