
"use client";

import { SidebarNav } from '@/components/sidebar-nav';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Package, LogOut } from 'lucide-react';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { getAuth, signOut } from 'firebase/auth';

/**
 * Props for the AppLayout component.
 * @property {React.ReactNode} children - The pages and components to be rendered within the layout.
 */
type AppLayoutProps = {
  children: React.ReactNode;
};

/**
 * The main layout for the authenticated part of the application.
 * It sets up the primary user interface structure, including the sidebar,
 * header, and main content area. It also handles authentication by protecting
 * routes and redirecting unauthenticated users to the login page.
 *
 * @param {AppLayoutProps} props - The props for the component.
 * @returns {JSX.Element | JSX.Element} A loading indicator or the main app layout.
 */
export default function AppLayout({ children }: AppLayoutProps) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  /**
   * Handles the user logout process by signing them out of Firebase
   * and redirecting to the login page.
   */
  const logout = async () => {
    try {
      await signOut(getAuth());
      router.push("/login");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  // Effect to redirect unauthenticated users.
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  // Display a loading state while checking user authentication status.
  if (isUserLoading || !user) {
    return <div className="flex h-screen w-screen items-center justify-center">Loading...</div>;
  }

  /**
   * Generates initials from a user's display name for use in an avatar fallback.
   * @param {string | null | undefined} name - The user's full display name.
   * @returns {string} The initials of the user.
   */
  const getInitials = (name?: string | null) => {
    if (!name) return '';
    const names = name.split(' ');
    return names.map(n => n[0]).join('');
  }


  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Button variant="ghost" className="h-12 w-full justify-start gap-3 px-3 text-lg font-bold" asChild>
            <Link href="/dashboard">
              <Package className="size-6 shrink-0 text-accent" />
              <span className="font-headline text-primary-foreground">PartTrack</span>
            </Link>
          </Button>
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav />
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
          <SidebarTrigger className="md:hidden" />
           <Button variant="ghost" className="w-full justify-start gap-2 px-0 text-lg font-bold md:hidden" asChild>
            <Link href="/dashboard">
              <Package className="size-6 shrink-0 text-accent" />
              <span className="font-headline text-foreground">PartTrack</span>
            </Link>
          </Button>
          <div className="ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                 <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? 'User'} />
                    <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
