/**
 * @file This file contains the Firebase configuration object.
 * It is responsible for loading the configuration from environment variables,
 * ensuring that sensitive keys are not hardcoded in the source code.
 */

/**
 * The Firebase configuration object for initializing the app.
 * These values are pulled from environment variables, which should be
 * stored in a `.env.local` file in the root of your project.
 * @type {object}
 * @property {string} apiKey - The API key for the Firebase project.
 * @property {string} authDomain - The authentication domain.
 * @property {string} projectId - The ID of the Firebase project.
 * @property {string} storageBucket - The storage bucket URL.
 * @property {string} messagingSenderId - The sender ID for messaging services.
 * @property {string} appId - The ID of the Firebase app.
 */
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
