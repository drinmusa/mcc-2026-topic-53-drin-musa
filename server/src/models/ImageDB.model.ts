import { Model } from 'objection';
import UserDBModel from './UserDB.model';

export default class ImageDBModel extends Model {
    id!: number;

    user_id!: number;

    original_url!: string;
    thumbnail_url!: string;

    imagekit_file_id!: string;

    file_name?: string;
    mime_type?: string;

    width?: number;
    height?: number;

    size?: number;

    description?: string;

    is_synced?: boolean;

    created_at?: string;
    updated_at?: string;
    status?: string;

    metadata?: {
        width?: number;
        height?: number;
    };
    static tableName = 'images';

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['user_id', 'original_url', 'thumbnail_url', 'imagekit_file_id'],

            properties: {
                id: { type: 'integer' },

                user_id: { type: 'integer' },

                original_url: { type: 'string' },
                thumbnail_url: { type: 'string' },

                imagekit_file_id: { type: 'string' },

                file_name: { type: 'string' },
                mime_type: { type: 'string' },

                width: { type: 'integer' },
                height: { type: 'integer' },

                size: { type: 'integer' },

                description: {
                    type: 'string',
                    maxLength: 500
                },

                is_synced: { type: 'boolean' },

                created_at: { type: 'string' },
                updated_at: { type: 'string' }
            }
        };
    }

    static get relationMappings() {
        return {
            user: {
                relation: Model.BelongsToOneRelation,
                modelClass: UserDBModel,
                join: {
                    from: 'images.user_id',
                    to: 'users.id'
                }
            }
        };
    }
}
