import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import Searchbar from "@/components/dashboard/Searchbar";
import DashboardSidebar from "@/components/dashboard/sidebar/DashboardSidebar";
import RenderContent from "@/components/dashboard/RenderContent";
import { ProtectedRoute } from "@/lib/auth-context";


export default function Dashboard() {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <DashboardSidebar />
        <div className="flex-1 flex flex-col pt-2 md:p-2 gap-2 h-screen overflow-hidden">
          <Searchbar />
          <SidebarInset className="overflow-y-auto md:rounded-xl">
            <RenderContent />
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  )
}
