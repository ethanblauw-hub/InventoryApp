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
  apiKey: "AIzaSyAE_7BU9x8nzrmBSdnl2iVylbujQDrZsY4",
  authDomain: "studio-1025404824-b0cf8.firebaseapp.com",
  projectId: "studio-1025404824-b0cf8",
  storageBucket: "studio-1025404824-b0cf8.appspot.com",
  messagingSenderId: "394731799727",
  appId: "1:394731799727:web:8839bee90c79b248bfc05a",
};
