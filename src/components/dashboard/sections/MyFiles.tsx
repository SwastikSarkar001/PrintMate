"use client"

import { useState } from "react"
import {
  ChevronRightIcon,
  FileIcon,
  FolderIcon,
  GridIcon,
  ListIcon,
  MoreVerticalIcon,
  PlusIcon,
  SearchIcon,
  SortAscIcon,
  StarIcon,
  UploadIcon,
} from "lucide-react"

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

const fileStructure = [
  {
    id: 1,
    name: "Documents",
    type: "folder",
    size: "24 files",
    modified: "2024-01-25T10:30:00Z",
    starred: false,
    children: [
      {
        id: 11,
        name: "Reports",
        type: "folder",
        size: "8 files",
        modified: "2024-01-24T16:45:00Z",
        starred: false,
      },
      {
        id: 12,
        name: "Contracts",
        type: "folder",
        size: "5 files",
        modified: "2024-01-23T11:30:00Z",
        starred: true,
      },
      {
        id: 13,
        name: "Meeting Notes.docx",
        type: "document",
        size: "1.2 MB",
        modified: "2024-01-22T15:45:00Z",
        starred: false,
      },
    ],
  },
  {
    id: 2,
    name: "Images",
    type: "folder",
    size: "156 files",
    modified: "2024-01-24T16:45:00Z",
    starred: true,
    children: [
      {
        id: 21,
        name: "Screenshots",
        type: "folder",
        size: "45 files",
        modified: "2024-01-24T14:20:00Z",
        starred: false,
      },
      {
        id: 22,
        name: "Product Photos",
        type: "folder",
        size: "89 files",
        modified: "2024-01-23T09:15:00Z",
        starred: true,
      },
      {
        id: 23,
        name: "Logo_Final.png",
        type: "image",
        size: "2.4 MB",
        modified: "2024-01-22T11:30:00Z",
        starred: false,
      },
    ],
  },
  {
    id: 3,
    name: "Videos",
    type: "folder",
    size: "8 files",
    modified: "2024-01-23T11:30:00Z",
    starred: false,
    children: [
      {
        id: 31,
        name: "Training Videos",
        type: "folder",
        size: "3 files",
        modified: "2024-01-20T09:30:00Z",
        starred: false,
      },
      {
        id: 32,
        name: "Demo_Recording.mp4",
        type: "video",
        size: "125 MB",
        modified: "2024-01-18T13:15:00Z",
        starred: true,
      },
    ],
  },
  {
    id: 4,
    name: "Project Report.pdf",
    type: "pdf",
    size: "3.2 MB",
    modified: "2024-01-25T09:15:00Z",
    starred: true,
  },
  {
    id: 5,
    name: "Presentation.pptx",
    type: "presentation",
    size: "8.7 MB",
    modified: "2024-01-24T14:20:00Z",
    starred: false,
  },
  {
    id: 6,
    name: "Spreadsheet.xlsx",
    type: "spreadsheet",
    size: "1.5 MB",
    modified: "2024-01-22T15:45:00Z",
    starred: false,
  },
]

export default function MyFilesSection() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [sortBy, setSortBy] = useState("name")
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set())
  const [currentPath, setCurrentPath] = useState<string[]>(["My Files"])

  const toggleFolder = (folderId: number) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
    }
    setExpandedFolders(newExpanded)
  }

  const flattenFiles = (files: any[], level = 0): any[] => {
    let result: any[] = []
    files.forEach((file) => {
      result.push({ ...file, level })
      if (file.children && expandedFolders.has(file.id)) {
        result = result.concat(flattenFiles(file.children, level + 1))
      }
    })
    return result
  }

  const filteredFiles = flattenFiles(fileStructure).filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name)
      case "modified":
        return new Date(b.modified).getTime() - new Date(a.modified).getTime()
      case "size":
        return a.size.localeCompare(b.size)
      default:
        return 0
    }
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderIcon className="h-5 w-5" />
          <h1 className="text-2xl font-semibold">My Files</h1>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            {currentPath.map((path, index) => (
              <div key={index} className="flex items-center gap-1">
                {index > 0 && <ChevronRightIcon className="h-3 w-3" />}
                <span>{path}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <UploadIcon className="h-4 w-4" />
            Upload
          </Button>
          <Button size="sm">
            <PlusIcon className="h-4 w-4" />
            New Folder
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search files and folders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32">
              <SortAscIcon className="h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="modified">Modified</SelectItem>
              <SelectItem value="size">Size</SelectItem>
            </SelectContent>
          </Select>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <GridIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <ListIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {viewMode === "list" ? (
        <div className="space-y-1">
          {sortedFiles.map((file) => (
            <Card key={`${file.id}-${file.level}`} className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="flex items-center gap-3 p-3">
                <div className="flex items-center gap-2" style={{ paddingLeft: `${file.level * 20}px` }}>
                  {file.type === "folder" && (
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => toggleFolder(file.id)}>
                      <ChevronRightIcon
                        className={`h-3 w-3 transition-transform ${expandedFolders.has(file.id) ? "rotate-90" : ""}`}
                      />
                    </Button>
                  )}
                  <div className="flex items-center justify-center w-8 h-8 bg-muted rounded">
                    {file.type === "folder" ? (
                      <FolderIcon className="h-4 w-4 text-blue-500" />
                    ) : (
                      <FileIcon className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{file.name}</p>
                    {file.starred && <StarIcon className="h-4 w-4 text-yellow-500 fill-current" />}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="w-20 text-right">{file.size}</span>
                  <span className="w-24 text-right">{formatDate(file.modified)}</span>
                  <Badge variant="outline" className="text-xs w-20 justify-center">
                    {file.type}
                  </Badge>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVerticalIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Open</DropdownMenuItem>
                    <DropdownMenuItem>Rename</DropdownMenuItem>
                    <DropdownMenuItem>Share</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Move to Trash</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {sortedFiles.map((file) => (
            <Card key={`${file.id}-${file.level}`} className="hover:bg-muted/50 transition-colors cursor-pointer group">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center justify-center w-12 h-12 bg-muted rounded-lg">
                    {file.type === "folder" ? (
                      <FolderIcon className="h-6 w-6 text-blue-500" />
                    ) : (
                      <FileIcon className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {file.starred && <StarIcon className="h-4 w-4 text-yellow-500 fill-current" />}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVerticalIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Open</DropdownMenuItem>
                        <DropdownMenuItem>Rename</DropdownMenuItem>
                        <DropdownMenuItem>Share</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Move to Trash</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-sm truncate">{file.name}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{file.size}</span>
                    <Badge variant="outline" className="text-xs">
                      {file.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{formatDate(file.modified)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
