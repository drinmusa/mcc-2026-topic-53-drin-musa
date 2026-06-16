import { Knex } from 'knex';

export async function up(knex: Knex) {
    await knex.schema.createTable('users', (table) => {
        table.increments('id').primary();

        table.string('email', 255).notNullable().unique();

        table.text('password').notNullable();

        table.timestamp('created_at').defaultTo(knex.fn.now());

        table.timestamp('updated_at').defaultTo(knex.fn.now());

        // indexes
        table.index(['email']);
    });
}

export async function down(knex: Knex) {
    await knex.schema.dropTableIfExists('users');
}
