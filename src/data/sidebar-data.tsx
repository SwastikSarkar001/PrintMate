import HelpSection from "@/components/dashboard/sections/Help";
import MyCartSection from "@/components/dashboard/sections/MyCart";
import MyFilesSection from "@/components/dashboard/sections/MyFiles";
import NotificationsSection from "@/components/dashboard/sections/Notifications";
import RecentsSection from "@/components/dashboard/sections/Recents";
import SearchSection from "@/components/dashboard/sections/Search";
import SettingsSection from "@/components/dashboard/sections/Settings";
import StorageSection from "@/components/dashboard/sections/Storage";
import TrashSection from "@/components/dashboard/sections/Trash";
import UploadSection from "@/components/dashboard/sections/Upload";

import {
  ClockIcon,
  FolderIcon,
  TrashIcon,
  SettingsIcon,
  HardDriveIcon,
  HelpCircleIcon,
  SearchIcon,
  LucideIcon,
  UploadIcon,
  ShoppingCartIcon,
  BellIcon
} from "lucide-react";

export type NavData = {
  navMain: {
    title: string;
    url: string;
    icon: LucideIcon;
    component: React.ComponentType;
    isDefault?: true;
  }[];
  navSecondary: {
    title: string;
    url: string;
    icon: LucideIcon;
    component: React.ComponentType;
    isDefault?: true;
  }[];
}

const data: NavData = {
  navMain: [
    {
      title: "Upload",
      url: "#upload",
      icon: UploadIcon,
      component: UploadSection,
      isDefault: true,
    },
    {
      title: "Recents",
      url: "#recents",
      component: RecentsSection,
      icon: ClockIcon,
    },
    {
      title: "My Files",
      url: "#files",
      component: MyFilesSection,
      icon: FolderIcon,
    },
    {
      title: "Trash",
      url: "#trash",
      component: TrashSection,
      icon: TrashIcon,
    },
    {
      title: "Storage",
      url: "#storage",
      component: StorageSection,
      icon: HardDriveIcon,
    },
    {
      title: "My Cart",
      url: "#cart",
      component: MyCartSection,
      icon: ShoppingCartIcon,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#settings",
      component: SettingsSection,
      icon: SettingsIcon,
    },
    {
      title: "Notifications",
      url: "#notifications",
      component: NotificationsSection,
      icon: BellIcon,
    },
    {
      title: "Get Help",
      url: "#help",
      component: HelpSection,
      icon: HelpCircleIcon,
    },
    {
      title: "Search",
      url: "#search",
      component: SearchSection,
      icon: SearchIcon,
    },
  ]
}

export default data;