import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function fix() {
    if (!process.env.DATABASE_URL) {
        console.error('DATABASE_URL missing');
        return;
    }
    const sql = neon(process.env.DATABASE_URL);
    
    console.log('Attempting to add missing columns directly...');
    
    try {
        await sql`ALTER TABLE urls ADD COLUMN creator_wallet VARCHAR(42)`;
        console.log('Added creator_wallet');
    } catch (e: any) {
        console.log('creator_wallet might already exist or error:', e.message);
    }

    try {
        await sql`ALTER TABLE urls ADD COLUMN access_policy JSONB`;
        console.log('Added access_policy');
    } catch (e: any) {
        console.log('access_policy might already exist or error:', e.message);
    }
}

fix();
