"use client"

import { FileIcon, FolderIcon, HardDriveIcon, ImageIcon, VideoIcon, FileTextIcon, ArchiveIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const storageData = {
  used: 45.2, // GB
  total: 100, // GB
  breakdown: [
    { type: "Images", size: 18.5, color: "bg-blue-500", icon: ImageIcon },
    { type: "Videos", size: 12.8, color: "bg-green-500", icon: VideoIcon },
    { type: "Documents", size: 8.3, color: "bg-yellow-500", icon: FileTextIcon },
    { type: "Archives", size: 3.2, color: "bg-purple-500", icon: ArchiveIcon },
    { type: "Other", size: 2.4, color: "bg-gray-500", icon: FileIcon },
  ],
}

const largestFiles = [
  {
    id: 1,
    name: "Project_Video_Final.mp4",
    size: "2.8 GB",
    sizeBytes: 2800000000,
    type: "video",
    path: "/Videos/Projects",
    icon: VideoIcon,
  },
  {
    id: 2,
    name: "Design_Assets_Archive.zip",
    size: "1.9 GB",
    sizeBytes: 1900000000,
    type: "archive",
    path: "/Archives",
    icon: ArchiveIcon,
  },
  {
    id: 3,
    name: "Photo_Library_2024",
    size: "1.5 GB",
    sizeBytes: 1500000000,
    type: "folder",
    path: "/Images",
    icon: FolderIcon,
  },
  {
    id: 4,
    name: "Presentation_Master.pptx",
    size: "890 MB",
    sizeBytes: 890000000,
    type: "presentation",
    path: "/Documents",
    icon: FileIcon,
  },
  {
    id: 5,
    name: "Database_Backup.sql",
    size: "650 MB",
    sizeBytes: 650000000,
    type: "database",
    path: "/Backups",
    icon: FileIcon,
  },
  {
    id: 6,
    name: "Raw_Images_Folder",
    size: "580 MB",
    sizeBytes: 580000000,
    type: "folder",
    path: "/Images/Raw",
    icon: FolderIcon,
  },
  {
    id: 7,
    name: "Software_Installer.dmg",
    size: "450 MB",
    sizeBytes: 450000000,
    type: "installer",
    path: "/Downloads",
    icon: FileIcon,
  },
  {
    id: 8,
    name: "Meeting_Recording_Jan.mp4",
    size: "380 MB",
    sizeBytes: 380000000,
    type: "video",
    path: "/Videos/Meetings",
    icon: VideoIcon,
  },
  {
    id: 9,
    name: "Client_Presentation_Final.pptx",
    size: "320 MB",
    sizeBytes: 320000000,
    type: "presentation",
    path: "/Documents/Presentations",
    icon: FileIcon,
  },
  {
    id: 10,
    name: "Product_Images_Collection",
    size: "290 MB",
    sizeBytes: 290000000,
    type: "folder",
    path: "/Images/Products",
    icon: FolderIcon,
  },
]

const allFiles = [
  ...largestFiles,
  {
    id: 11,
    name: "Budget_2024.xlsx",
    size: "45 MB",
    sizeBytes: 45000000,
    type: "spreadsheet",
    path: "/Documents/Finance",
    icon: FileIcon,
  },
  {
    id: 12,
    name: "Team_Meeting_Notes.docx",
    size: "12 MB",
    sizeBytes: 12000000,
    type: "document",
    path: "/Documents/Meetings",
    icon: FileIcon,
  },
  {
    id: 13,
    name: "Logo_Variations",
    size: "8.5 MB",
    sizeBytes: 8500000,
    type: "folder",
    path: "/Images/Branding",
    icon: FolderIcon,
  },
  {
    id: 14,
    name: "Project_Timeline.pdf",
    size: "3.2 MB",
    sizeBytes: 3200000,
    type: "pdf",
    path: "/Documents/Projects",
    icon: FileIcon,
  },
  {
    id: 15,
    name: "Contact_List.csv",
    size: "890 KB",
    sizeBytes: 890000,
    type: "spreadsheet",
    path: "/Documents/Data",
    icon: FileIcon,
  },
].sort((a, b) => b.sizeBytes - a.sizeBytes)

export default function StorageSection() {
  const usagePercentage = (storageData.used / storageData.total) * 100
  const freeSpace = storageData.total - storageData.used

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HardDriveIcon className="h-5 w-5" />
          <h1 className="text-2xl font-semibold">Storage Management</h1>
        </div>
        <Badge variant="outline" className="text-sm">
          {usagePercentage.toFixed(1)}% used
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Storage Usage</CardTitle>
            <CardDescription>
              {storageData.used} GB of {storageData.total} GB used
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Used: {storageData.used} GB</span>
                <span>Free: {freeSpace.toFixed(1)} GB</span>
              </div>
              <Progress value={usagePercentage} className="h-3" />
              <div className="text-xs text-muted-foreground text-center">{usagePercentage.toFixed(1)}% used</div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-medium">Storage Breakdown</h3>
              <div className="space-y-3">
                {storageData.breakdown.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${item.color}`} />
                      <div className="flex items-center gap-2">
                        <item.icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{item.type}</span>
                      </div>
                    </div>
                    <div className="text-sm font-medium">{item.size} GB</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Largest Files</CardTitle>
            <CardDescription>Top 10 files taking up the most space</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {largestFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-center w-8 h-8 bg-muted rounded">
                    <file.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{file.path}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{file.size}</div>
                    <Badge variant="outline" className="text-xs">
                      {file.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="largest" className="w-full">
        <TabsList>
          <TabsTrigger value="largest">Largest Files</TabsTrigger>
          <TabsTrigger value="all">All Files by Size</TabsTrigger>
          <TabsTrigger value="tips">Storage Tips</TabsTrigger>
        </TabsList>

        <TabsContent value="largest" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Files Over 100 MB</CardTitle>
              <CardDescription>Consider reviewing these large files for cleanup</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {largestFiles
                  .filter((file) => file.sizeBytes > 100000000)
                  .map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <file.icon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-muted-foreground">{file.path}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{file.size}</div>
                        <Badge variant="outline" className="text-xs">
                          {file.type}
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Files Ordered by Size</CardTitle>
              <CardDescription>Complete list of files sorted by storage usage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {allFiles.map((file, index) => (
                  <div key={file.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-6">{index + 1}</span>
                      <file.icon className="h-4 w-4 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{file.path}</p>
                      </div>
                    </div>
                    <div className="text-sm font-medium">{file.size}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tips" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Storage Optimization Tips</CardTitle>
              <CardDescription>Ways to free up space and manage your storage better</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Clean up large files</h4>
                  <p className="text-sm text-muted-foreground">
                    Review and delete large files you no longer need, especially videos and archives.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Empty trash regularly</h4>
                  <p className="text-sm text-muted-foreground">
                    Files in trash still count toward your storage quota until permanently deleted.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Compress old files</h4>
                  <p className="text-sm text-muted-foreground">
                    Archive old documents and images to save space while keeping them accessible.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Use external storage</h4>
                  <p className="text-sm text-muted-foreground">
                    Move large media files to external storage or cloud services for long-term storage.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Duplicate file detection</h4>
                  <p className="text-sm text-muted-foreground">
                    Regularly scan for and remove duplicate files that waste storage space.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Optimize image formats</h4>
                  <p className="text-sm text-muted-foreground">
                    Convert large image files to more efficient formats like WebP or JPEG.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
