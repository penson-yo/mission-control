import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function Home() {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        <div className="p-8">
          <h1 className="text-3xl font-bold">Mission Control</h1>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
