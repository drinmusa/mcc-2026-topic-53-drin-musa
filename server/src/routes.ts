import { Application } from 'express';

import { PingController } from './controllers/Ping.controller';
import { authRouter } from './routes/auth';
import { uploadRouter } from './routes/upload';

export const routes = (app: Application): void => {
    app.use('/api/v1/ping', PingController);
    app.use('/api/auth', authRouter);
    app.use('/api/uploads', uploadRouter);
};
