// Import ENV
import * as dotenv from 'dotenv';

// Env Configuration
dotenv.config();
import knex from 'knex';
import { knexConfig } from './src/config/knex';
// Initialize Knex with the production config (Neon PostgreSQL)
const db = knex(knexConfig);

async function runMigrations() {
    try {
        console.log('Running migrations...');
        await db.migrate.latest();
        console.log('Migrations completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await db.destroy(); // Close the connection
    }
}

runMigrations();
