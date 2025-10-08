
"use client";

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
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
import { AddCategoryDialog } from './add-category-dialog';

const navItems = [
  { href: '/dashboard', label: 'Inventory', icon: LayoutDashboard },
  { href: '/boms', label: 'BOMs', icon: FileText },
  { href: '/containers', label: 'Containers', icon: Container },
  { href: '/locations', label: 'Shelf Location List', icon: Warehouse },
  { href: '/receive', label: 'Receive/Store', icon: PackagePlus },
  { href: '/categories', label: 'Categories', icon: Tags },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname.startsWith(item.href) && (item.href === '/dashboard' ? pathname === item.href : true) }
            tooltip={item.label}
          >
            <Link href={item.href}>
              <item.icon />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
      <SidebarSeparator />
       <SidebarMenuItem>
        <div className="px-2 w-full">
          <AddCategoryDialog />
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
