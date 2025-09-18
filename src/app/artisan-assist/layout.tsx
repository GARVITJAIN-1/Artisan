
"use client"

import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarProvider,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { ArtisanAssistIcon } from "@/components/ui/icons";
import { Store, Lightbulb, CalendarDays } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";


export default function ArtisanAssistLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentTab = searchParams.get('tab') || 'sourcing';

    const menuItems = [
        { href: "/artisan-assist?tab=sourcing", icon: Store, label: "Sourcing & Selling", tab: "sourcing" },
        { href: "/artisan-assist?tab=ideas", icon: Lightbulb, label: "Product Ideas", tab: "ideas" },
        { href: "/artisan-assist?tab=events", icon: CalendarDays, label: "Events & Fairs", tab: "events" },
    ];
    
    return <main className="flex-grow flex flex-col">{children}</main>;
}
