import { getBackendUrl } from '@/libs/getAPIUrl';
import { useEffect, useState, useRef } from 'react';
import EventSource from 'react-native-sse';
import { UseUserAccountResult, RetunredAccountData } from '@ob/account-iso';
import { Card } from '@ob/account-iso';

const RECONNECT_INTERVAL_MS = 5000;

export function useUserAccount(clerkId?: string): UseUserAccountResult {
  const [account, setAccount] = useState<RetunredAccountData | null>(null);
  const [loading, setLoading] = useState<boolean>(!!clerkId);
  const [error, setError] = useState<string | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const backendUrl = getBackendUrl();
  const url =
    clerkId && backendUrl
      ? `${backendUrl}/api/account/subscribe/${clerkId}`
      : null;

  const fetchCard = async (cardId: string) => {
    try {
      const res = await fetch(`${backendUrl}/api/account/card/${cardId}`);
      const data = await res.json();
      return data.card as Card;
    } catch (err) {
      console.error('Failed to fetch card:', err);
      return null;
    }
  };

  const connect = () => {
    if (!clerkId || !backendUrl) {
      setLoading(false);
      setError('No user ID or backend URL provided');
      return;
    }

    setLoading(true);
    setError(null);

    const es = new EventSource(url!);
    eventSourceRef.current = es;

    es.addEventListener('open', () => {});

    es.addEventListener('message', async (event: any) => {
      try {
        const payload = JSON.parse(event.data);

        if (payload.error) {
          setError(payload.error);
          setLoading(false);
          return;
        }

        let accountData: RetunredAccountData = payload.account;

        // If cardId exists, fetch the card info
        if (payload.account?.card) {
          const cardInfo = await fetchCard(payload.account.card);
          accountData = { ...accountData, card: cardInfo };
        }

        setAccount(accountData);
        setError(null);
        setLoading(false);
      } catch (parseErr) {
        console.error('Failed to parse SSE message', parseErr);
        setError('Invalid data from server');
        setLoading(false);
      }
    });

    es.addEventListener('error', (err: any) => {
      console.warn('SSE connection error', err);
      es.close();
      // schedule reconnection
      reconnectTimerRef.current = setTimeout(connect, RECONNECT_INTERVAL_MS);
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

  return { account, loading, error };
}
