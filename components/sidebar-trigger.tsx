"use client";

import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export function SidebarTrigger() {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      variant="lucide"
      size="icon"
      onClick={toggleSidebar}
      className="h-9 w-9"
    >
      <Menu className="h-4 w-4" />
    </Button>
  );
}
