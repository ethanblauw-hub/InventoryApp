"use client";

import { useUser, useAuth as useFirebaseAuth } from "@/firebase";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";
import { GoogleAuthProvider, signInWithRedirect, getRedirectResult } from "firebase/auth";

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
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
);

export default function LoginPage() {
  const { user, isUserLoading } = useUser();
  const auth = useFirebaseAuth();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    // Wait until both the user loading state is settled and the auth instance is available.
    if (isUserLoading || !auth) {
      return; 
    }

    // If the user is already authenticated, redirect them.
    if (user) {
      router.push("/dashboard");
      return;
    }
    
    // Process the redirect result from Google Sign-In.
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          // A user was successfully signed in via redirect.
          // The onAuthStateChanged listener will handle the redirect to dashboard.
          // We can just stop processing here.
          return; 
        }
        // If there's no result, it means the user is not signed in
        // and did not just return from a redirect.
        // It's now safe to show the login button.
        setIsProcessing(false);
      })
      .catch((error) => {
        console.error("Error processing redirect result:", error);
        setIsProcessing(false);
      });
  }, [user, isUserLoading, auth, router]);

  const handleSignIn = async () => {
    if (!auth) {
      console.error("Firebase auth not available.");
      return;
    }
    setIsProcessing(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ hd: "eganco.com" });
    await signInWithRedirect(auth, provider);
  };
  
  if (isProcessing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <div className="mb-4 flex items-center justify-center">
              <Package className="size-8 shrink-0 text-accent" />
            </div>
            <CardTitle className="text-2xl font-bold">PartTrack</CardTitle>
            <CardDescription>Processing sign-in...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mb-4 flex items-center justify-center">
            <Package className="size-8 shrink-0 text-accent" />
          </div>
          <CardTitle className="text-2xl font-bold">PartTrack</CardTitle>
          <CardDescription>Sign in to access the inventory management system.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSignIn} className="w-full">
            <GoogleIcon className="mr-2 h-4 w-4" />
            Sign in with Google
          </Button>
          <p className="mt-4 text-center text-xs text-muted-foreground">Please use your company account.</p>
        </CardContent>
      </Card>
    </div>
  );
}