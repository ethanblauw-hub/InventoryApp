
'use client';
import { useUser } from '@/firebase';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

/**
 * The root page of the application.
 * Its sole purpose is to handle initial routing based on the user's
 * authentication state. It redirects authenticated users to the dashboard
 * and unauthenticated users to the login page.
 *
 * @returns {null} This component renders nothing itself, as it only handles redirection.
 */
export default function Home() {
  const { user, isUserLoading } = useUser();

  // Effect to handle redirection once authentication status is determined.
  useEffect(() => {
    if (!isUserLoading) {
      if (user) {
        redirect('/dashboard');
      } else {
        redirect('/login');
      }
    }
  }, [user, isUserLoading]);

  // Render a loading state or nothing while waiting for the redirect.
  return null;
}
