"use client";

import * as React from "react";
import { 
  Home, 
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
        <SidebarMenu>
          <SidebarMenuItem>
            <a href="#" className="flex items-center gap-3 px-2 py-1.5 text-sm hover:bg-accent rounded-md">
              <Home className="h-4 w-4" />
              Dashboard
            </a>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="mt-auto pt-4 px-2">
          <ThemeToggle />
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
