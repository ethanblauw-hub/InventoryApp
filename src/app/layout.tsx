
'use client';

import { useEffect, useState } from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseProvider } from '@/firebase/provider';
import { getApp, getApps, initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

/**
 * Metadata for the application.
 * This includes the title and description for SEO purposes.
 */
// Note: Metadata is commented out as it's not fully supported in Client Components.
// You can move this to a server-side layout file if needed.
// export const metadata: Metadata = {
//   title: 'PartTrack',
//   description: 'Inventory management for prefab shops.',
// };

/**
 * Props for the RootLayout component.
 * @property {React.ReactNode} children - The child components to be rendered within this layout.
 */
type RootLayoutProps = {
  children: React.ReactNode;
};

/**
 * The root layout for the entire application.
 * It sets up the basic HTML structure, includes global stylesheets, fonts,
 * and wraps the application in necessary context providers like Firebase and the Toaster.
 * It now also handles the client-side initialization of Firebase services.
 *
 * @param {RootLayoutProps} props - The props for the component.
 * @returns {JSX.Element} The rendered root layout.
 */
export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
  const [firebaseServices, setFirebaseServices] = useState<{
    app: FirebaseApp;
    auth: Auth;
    firestore: Firestore;
  } | null>(null);

  useEffect(() => {
    // Initialize Firebase only on the client side
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const auth = getAuth(app);
    const firestore = getFirestore(app);
    setFirebaseServices({ app, auth, firestore });
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>PartTrack</title>
        <meta name="description" content="Inventory management for prefab shops." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        {firebaseServices ? (
          <FirebaseProvider
            firebaseApp={firebaseServices.app}
            auth={firebaseServices.auth}
            firestore={firebaseServices.firestore}
          >
            {children}
          </FirebaseProvider>
        ) : (
          <div className="flex h-screen w-screen items-center justify-center">Loading...</div>
        )}
        <Toaster />
      </body>
    </html>
  );
}
