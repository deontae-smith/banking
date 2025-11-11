import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import ngrok from '@ngrok/ngrok';
import { ConvexHttpClient } from 'convex/browser';
import { api } from './convex/_generated/api'; // adjust path if needed
import { setTunnelUrl } from './libs/autoGenTunnelUrl';
import { createClerkClient, verifyToken } from '@clerk/backend';

dotenv.config({ path: '.env.local' });

const convex = new ConvexHttpClient(process.env.CONVEX_URL!);

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY!,
});

export async function createServer() {
  const node = express();
  node.use(cors());
  node.use(bodyParser.json({ limit: '30mb' }));
  node.use(bodyParser.urlencoded({ limit: '30mb', extended: true }));

  node.post('/api/auth/convex-login', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const token = authHeader.split(' ')[1];
      if (!token) throw new Error('No token found in header');

      // ✅ Verify Clerk token
      const tokenPayload = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY!,
      });

      const userId = tokenPayload.sub;

      // ✅ Fetch full user info from Clerk
      const user = await clerkClient.users.getUser(userId);
      // @ts-ignore

      // ✅ Check existing user in Convex
      const existingUser = await convex.query(api.user.getUserByClerkId, {
        clerkId: userId,
      });

      if (!existingUser) {
        console.log('Creating new user in Convex...');
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

      console.log('User already exists in Convex');
      return res.json({ message: 'User exists', user: existingUser });
    } catch (err: any) {
      console.error('❌ Clerk verification or Convex error:', err);
      return res
        .status(500)
        .json({ error: 'Server error', details: err.message });
    }
  });

  const PORT = process.env.PORT;
  node.listen(PORT, () => console.log(`Waiting for tunnel...`));
  return node;
}

createServer().catch(() => {
  throw new Error('❌ Backend Failed to Start');
});

(async () => {
  try {
    const listener1 = await ngrok.connect({
      addr: 8090,
      authtoken_from_env: true,
    });
    const url = listener1.url();

    if (!url)
      throw new Error('❌ Backend Failed: No Public Url for ngrok tunnel!');

    await setTunnelUrl(url);
    console.log(`✅ Backend Started`);
  } catch (err) {
    console.log(err);
    throw new Error('❌ Backend Failed: Check Tunnels');
  }
})();
