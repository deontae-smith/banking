import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import ngrok from '@ngrok/ngrok';
import { ConvexClient } from 'convex/browser';
import { api } from './convex/_generated/api'; // path to generated API functions
import { setTunnelUrl } from './libs/autoGenTunnelUrl';
import { createClerkClient, verifyToken } from '@clerk/backend';

dotenv.config({ path: '.env.local' });

const convex = new ConvexClient(process.env.CONVEX_URL!);
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY!,
});

export async function createServer() {
  const app = express();
  app.use(cors());
  app.use(bodyParser.json({ limit: '30mb' }));
  app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }));

  // Auth route
  app.post('/api/auth/convex-login', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
      }
      const token = authHeader.split(' ')[1];
      if (!token) throw new Error('No token found in header');

      const tokenPayload = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY!,
      });
      const userId = tokenPayload.sub;

      const user = await clerkClient.users.getUser(userId);

      const existingUser = await convex.query(api.user.getUserByClerkId, {
        clerkId: userId,
      });

      if (!existingUser) {
        const newUser = await convex.mutation(
          api.user.createUserWithAccountAndCard,
          {
            clerkId: userId,
            // @ts-ignore
            email: user.emailAddresses[0].emailAddress,
            name: {
              firstName: user.firstName || '',
              lastName: user.lastName || '',
            },
            address: {
              line1: '',
              city: '',
              state: '',
              zipCode: '',
              country: '',
            },
          }
        );
        return res.json({ message: 'User created', user: newUser });
      }

      return res.json({ message: 'User exists', user: existingUser });
    } catch (err: any) {
      console.error('❌ Clerk verification or Convex error:', err);
      return res
        .status(500)
        .json({ error: 'Server error', details: err.message });
    }
  });

  app.get('/api/account/subscribe/:clerkId', async (req, res) => {
    const { clerkId } = req.params;

    res.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    res.flushHeaders();

    const send = (data: any) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    try {
      const user = await convex.query(api.user.getUserByClerkId, { clerkId });
      if (!user?.account) {
        send({ error: 'No account found for user' });
        return res.end();
      }

      const accountId = user.account;
      // subscribe to updates
      const unsubscribe = convex.onUpdate(
        api.account.getAccountById,
        { accountId },
        (updatedAccount) => {
          send({ account: updatedAccount });
        },
        (err) => {
          // error handler
          console.error('Convex onUpdate error:', err);
          send({ error: 'Subscription error' });
        }
      );

      // Clean up when client disconnects
      req.on('close', () => {
        unsubscribe();
      });
    } catch (err) {
      console.error('SSE error:', err);
      send({ error: 'Internal server error' });
      res.end();
    }
  });

  app.get('/api/account/card/:cardId', async (req, res) => {
    try {
      const { cardId } = req.params;
      if (!cardId)
        return res.status(400).json({ error: 'No card ID provided' });

      // @ts-ignore
      const card = await convex.query(api.card.getCardById, { id: cardId });
      if (!card) return res.status(404).json({ error: 'Card not found' });

      return res.json({ card });
    } catch (err: any) {
      console.error('❌ Fetch card error:', err);
      return res
        .status(500)
        .json({ error: 'Server error', details: err.message });
    }
  });

  const PORT = process.env.PORT || 8090;
  app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

  return app;
}

createServer().catch((e) => {
  console.error('❌ Backend Failed to Start', e);
  process.exit(1);
});

(async () => {
  try {
    const listener = await ngrok.connect({
      addr: process.env.PORT || 8090,
      authtoken_from_env: true,
    });
    const url = listener.url();
    if (!url)
      throw new Error('❌ Backend Failed: No Public Url for ngrok tunnel!');
    await setTunnelUrl(url);
    console.log(`✅ Backend Started at ${url}`);
  } catch (err) {
    console.log(err);
    throw new Error('❌ Backend Failed: Check Tunnels');
  }
})();
