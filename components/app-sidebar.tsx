"use client";

import * as React from "react";
import { 
  Home, 
  LineChart, 
  Settings, 
  Bot, 
  Wallet,
  Activity
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
  {
    title: "Dashboard",
    items: [
      { title: "Overview", url: "#", icon: Home },
      { title: "PnL Chart", url: "#", icon: LineChart },
    ],
  },
  {
    title: "Bots",
    items: [
      { title: "Black Widow", url: "#", icon: Bot },
      { title: "Gamora", url: "#", icon: Bot },
    ],
  },
  {
    title: "Account",
    items: [
      { title: "Balance", url: "#", icon: Wallet },
      { title: "Activity", url: "#", icon: Activity },
    ],
  },
  {
    title: "Settings",
    items: [
      { title: "Settings", url: "#", icon: Settings },
    ],
  },
];

export function AppSidebar() {
  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <Activity className="h-6 w-6 text-orange-500" />
          <span className="font-bold text-lg">Mission Control</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {navItems.map((section) => (
          <SidebarMenu key={section.title}>
            <SidebarMenuItem>
              <span className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {section.title}
              </span>
            </SidebarMenuItem>
            {section.items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <a href={item.url} className="flex items-center gap-3 px-2 py-1.5 text-sm hover:bg-accent rounded-md">
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </a>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        ))}
        <div className="mt-auto pt-4 px-2">
          <ThemeToggle />
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
