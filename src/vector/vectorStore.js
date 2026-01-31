import pkg from "pg";
const { Pool } = pkg;

/**
 * Single shared connection pool (IMPORTANT)
 */
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 10, // max connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

/**
 * Store document chunk + embedding
 */
export async function storeEmbedding({
  content,
  url = null,
  title = null,
  embedding,
}) {
  const query = `
    INSERT INTO documents (content, url, title, embedding)
    VALUES ($1, $2, $3, $4)
  `;

  await pool.query(query, [content, url, title, embedding]);
}

/**
 * Similarity search using pgvector
 */
export async function similaritySearch(queryEmbedding, limit = 3) {
  const query = `
    SELECT content, url, title
    FROM documents
    ORDER BY embedding <-> $1
    LIMIT $2
  `;

  const result = await pool.query(query, [queryEmbedding, limit]);

  return result.rows;
}

/**
 * Optional: Health check (useful for prod)
 */
export async function checkDbConnection() {
  const result = await pool.query("SELECT 1");
  return result.rowCount === 1;
}
