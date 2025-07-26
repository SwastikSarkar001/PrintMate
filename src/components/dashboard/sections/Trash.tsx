"use client"

import { useState } from "react"
import { FileIcon, FolderIcon, MoreVerticalIcon, SearchIcon, TrashIcon, UndoIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"

const trashedFiles = [
  {
    id: 1,
    name: "Old Project Files",
    type: "folder",
    size: "12 files",
    deletedDate: "2024-01-20T10:30:00Z",
    originalPath: "/Documents/Projects",
  },
  {
    id: 2,
    name: "Draft_v1.docx",
    type: "document",
    size: "2.1 MB",
    deletedDate: "2024-01-18T16:45:00Z",
    originalPath: "/Documents",
  },
  {
    id: 3,
    name: "Screenshot_old.png",
    type: "image",
    size: "1.8 MB",
    deletedDate: "2024-01-15T11:30:00Z",
    originalPath: "/Images",
  },
  {
    id: 4,
    name: "Backup.zip",
    type: "archive",
    size: "25.4 MB",
    deletedDate: "2024-01-12T09:15:00Z",
    originalPath: "/Downloads",
  },
  {
    id: 5,
    name: "temp_data.csv",
    type: "spreadsheet",
    size: "890 KB",
    deletedDate: "2024-01-10T14:20:00Z",
    originalPath: "/Documents/Data",
  },
  {
    id: 6,
    name: "unused_assets",
    type: "folder",
    size: "8 files",
    deletedDate: "2024-01-08T15:45:00Z",
    originalPath: "/Design",
  },
]

export default function TrashSection() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredFiles = trashedFiles.filter((file) => file.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "1 day ago"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const handleRestore = (fileId: number) => {
    console.log(`Restoring file ${fileId}`)
    // Handle restore logic
  }

  const handlePermanentDelete = (fileId: number) => {
    console.log(`Permanently deleting file ${fileId}`)
    // Handle permanent delete logic
  }

  const handleEmptyTrash = () => {
    console.log("Emptying trash")
    // Handle empty trash logic
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrashIcon className="h-5 w-5" />
          <h1 className="text-2xl font-semibold">Trash</h1>
        </div>
        <Button variant="destructive" size="sm" onClick={handleEmptyTrash} disabled={filteredFiles.length === 0}>
          <TrashIcon className="h-4 w-4" />
          Empty Trash
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search trash..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredFiles.length} {filteredFiles.length === 1 ? "item" : "items"} in trash
        </div>
      </div>

      {filteredFiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <TrashIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Trash is empty</h3>
          <p className="text-muted-foreground">
            {searchQuery ? "No items match your search." : "Items you delete will appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredFiles.map((file) => (
            <Card key={file.id} className="hover:bg-muted/50 transition-colors">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex items-center justify-center w-8 h-8 bg-muted rounded">
                  {file.type === "folder" ? (
                    <FolderIcon className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <FileIcon className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{file.name}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Deleted {formatDate(file.deletedDate)}</span>
                    <span>•</span>
                    <span>From {file.originalPath}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="w-20 text-right">{file.size}</span>
                  <Badge variant="outline" className="text-xs w-20 justify-center">
                    {file.type}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleRestore(file.id)}>
                    <UndoIcon className="h-4 w-4" />
                    Restore
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVerticalIcon className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleRestore(file.id)}>
                        <UndoIcon className="h-4 w-4" />
                        Restore
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive" onClick={() => handlePermanentDelete(file.id)}>
                        <TrashIcon className="h-4 w-4" />
                        Delete Forever
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredFiles.length > 0 && (
        <div className="text-xs text-muted-foreground text-center p-4 bg-muted/30 rounded-lg">
          Items in trash will be automatically deleted after 30 days
        </div>
      )}
    </div>
  )
}
