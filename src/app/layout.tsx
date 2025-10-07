
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase';

/**
 * Metadata for the application.
 * This includes the title and description for SEO purposes.
 * @type {Metadata}
 */
export const metadata: Metadata = {
  title: 'PartTrack',
  description: 'Inventory management for prefab shops.',
};

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
 *
 * @param {RootLayoutProps} props - The props for the component.
 * @returns {JSX.Element} The rendered root layout.
 */
export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          {children}
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
