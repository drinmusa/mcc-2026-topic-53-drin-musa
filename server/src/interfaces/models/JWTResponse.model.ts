export interface JWTResponse {
    'https://hasura.io/jwt/claims': {
        'x-hasura-allowed-roles': ['user'];
        'x-hasura-default-role': 'user';
        'x-hasura-user-id': number;
    };
    iat: number;
    exp: number;
}
