/**
 * @file This file is responsible for loading the Firebase configuration.
 *
 * It retrieves the Firebase credentials from environment variables.
 * This is a security best practice to avoid hardcoding sensitive information
 * in the source code.
 *
 * It is crucial that the environment variables are prefixed with NEXT_PUBLIC_
 * to be accessible on the client side.
 */
import { FirebaseOptions } from 'firebase/app';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_APP_ID
};

// Validate that all necessary environment variables are set
if (
  !firebaseConfig.apiKey ||
  !firebaseConfig.authDomain ||
  !firebaseConfig.projectId
) {
  throw new Error(
    'Firebase configuration is missing. Make sure to set NEXT_PUBLIC_API_KEY, NEXT_PUBLIC_AUTH_DOMAIN, and NEXT_PUBLIC_PROJECT_ID in your .env.local file.'
  );
}

export { firebaseConfig };
