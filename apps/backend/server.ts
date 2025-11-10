import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import ngrok from '@ngrok/ngrok';
// import { api } from '@cl/convex-iso';

import { fileURLToPath } from 'url';
import path from 'path';

dotenv.config({ path: '.env.local' });
// const client = getConvexClient();
/**
 * Creates and configures the server for the Roommates backend application.
 * This server handles various API endpoints
 * @returns The configured Express server instance.
 */

export async function createServer() {
  const node = express();
  node.use(cors());

  node.use(bodyParser.json({ limit: '30mb' }));
  node.use(bodyParser.urlencoded({ limit: '30mb', extended: true }));

  node.get('/rms/pre-alp/test', async (req, res): Promise<any> => {});

  const PORT = process.env.PORT || 8091;
  node.listen(PORT, () => {
    console.log('\x1b[32m\x1b[1mBackend listening on port %d!🚀\x1b[0m', PORT);
  });

  return node;
}

createServer().catch((error) => {
  console.error('Failed to start server:', error);
});
