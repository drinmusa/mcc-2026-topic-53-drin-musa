import { Model } from 'objection';
export default class UserDBModel extends Model {
    id!: number;
    email!: string;
    password!: string;

    created_at?: string;
    updated_at?: string;

    static tableName = 'users';

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['email', 'password'],

            properties: {
                id: { type: 'integer' },
                email: { type: 'string' },
                password: { type: 'string' },
                created_at: { type: 'string' },
                updated_at: { type: 'string' }
            }
        };
    }
}
