"use client";

import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Menu, PanelLeft } from "lucide-react";

export function SidebarTrigger() {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleSidebar}
      className="h-9 w-9"
    >
      <PanelLeft className="h-4 w-4" />
    </Button>
  );
}
