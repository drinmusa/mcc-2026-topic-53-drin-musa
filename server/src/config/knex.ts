const connectionString = process.env.DATABASE_URL;
console.log('🚀 ~ knex.ts:2 ~ connectionString:', connectionString);

export const knexConfig = {
    client: 'pg',
    connection: connectionString,
    pool: {
        min: 0,
        max: 95
    }
};
