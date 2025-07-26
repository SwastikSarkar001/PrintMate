'use client'

import { useState, useEffect } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import Searchbar from "@/components/dashboard/Searchbar";
import DashboardSidebar from "@/components/dashboard/sidebar/DashboardSidebar";
import data from "@/data/sidebar-data";

function renderContent (activeSection: string) {
  // Combine both navMain and navSecondary arrays to search for the component
  const allNavItems = [...data.navMain, ...data.navSecondary];
  
  // Find the nav item that matches the active section
  const navItem = allNavItems.find(item => {
    const sectionName = item.url.replace("#", "");
    return sectionName === activeSection;
  });

  // If found, render the component
  if (navItem) {
    const Component = navItem.component;
    return <Component />;
  }

  // Default fallback - find the default component or upload
  const defaultItem = data.navMain.find(item => item.isDefault) || data.navMain[0];
  const DefaultComponent = defaultItem.component;
  return <DefaultComponent />;
}

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("upload")

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "")
      console.log("Hash changed to:", hash) // Debug log
      if (hash) {
        setActiveSection(hash)
      } else {
        setActiveSection("upload")
      }
    }

    // Set initial section based on current hash
    handleHashChange()

    // Listen for hash changes
    window.addEventListener("hashchange", handleHashChange)

    return () => window.removeEventListener("hashchange", handleHashChange)
  }, [])

  return (
    <SidebarProvider>
      <DashboardSidebar />
      <div className="flex-1 flex flex-col pt-2 md:p-2 gap-2 h-screen overflow-hidden">
        <Searchbar />
        <SidebarInset className="overflow-y-auto md:rounded-xl">
          { renderContent(activeSection) }
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
