/**
 * Database Initialization Script
 * Run this with: npx tsx scripts/init-db.ts
 */
import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';

async function initDatabase() {
    console.log('🔄 Initializing database...\n');

    // Check for DATABASE_URL
    if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL environment variable is not set');
        console.log('   Please add it to your .env.local file');
        process.exit(1);
    }

    const sql = neon(process.env.DATABASE_URL);

    try {
        // Read SQL file
        const sqlFilePath = path.join(__dirname, 'init-db.sql');
        let sqlContent = fs.readFileSync(sqlFilePath, 'utf-8');

        // Execute the entire SQL content as one single execution
        // Neon's unsafe method can handle multiple statements and procedural blocks
        await sql.unsafe(sqlContent);

        console.log('✅ Database schema initialized successfully!');
        console.log('\n📊 Tables created/updated:');
        console.log('   - urls (for storing short links)');
        console.log('   - clicks (for analytics tracking)');
        console.log('\n🚀 You can now start the application!');

    } catch (error) {
        console.error('❌ Error initializing database:', error);
        process.exit(1);
    }
}

initDatabase();
