
"use client";

import { useUser, useAuth as useFirebaseAuth } from "@/firebase";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";
import { GoogleAuthProvider, signInWithRedirect, getRedirectResult, Auth, User } from "firebase/auth";

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
 * It handles the authentication flow using a redirect to Google's sign-in page.
 * It shows a loading state while processing authentication and redirects authenticated
 * users to the dashboard.
 *
 * @returns {JSX.Element} The rendered login page.
 */
export default function LoginPage() {
  const { user, isUserLoading } = useUser();
  const auth = useFirebaseAuth();
  const router = useRouter();
  const [isProcessingSignIn, setIsProcessingSignIn] = useState(true);

  // This single, robust useEffect handles all authentication logic.
  useEffect(() => {
    // If the main user check is still running, or we don't have the auth service yet, wait.
    if (isUserLoading || !auth) {
      return;
    }

    // If a user object is already available, they are logged in. Redirect them.
    if (user) {
      router.push("/dashboard");
      return;
    }

    // If there's no user, we check for a redirect result.
    // This is the critical step for users returning from Google.
    getRedirectResult(auth)
      .then((result) => {
        if (result && result.user) {
          // A user just signed in via redirect.
          // The onAuthStateChanged listener will handle the user state update.
          // We can redirect them immediately.
          router.push("/dashboard");
        } else {
          // No redirect result and no existing user session.
          // It's now safe to show the login button.
          setIsProcessingSignIn(false);
        }
      })
      .catch((error) => {
        // Handle errors from getRedirectResult, e.g., network issues.
        console.error("Error getting redirect result:", error);
        setIsProcessingSignIn(false); // Allow user to try signing in again.
      });

  }, [user, isUserLoading, auth, router]);

  /**
   * Initiates the Google sign-in process using a redirect.
   */
  const handleSignIn = async () => {
    if (!auth) return;

    // Set processing to true to show loading state while redirecting.
    setIsProcessingSignIn(true); 
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
  };

  // While checking for user state or processing a redirect, show a loading view.
  if (isProcessingSignIn) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Card className="w-full max-w-sm">
            <CardHeader className="text-center">
                <div className="flex justify-center items-center mb-4">
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

  // If not loading and no user, show the login button.
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center mb-4">
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
