// Import ENV
import * as dotenv from 'dotenv';

// Env Configuration
dotenv.config();
import knex from 'knex';
import { knexConfig } from './src/config/knex';
const db = knex(knexConfig);

async function runSeeders() {
    try {
        console.log('Running seeders...');
        await db.seed.run();
        console.log('Seeders completed successfully.');
    } catch (error) {
        console.error('Seeding failed:', error);
    } finally {
        await db.destroy();
    }
}

runSeeders();
