"use client"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { NavData } from "@/data/sidebar-data"

type NavSecondaryProps = {
  items: NavData["navSecondary"];
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>;

export default function NavSecondary({ items, ...props }: NavSecondaryProps) {
  const handleNavigation = (url: string) => {
    if (url.startsWith("#")) {
      window.location.hash = url
    } else {
      window.location.href = url
    }
  }

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton onClick={() => handleNavigation(item.url)} className="cursor-pointer">
                <item.icon />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
