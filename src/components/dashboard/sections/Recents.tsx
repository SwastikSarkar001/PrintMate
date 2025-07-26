import { CalendarIcon, FileIcon, FolderIcon, ImageIcon, VideoIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import NoDocumentsFound from "@/ui/NoDocumentsFound"

type RecentFile = {
  id: number
  name: string
  type: string
  size: string
  modified: string
  icon: React.ComponentType<{ className?: string }>
}

// const recentFiles: RecentFile[] = []

const recentFiles: RecentFile[] = [
  {
    id: 1,
    name: "Project Proposal.pdf",
    type: "pdf",
    size: "2.4 MB",
    modified: "2024-01-25T10:30:00Z",
    icon: FileIcon,
  },
  {
    id: 2,
    name: "Design Assets",
    type: "folder",
    size: "15 files",
    modified: "2024-01-25T09:15:00Z",
    icon: FolderIcon,
  },
  {
    id: 3,
    name: "Meeting Recording.mp4",
    type: "video",
    size: "125 MB",
    modified: "2024-01-24T16:45:00Z",
    icon: VideoIcon,
  },
  {
    id: 4,
    name: "Screenshot_2024.png",
    type: "image",
    size: "1.8 MB",
    modified: "2024-01-24T14:20:00Z",
    icon: ImageIcon,
  },
  {
    id: 5,
    name: "Budget Analysis.xlsx",
    type: "spreadsheet",
    size: "890 KB",
    modified: "2024-01-23T11:30:00Z",
    icon: FileIcon,
  },
  {
    id: 6,
    name: "Client Presentation.pptx",
    type: "presentation",
    size: "5.2 MB",
    modified: "2024-01-22T15:45:00Z",
    icon: FileIcon,
  },
  {
    id: 7,
    name: "Research Notes.docx",
    type: "document",
    size: "1.2 MB",
    modified: "2024-01-20T09:30:00Z",
    icon: FileIcon,
  },
  {
    id: 8,
    name: "Marketing Materials",
    type: "folder",
    size: "8 files",
    modified: "2023-12-18T13:15:00Z",
    icon: FolderIcon,
  },
  {
    id: 9,
    name: "Annual Report 2023.pdf",
    type: "pdf",
    size: "4.1 MB",
    modified: "2023-12-15T10:30:00Z",
    icon: FileIcon,
  },
  {
    id: 10,
    name: "Team Photos",
    type: "folder",
    size: "24 files",
    modified: "2023-11-28T14:20:00Z",
    icon: FolderIcon,
  },
  {
    id: 11,
    name: "Q3 Financial Data.xlsx",
    type: "spreadsheet",
    size: "2.1 MB",
    modified: "2023-11-15T11:45:00Z",
    icon: FileIcon,
  },
  {
    id: 12,
    name: "Product Launch Video.mp4",
    type: "video",
    size: "89 MB",
    modified: "2023-10-22T16:30:00Z",
    icon: VideoIcon,
  },
]

function groupFilesByMonth(files: RecentFile[]) {
  const now = new Date()
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const groups: { [key: string]: RecentFile[] } = {}

  // Group files by month and year
  files.forEach((file) => {
    const fileDate = new Date(file.modified)
    const fileMonth = new Date(fileDate.getFullYear(), fileDate.getMonth(), 1)

    let groupKey: string
    if (fileMonth.getTime() === currentMonth.getTime()) {
      groupKey = "This Month"
    } else {
      groupKey = fileDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    }

    if (!groups[groupKey]) {
      groups[groupKey] = []
    }
    groups[groupKey].push(file)
  })

  // Sort each group by date (newest first)
  Object.keys(groups).forEach((key) => {
    groups[key].sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime())
  })

  return groups
}

export default function RecentsSection() {
  const groupedFiles = groupFilesByMonth(recentFiles)

  // Sort group keys to show "This Month" first, then chronologically
  const sortedGroupKeys = Object.keys(groupedFiles).sort((a, b) => {
    if (a === "This Month") return -1
    if (b === "This Month") return 1

    // Parse dates for comparison
    const dateA = new Date(a + " 1")
    const dateB = new Date(b + " 1")
    return dateB.getTime() - dateA.getTime()
  })

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  const isToday = (dateString: string) => {
    const fileDate = new Date(dateString)
    const today = new Date()
    return fileDate.toDateString() === today.toDateString()
  }

  return (
    <div className="dashboard-section">
      <div className="dashboard-section-header">
        <CalendarIcon className="size-5" />
        <h1 className="dashboard-section-header-h1">Recent Documents</h1>
        <Badge variant="outline" className="ml-auto">
          {recentFiles.length} documents
        </Badge>
      </div>
      {
        sortedGroupKeys.length === 0 ? (
          <NoDocumentsFound />
        ) : (
          <div className="grow overflow-y-auto p-4 sm:p-6">
            <div className="space-y-4 sm:space-y-6">
              {
                sortedGroupKeys.map((groupName) => {
                  const files = groupedFiles[groupName]
      
                  return (
                    <div key={groupName} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-medium">{groupName}</h2>
                        <Badge variant="secondary" className="text-xs">
                          {files.length} {files.length === 1 ? "item" : "items"}
                        </Badge>
                      </div>
                      <div className="flex flex-col items-stretch gap-2">
                        {
                        files.map(file => (
                            <Card key={file.id} className="py-0 hover:bg-muted/50 transition-colors cursor-pointer">
                              <CardContent className="flex items-center gap-3 p-4">
                                <file.icon className="h-8 w-8 text-muted-foreground" />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">{file.name}</p>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span>{file.size}</span>
                                    <span>•</span>
                                    <span>
                                      {isToday(file.modified)
                                        ? `Today at ${formatTime(file.modified)}`
                                        : formatDate(file.modified)}
                                    </span>
                                  </div>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {file.type}
                                </Badge>
                              </CardContent>
                            </Card>
                          ))
                        }
                      </div>
                      { groupName !== sortedGroupKeys[sortedGroupKeys.length - 1] && <Separator /> }
                    </div>
                  )
                })
              }
            </div>
          </div>
        )
      }
    </div>
  )
}