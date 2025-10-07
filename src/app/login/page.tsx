
"use client";

import { useUser, useAuth as useFirebaseAuth } from "@/firebase";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

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
 * It provides a "Sign in with Google" button and handles the authentication flow
 * using a popup. If a user is already authenticated, it redirects them to the dashboard.
 *
 * @returns {JSX.Element} The rendered login page.
 */
export default function LoginPage() {
  const { user, isUserLoading } = useUser();
  const auth = useFirebaseAuth();
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = useState(false);

  // This effect handles redirection based on authentication state.
  useEffect(() => {
    // If the user object is available (meaning they are logged in), redirect to the dashboard.
    if (!isUserLoading && user) {
      router.push("/dashboard");
    }
  }, [user, isUserLoading, router]);

  /**
   * Initiates the Google sign-in process using a popup.
   */
  const signInWithGoogle = async () => {
    if (!auth) return;

    setIsSigningIn(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
        'hd': 'eganco.com'
    });

    try {
      // The onAuthStateChanged listener in useUser() will handle the successful login
      // and trigger the redirect in the useEffect above.
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      // Handle potential errors like "popup-closed-by-user" gracefully.
      console.error("Error during sign-in:", error.message);
      setIsSigningIn(false);
    }
  };

  // While checking for user state or if a sign-in is in progress, show a loading state.
  if (isUserLoading || isSigningIn || user) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Card className="w-full max-w-sm">
            <CardHeader className="text-center">
                <div className="flex justify-center items-center mb-4">
                    <Package className="size-8 shrink-0 text-accent" />
                </div>
              <CardTitle className="text-2xl font-bold">PartTrack</CardTitle>
              <CardDescription>
                Loading...
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
          <Button onClick={signInWithGoogle} className="w-full">
             <GoogleIcon className="mr-2 h-4 w-4" />
            Sign in with Google
          </Button>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Please use your @eganco.com account.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
