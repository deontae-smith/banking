import { useEffect, useState, useRef } from 'react';
import EventSource from 'react-native-sse';
import {
  UseUserAccountResult,
  AccountDataPayload,
  Transaction,
} from '@ob/account-iso';
import { Card } from '@ob/account-iso';
import { getBackendUrl } from '@/libs/getAPIUrl';

const RECONNECT_INTERVAL_MS = 5000;

export function useUserAccount(clerkId?: string): UseUserAccountResult {
  const [account, setAccount] = useState<AccountDataPayload | null>(null);
  const [loading, setLoading] = useState<boolean>(!!clerkId);
  const [error, setError] = useState<string | null>(null);
  const [isCardLocked, setIsCardLocked] = useState<boolean | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]); // Placeholder for future use
  const [totalExpenses, setTotalExpenses] = useState<number>(0);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const backendUrl = getBackendUrl();
  const url =
    clerkId && backendUrl
      ? `${backendUrl}/api/account/subscribe/${encodeURIComponent(clerkId)}`
      : null;

  const fetchCard = async (cardId: string) => {
    try {
      const res = await fetch(
        `${backendUrl}/api/account/card/${encodeURIComponent(cardId)}`
      );
      const data = await res.json();
      return data.card as Card;
    } catch (err) {
      console.error('Failed to fetch card:', err);
      return null;
    }
  };

  const handleLockingFeature = async (cardId: string, status: boolean) => {
    try {
      const res = await fetch(
        `${backendUrl}/api/accounts/cards/${encodeURIComponent(cardId)}/lock/${status}`,
        {
          method: 'POST',
        }
      );

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      const { newStatus } = await res.json();

      if (newStatus === undefined) {
        throw new Error('Failed to update lock status');
      }
      setIsCardLocked(newStatus);
      return newStatus;
    } catch (err) {
      console.error('Error locking card:', err);
      throw err; // rethrow so caller can handle
    }
  };

  const connect = () => {
    if (!clerkId || !backendUrl || !url) {
      setLoading(false);
      setError('No user ID or backend URL provided');
      return;
    }

    setLoading(true);
    setError(null);

    // close any previous connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.addEventListener('open', () => {
      // connection opened
      console.debug('SSE connection opened for clerkId', clerkId);
    });

    es.addEventListener('message', async (event: any) => {
      try {
        const payload = JSON.parse(event.data);

        if (payload.error) {
          setError(payload.error);
          setLoading(false);
          return;
        }

        let accountData: AccountDataPayload = payload.account;

        // If cardId exists, fetch card info
        if (payload.account?.card) {
          const cardInfo = await fetchCard(payload.account.card);
          accountData = { ...accountData, card: cardInfo };
        }

        setAccount(accountData);
        setIsCardLocked(accountData.card?.metadata.isLocked ?? null);
        setTransactions(accountData.card?.transactions || []);
        setError(null);
        setLoading(false);
      } catch (parseErr) {
        console.error('Failed to parse SSE message', parseErr);
        setError('Invalid data from server');
        setLoading(false);
      }
    });

    es.addEventListener('error', (err: any) => {
      console.warn('SSE connection error:', err);
      es.close();
      // schedule reconnection
      reconnectTimerRef.current = setTimeout(() => {
        connect();
      }, RECONNECT_INTERVAL_MS);
    });
  };

  useEffect(() => {
    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };
  }, [clerkId, backendUrl]);

  return {
    transactions,
    handleLockingFeature,
    account,
    loading,
    error,
    isCardLocked,
  };
}
