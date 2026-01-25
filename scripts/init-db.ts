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
        const sqlFile = path.join(__dirname, 'init-db.sql');
        const sqlContent = fs.readFileSync(sqlFile, 'utf-8');

        // Split by semicolons and execute each statement
        const statements = sqlContent
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        for (const statement of statements) {
            await sql.unsafe(statement);
        }

        console.log('✅ Database schema initialized successfully!');
        console.log('\n📊 Tables created:');
        console.log('   - urls (for storing short links)');
        console.log('   - clicks (for analytics tracking)');
        console.log('\n🚀 You can now start the application!');

    } catch (error) {
        console.error('❌ Error initializing database:', error);
        process.exit(1);
    }
}

initDatabase();
