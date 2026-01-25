/**
 * Neon PostgreSQL Database Connection
 * Uses @neondatabase/serverless for Edge Runtime compatibility
 */
import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
}

export const sql = neon(process.env.DATABASE_URL);

/**
 * Example usage:
 * 
 * import { sql } from '@/lib/db';
 * 
 * // Query with parameterized values (safe from SQL injection)
 * const urls = await sql`SELECT * FROM urls WHERE short_code = ${shortCode}`;
 * 
 * // Insert with returning
 * const [newUrl] = await sql`
 *   INSERT INTO urls (short_code, original_url)
 *   VALUES (${shortCode}, ${originalUrl})
 *   RETURNING *
 * `;
 */
