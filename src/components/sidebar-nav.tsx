"use client";

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  FileText,
  Warehouse,
  PackagePlus,
  Tags,
  Container,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const navItems = [
  { href: '/dashboard', label: 'Inventory', icon: LayoutDashboard },
  { href: '/boms', label: 'BOMs', icon: FileText },
  { href: '/locations', label: 'Shelf Location List', icon: Warehouse },
  { href: '/receive', label: 'Receive/Store', icon: PackagePlus },
  { href: '/categories', label: 'Categories', icon: Tags },
  { href: '/containers/1', label: 'Container Details', icon: Container },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname.startsWith(item.href) && (item.href === '/dashboard' || item.href.startsWith('/containers')) ? pathname === item.href : true}
            tooltip={item.label}
          >
            <Link href={item.href}>
              <item.icon />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
