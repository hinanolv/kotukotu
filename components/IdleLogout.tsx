'use client';

import { useClerk, useAuth } from '@clerk/nextjs';
import { useEffect, useRef } from 'react';

const IDLE_TIMEOUT = 60 * 60 * 1000; // 1 hour

export default function IdleLogout() {
  const { signOut } = useClerk();
  const { isSignedIn } = useAuth();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isSignedIn) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        console.log('Idle timeout reached. Logging out...');
        signOut({ redirectUrl: '/' });
      }, IDLE_TIMEOUT);
    };

    const events = ['mousemove', 'mousedown', 'keypress', 'touchstart', 'scroll'];
    
    const handleActivity = () => {
      resetTimer();
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Initial timer set
    resetTimer();

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [signOut, isSignedIn]);

  return null;
}
