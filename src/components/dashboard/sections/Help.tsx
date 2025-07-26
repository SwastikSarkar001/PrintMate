import { HelpCircleIcon } from "lucide-react";

export default function HelpSection() {
  return (
    <div className="dashboard-section">
      <div className="dashboard-section-header">
        <HelpCircleIcon className="size-5" />
        <h1 className="dashboard-section-header-h1">Help & Support</h1>
      </div>
      <div className="grow overflow-y-auto p-4 sm:p-6">
        <p className="text-muted-foreground text-center">
          Get help with using My Website. Find answers to common questions, tutorials, and contact support.
        </p>
      </div>
    </div>
  )
}
