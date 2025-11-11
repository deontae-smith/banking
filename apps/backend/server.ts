import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import ngrok from '@ngrok/ngrok';
import { ConvexHttpClient } from 'convex/browser';
import { api } from './convex/_generated/api'; // adjust path if needed
import { setTunnelUrl } from './libs/autoGenTunnelUrl';

dotenv.config({ path: '.env.local' });

const convex = new ConvexHttpClient(process.env.CONVEX_URL!);

export async function createServer() {
  const node = express();
  node.use(cors());
  node.use(bodyParser.json({ limit: '30mb' }));
  node.use(bodyParser.urlencoded({ limit: '30mb', extended: true }));

  node.post('/api/auth/convex-login', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) return res.status(401).json({ error: 'No token' });

      const token = authHeader.split(' ')[1];

      // 1) Verify token with Clerk
      const clerkRes = await fetch('https://api.clerk.com/v1/sessions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const clerkData = await clerkRes.json();
      if (!clerkData.user_id) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      const userId = clerkData.user_id;

      // 2) Query Convex for existing user by clerk_id
      const existingUser = await convex.query(api.user.getUserByClerkId, {
        clerkId: userId,
      });

      if (!existingUser) {
        // 3) Create the user (and optionally account/card chain if you implement it)
        const newUser = await convex.mutation(
          api.user.createUserWithAccountAndCard,
          {
            clerkId: userId,
            email: clerkData.email_addresses[0].email_address,
            name: {
              firstName: clerkData.first_name,
              lastName: clerkData.last_name,
            },
            address: {
              line1: '',
              city: '',
              state: '',
              zipCode: '',
              country: '',
            },
            // account field optional per schema
          }
        );
        return res.json({ message: 'User created', user: newUser });
      }

      // 4) Return existing record
      return res.json({ message: 'User exists', user: existingUser });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Server error' });
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
