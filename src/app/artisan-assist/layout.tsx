"use client"

import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { ArtisanAssistIcon } from "@/components/ui/icons";
import { Store, Lightbulb, CalendarDays } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";


export default function ArtisanAssistLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const searchParams = useSearchParams();
    const currentTab = searchParams.get('tab') || 'sourcing';

    const menuItems = [
        { href: "/artisan-assist?tab=sourcing", icon: Store, label: "Sourcing & Selling", tab: "sourcing" },
        { href: "/artisan-assist?tab=ideas", icon: Lightbulb, label: "Product Ideas", tab: "ideas" },
        { href: "/artisan-assist?tab=events", icon: CalendarDays, label: "Events & Fairs", tab: "events" },
    ];
    
    return (
        <SidebarProvider>
          <div className="flex min-h-screen">
              <Sidebar>
                  <SidebarHeader>
                      <ArtisanAssistIcon />
                  </SidebarHeader>
                  <SidebarMenu>
                      {menuItems.map((item) => (
                          <SidebarMenuItem key={item.label}>
                            <Link href={item.href}>
                              <SidebarMenuButton isActive={currentTab === item.tab}>
                                <item.icon />
                                <span>{item.label}</span>
                              </SidebarMenuButton>
                            </Link>
                          </SidebarMenuItem>
                      ))}
                  </SidebarMenu>
              </Sidebar>
              <main className="flex-grow flex flex-col">{children}</main>
          </div>
        </SidebarProvider>
    );
}