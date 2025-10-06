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
import { Package } from 'lucide-react';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6 md:hidden">
          <SidebarTrigger />
           <Button variant="ghost" className="w-full justify-start gap-2 px-0 text-lg font-bold" asChild>
            <Link href="/dashboard">
              <Package className="size-6 shrink-0 text-accent" />
              <span className="font-headline text-foreground">PartTrack</span>
            </Link>
          </Button>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
