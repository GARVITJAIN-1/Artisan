
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
    
    return (
        <SidebarProvider>
            <Sidebar>
                <SidebarHeader>
                    <div className="flex items-center gap-2">
                        <ArtisanAssistIcon className="h-8 w-8 text-primary" />
                        <h1 className="text-xl font-semibold font-headline text-primary">
                            ArtisanAssist
                        </h1>
                    </div>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarMenu>
                        {menuItems.map((item) => (
                             <SidebarMenuItem key={item.href}>
                                <Link href={item.href}>
                                    <SidebarMenuButton
                                        isActive={currentTab === item.tab}
                                        tooltip={item.label}
                                    >
                                        <item.icon />
                                        <span>{item.label}</span>
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarContent>
                <SidebarFooter>
                    {/* Can add footer content here if needed */}
                </SidebarFooter>
            </Sidebar>
            <SidebarInset>
                <header className="flex h-12 items-center justify-start border-b bg-background p-2 md:hidden">
                    <SidebarTrigger />
                     <div className="flex items-center gap-2 ml-2">
                        <ArtisanAssistIcon className="h-6 w-6 text-primary" />
                        <h1 className="text-lg font-semibold font-headline text-primary">
                            ArtisanAssist
                        </h1>
                    </div>
                </header>
                <main className="flex-grow flex flex-col">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
