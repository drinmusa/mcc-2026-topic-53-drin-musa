import express, { Application } from 'express';
import cors from 'cors';
import { routes } from './routes';
import { AppErrorHandlerMiddleware } from './middleware/AppErrorHandler.middleware';
import { knexConfig } from './config/knex';
import Knex from 'knex';
import { Model } from 'objection';
// Creates knex instance
const knex = Knex(knexConfig);
Model.knex(knex);

export const app: Application = express();
app.use(
    cors({
        origin: '*', // Change this to your specific frontend URL in production (e.g., 'https://myfrontend.com')
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
        optionsSuccessStatus: 204 // Provides backward compatibility for older browsers (like IE11)
    })
);
app.use(express.json({ limit: '50mb' }));
routes(app);
app.use(AppErrorHandlerMiddleware);
