// Import ENV
import * as dotenv from 'dotenv';

// Env Configuration
dotenv.config();

// Other imports
import { app } from './app';
import { API_PORT } from './config/app';

// Start the Server
app.listen(5000, () => {
    console.log(`API is listening on port ${API_PORT}!`);
});
