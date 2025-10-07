
"use client";

import { useUser, useAuth as useFirebaseAuth } from "@/firebase";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";
import { GoogleAuthProvider, signInWithPopup, Auth } from "firebase/auth";

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
 * It handles user authentication via a Google Sign-In popup.
 * It redirects authenticated users to the dashboard and provides a sign-in button
 * for unauthenticated users.
 *
 * @returns {JSX.Element} The rendered login page.
 */
export default function LoginPage() {
  const { user, isUserLoading } = useUser();
  const auth = useFirebaseAuth();
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = useState(false);

  // This effect handles redirecting the user if they are already logged in.
  useEffect(() => {
    // Wait until the initial user loading is complete.
    // If we are in the middle of a sign-in attempt, don't redirect yet.
    if (!isUserLoading && user && !isSigningIn) {
      router.push("/dashboard");
    }
  }, [user, isUserLoading, isSigningIn, router]);

  /**
   * Initiates the Google sign-in process using a popup window.
   */
  const handleSignIn = async () => {
    if (!auth) {
      console.error("Firebase auth service is not available.");
      return;
    }

    // Set signing-in state to true to prevent redirects and show loading state.
    setIsSigningIn(true);
    const provider = new GoogleAuthProvider();

    try {
      // Directly call signInWithPopup. The onAuthStateChanged listener
      // managed by the useUser hook will detect the successful login.
      await signInWithPopup(auth, provider);
      // After a successful sign-in, the useEffect will trigger the redirect.
    } catch (error) {
      console.error("Error during sign-in:", error);
      // If there's an error (e.g., popup closed), reset the signing-in state.
      setIsSigningIn(false);
    }
  };

  // While checking user state or if a sign-in is in progress, show a loading view.
  if (isUserLoading || isSigningIn) {
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

  // If not loading and no user, show the login button.
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
          <Button onClick={handleSignIn} className="w-full" disabled={isSigningIn}>
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
