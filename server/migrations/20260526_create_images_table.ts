import { Knex } from 'knex';

export async function up(knex: Knex) {
    await knex.schema.createTable('images', (table) => {
        table.increments('id').primary();

        // relation to users table
        table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE').notNullable();

        // imagekit
        table.text('imagekit_file_id').notNullable();

        // file info
        table.text('file_name').notNullable();
        table.text('mime_type').notNullable();

        // urls
        table.text('original_url').notNullable();
        table.text('thumbnail_url').notNullable();

        // upload state
        table.enu('status', ['pending', 'uploading', 'uploaded', 'failed']).defaultTo('uploaded').notNullable();

        // optional metadata
        table.jsonb('metadata').nullable();

        // timestamps
        table.timestamp('uploaded_at').defaultTo(knex.fn.now());

        table.timestamp('created_at').defaultTo(knex.fn.now());

        table.timestamp('updated_at').defaultTo(knex.fn.now());

        // indexes
        table.index(['user_id']);
        table.index(['status']);
    });
}

export async function down(knex: Knex) {
    await knex.schema.dropTableIfExists('images');
}
