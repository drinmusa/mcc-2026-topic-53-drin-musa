import { RoleEnums } from './../src/interfaces/enums/Role.enum';
import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex('users').del();

    // Inserts seed entries
    await knex('users').insert([
        {
            email: 'user@gmail.com',
            password: '$2a$10$eumDnzT6ZjIjpBTIDH0jfeed2PaInigjJR2o8/1rt6tAsbqIrzxTa' //12345678
        }
    ]);
}
