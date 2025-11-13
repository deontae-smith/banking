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

if (!process.env.CONVEX_URL) {
  throw new Error('❌ Missing required environment variable: CONVEX_URL');
}

if (!process.env.CLERK_SECRET_KEY) {
  throw new Error('❌ Missing required environment variable: CLERK_SECRET_KEY');
}

if (!process.env.CLERK_PUBLISHABLE_KEY) {
  throw new Error(
    '❌ Missing required environment variable: CLERK_PUBLISHABLE_KEY'
  );
}

if (!process.env.NGROK_AUTHTOKEN) {
  throw new Error('❌ Missing required environment variable: NGROK_AUTHTOKEN');
}

if (!process.env.PORT) {
  throw new Error('❌ Please define PORT in your environment variables');
}

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
            number: user.phoneNumbers[0]
              ? // @ts-ignore
                user.phoneNumbers[0].phoneNumber.replace(/\D/g, '')
              : '',
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

  app.get('/api/account/stream-contacts/:clerkId', async (req, res) => {
    const { clerkId } = req.params;

    // Set up Server-Sent Events headers
    res.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    res.flushHeaders();

    const send = (data: any) => res.write(`data: ${JSON.stringify(data)}\n\n`);

    try {
      // 1️⃣ Get the initial user
      const user = await convex.query(api.user.getUserByClerkId, { clerkId });

      if (!user) {
        send({ error: 'User not found' });
        return res.end();
      }

      // Send initial contacts
      let lastContacts = user.metadata?.contacts ?? [];
      send({ contacts: lastContacts });

      // 2️⃣ Subscribe to user updates in Convex
      const unsubscribe = convex.onUpdate(
        api.user.getUserByClerkId,
        { clerkId },
        (updatedUser) => {
          const newContacts = updatedUser?.metadata?.contacts ?? [];

          // 3️⃣ Only emit if contacts have changed
          const hasChanged =
            JSON.stringify(newContacts) !== JSON.stringify(lastContacts);

          if (hasChanged) {
            lastContacts = newContacts;
            send({ contacts: newContacts });
          }
        },
        (err) => {
          console.error('❌ SSE update error:', err);
          send({ error: 'SSE connection error' });
        }
      );

      // 4️⃣ Cleanup on disconnect
      req.on('close', () => {
        unsubscribe();
        res.end();
      });
    } catch (err) {
      console.error('❌ SSE setup error:', err);
      send({ error: 'Internal server error' });
      res.end();
    }
  });

  app.get('/api/account/get-contacts/:clerkId', async (req, res) => {
    const { clerkId } = req.params;

    try {
      // 1️⃣ Find the user by Clerk ID
      const user = await convex.query(api.user.getUserByClerkId, { clerkId });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // 2️⃣ Extract contact IDs from metadata
      const contactIds = user.metadata?.contacts?.map((c) => c.id) || [];

      if (contactIds.length === 0) {
        return res.json({ contacts: [] });
      }

      // 3️⃣ Fetch each contact's user record
      const contacts = await Promise.all(
        contactIds.map(async (id) => {
          const cUser = await convex.query(api.user.getUserById, { id });
          if (!cUser) return null;

          return {
            clerk_id: cUser.clerk_id,
            firstName: cUser.name.firstName,
            phoneNumber: cUser.phoneNumber,
          };
        })
      );

      // 4️⃣ Filter out nulls in case some contacts were deleted
      const validContacts = contacts.filter(Boolean);

      // 5️⃣ Return the list
      res.json({ contacts: validContacts });
    } catch (err) {
      console.error('❌ Failed to fetch contacts:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/account/send', async (req, res) => {
    try {
      const { senderClerkId, recipientClerkId, recipientPhoneNumber, amount } =
        req.body;
      if (
        !senderClerkId ||
        !recipientClerkId ||
        !recipientPhoneNumber ||
        !amount
      ) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      if (amount <= 0) {
        return res
          .status(400)
          .json({ error: 'Amount must be greater than zero' });
      }
      // Fetch sender and account
      const sender = await convex.query(api.user.getUserByClerkId, {
        clerkId: senderClerkId,
      });
      if (!sender || !sender.account)
        return res
          .status(404)
          .json({ error: 'Sender not found or no account' });
      const senderAccount = await convex.query(api.account.getAccountById, {
        accountId: sender.account,
      });
      if (!senderAccount || !senderAccount.card)
        return res.status(404).json({ error: 'Sender account/card not found' });
      const senderCard = await convex.query(api.card.getCardById, {
        id: senderAccount.card,
      });
      if (!senderCard)
        return res.status(404).json({ error: 'Sender card not found' });
      if (senderCard.balance < amount)
        return res.status(400).json({ error: 'Insufficient funds' });
      // Fetch recipient and account
      const recipient = await convex.query(api.user.getUserByClerkId, {
        clerkId: recipientClerkId,
      });
      if (!recipient || !recipient.account)
        return res
          .status(404)
          .json({ error: 'Recipient not found or no account' });
      if (recipient.phoneNumber !== recipientPhoneNumber) {
        // Remove recipient from sender contacts
        const updatedContacts = (sender.metadata?.contacts || []).filter(
          (c: any) => c.id !== recipient._id
        );
        await convex.mutation(api.user.updateContacts, {
          userId: sender._id,
          contacts: updatedContacts,
        });
        return res.status(400).json({
          error:
            'Recipient phone number mismatch. User removed from your contacts. Please re-add to send money.',
        });
      }
      const recipientAccount = await convex.query(api.account.getAccountById, {
        accountId: recipient.account,
      });
      if (!recipientAccount || !recipientAccount.card)
        return res
          .status(404)
          .json({ error: 'Recipient account/card not found' });
      // ✅ Perform the transaction via Convex mutation
      const transactionResult = await convex.mutation(api.card.sendMoney, {
        senderCardId: senderCard._id,
        recipientCardId: recipientAccount.card,
        amount: Number(amount),
      });
      return res.json({
        message: 'Transaction successful!',
        senderBalance: transactionResult.senderNewBalance,
        recipientBalance: transactionResult.recipientNewBalance,
      });
    } catch (err: any) {
      console.error('❌ Send Money Error:', err);
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
