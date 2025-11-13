import { useState } from 'react';
import { getBackendUrl } from '@/libs/getAPIUrl';
import { ReturnedUserContact } from '@ob/account-iso';

interface Recipient {
  id: string;
  phoneNumber: string;
}

export function useSendMoney() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const tunnelUrl = getBackendUrl();

  type SendMoneyArgs = {
    senderclerkId: string;
    recipient: { id: string; phoneNumber: string }; // make sure it matches
    amount: number;
  };

  const sendMoney = async (args: SendMoneyArgs) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(`${tunnelUrl}/api/account/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderClerkId: args.senderclerkId,
          recipientClerkId: args.recipient.id,
          recipientPhoneNumber: args.recipient.phoneNumber,
          amount: args.amount,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Transaction failed');
      }

      setSuccess(true);
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { sendMoney, loading, error, success };
}
