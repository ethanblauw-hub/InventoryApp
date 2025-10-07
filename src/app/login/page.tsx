
"use client";

import { useUser, useAuth as useFirebaseAuth } from "@/firebase";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";
import { GoogleAuthProvider, signInWithRedirect, getRedirectResult, Auth } from "firebase/auth";

/**
 * A reusable Google icon component.
 * @param {React.SVGProps<SVGSVGElement>} props - Standard SVG properties.
 * @returns {JSX.Element} The rendered SVG icon.
 */
function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <title>Google icon</title>
            <path d="M12.24 10.28c.14-.46.25-.94.34-1.44H12v2.73h5.13c-.22.95-.78 2.05-1.74 2.73a4.79 4.79 0 0 1-3.39 1.25c-2.83 0-5.13-2.3-5.13-5.13s2.3-5.13 5.13-5.13c1.56 0 2.9.64 3.96 1.63l-2.02 2.02c-.52-.49-1.22-.84-2.02-.84-1.68 0-3.05 1.37-3.05 3.05s1.37 3.05 3.05 3.05c1.9 0 2.65-1.39 2.76-2.07z" />
            <path d="M12 2a10 10 0 1 0 10 10c0-.55-.04-1.09-.12-1.63" />
        </svg>
    )
}

/**
 * The login page for the application.
 * It handles user authentication via a Google Sign-In redirect flow.
 * It redirects authenticated users to the dashboard and provides a sign-in button
 * for unauthenticated users.
 *
 * @returns {JSX.Element} The rendered login page.
 */
export default function LoginPage() {
  const { user, isUserLoading } = useUser();
  const auth = useFirebaseAuth();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    // This effect runs on mount to handle the entire auth flow.
    const processAuth = async () => {
      if (!auth) {
        // Auth service not ready, wait.
        return;
      }

      try {
        // Check if the user is coming back from a sign-in redirect.
        const result = await getRedirectResult(auth);
        if (result) {
          // User has just signed in via redirect. The `onAuthStateChanged`
          // listener (in useUser) will pick up the new user state shortly.
          // We can simply wait for the `user` object to be updated.
        } else if (user) {
           // User is already logged in from a previous session.
           router.push("/dashboard");
        } else {
          // No redirect result and no active user session.
          // The user needs to sign in.
          setIsProcessing(false);
        }
      } catch (error) {
        console.error("Error during redirect result processing:", error);
        setIsProcessing(false);
      }
    };

    // Don't process auth until the user loading is complete and auth is available.
    if (!isUserLoading && auth) {
      processAuth();
    }
  }, [auth, isUserLoading, router, user]);

  // This separate effect handles redirection *after* a successful login.
  useEffect(() => {
    if (!isUserLoading && user) {
        router.push("/dashboard");
    }
  },[user, isUserLoading, router]);

  /**
   * Initiates the Google sign-in process using a redirect.
   */
  const handleSignIn = async () => {
    if (!auth) {
      console.error("Firebase auth service is not available.");
      return;
    }

    setIsProcessing(true);
    const provider = new GoogleAuthProvider();
    // This will navigate the user away to the Google sign-in page.
    await signInWithRedirect(auth, provider);
  };

  // While checking user state or if a sign-in is in progress, show a loading view.
  if (isProcessing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <div className="mb-4 flex items-center justify-center">
              <Package className="size-8 shrink-0 text-accent" />
            </div>
            <CardTitle className="text-2xl font-bold">PartTrack</CardTitle>
            <CardDescription>
              Processing sign-in...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // If not processing and no user, show the login button.
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mb-4 flex items-center justify-center">
            <Package className="size-8 shrink-0 text-accent" />
          </div>
          <CardTitle className="text-2xl font-bold">PartTrack</CardTitle>
          <CardDescription>
            Sign in to access the inventory management system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSignIn} className="w-full">
            <GoogleIcon className="mr-2 h-4 w-4" />
            Sign in with Google
          </Button>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Please use your company account.
          </p>
           <p className="mt-4 text-center text-sm">
            {user ? `Signed in as: ${user.email}` : 'User is not signed in.'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
