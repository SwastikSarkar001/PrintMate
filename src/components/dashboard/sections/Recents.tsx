'use client';

import { CalendarIcon, FileIcon, FolderIcon, ImageIcon, VideoIcon, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import NoDocumentsFound from "@/ui/NoDocumentsFound";
import { CloudinaryFile } from "@/types/types";

type RecentFile = CloudinaryFile & {
  icon: React.ComponentType<{ className?: string }>;
};

type ApiResponse = {
  files: CloudinaryFile[];
  nextCursor: string | null;
  hasMore: boolean;
  total: number;
};

const getFileIcon = (type: string): React.ComponentType<{ className?: string }> => {
  switch (type) {
    case 'image':
      return ImageIcon;
    case 'video':
      return VideoIcon;
    case 'folder':
      return FolderIcon;
    default:
      return FileIcon;
  }
};

function groupFilesByMonth(files: RecentFile[]) {
  const now = new Date();
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const groups: { [key: string]: RecentFile[] } = {};

  files.forEach((file) => {
    const fileDate = new Date(file.modified);
    const fileMonth = new Date(fileDate.getFullYear(), fileDate.getMonth(), 1);

    let groupKey: string;
    if (fileMonth.getTime() === currentMonth.getTime()) {
      groupKey = "This Month";
    } else {
      groupKey = fileDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    }

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(file);
  });

  Object.keys(groups).forEach((key) => {
    groups[key].sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime());
  });

  return groups;
}

export default function RecentsSection() {
  const [files, setFiles] = useState<RecentFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const observerRef = useRef<HTMLDivElement>(null);

  const fetchFiles = useCallback(async (cursor: string | null = null, append = false) => {
    try {
      if (!append) setLoading(true);
      else setLoadingMore(true);

      const params = new URLSearchParams({
        limit: '20',
        // folder: 'your-folder-name/', // Add your folder if needed
      });

      if (cursor) {
        params.append('cursor', cursor);
      }

      const response = await fetch(`/api/files/recent?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }

      const data: ApiResponse = await response.json();
      
      const filesWithIcons: RecentFile[] = data.files.map(file => ({
        ...file,
        icon: getFileIcon(file.type),
      }));

      if (append) {
        setFiles(prev => [...prev, ...filesWithIcons]);
      } else {
        setFiles(filesWithIcons);
      }

      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching files:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !loadingMore && !loading) {
          fetchFiles(nextCursor, true);
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = observerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [fetchFiles, nextCursor, hasMore, loadingMore, loading]);

  const groupedFiles = groupFilesByMonth(files);

  const sortedGroupKeys = Object.keys(groupedFiles).sort((a, b) => {
    if (a === "This Month") return -1;
    if (b === "This Month") return 1;

    const dateA = new Date(a + " 1");
    const dateB = new Date(b + " 1");
    return dateB.getTime() - dateA.getTime();
  });

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const isToday = (dateString: string) => {
    const fileDate = new Date(dateString);
    const today = new Date();
    return fileDate.toDateString() === today.toDateString();
  };

  const handleFileClick = (file: RecentFile) => {
    // Handle file click - open in new tab, download, etc.
    window.open(file.url, '_blank');
  };

  if (loading) {
    return (
      <div className="dashboard-section">
        <div className="dashboard-section-header">
          <CalendarIcon className="size-5" />
          <h1 className="dashboard-section-header-h1">Recent Documents</h1>
        </div>
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading files...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-section">
        <div className="dashboard-section-header">
          <CalendarIcon className="size-5" />
          <h1 className="dashboard-section-header-h1">Recent Documents</h1>
        </div>
        <div className="flex items-center justify-center p-8 text-red-500">
          <span>Error: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-section">
      <div className="dashboard-section-header">
        <CalendarIcon className="size-5" />
        <h1 className="dashboard-section-header-h1">Recent Documents</h1>
        <Badge variant="outline" className="ml-auto">
          {files.length} documents
        </Badge>
      </div>
      
      {sortedGroupKeys.length === 0 ? (
        <NoDocumentsFound />
      ) : (
        <div className="grow overflow-y-auto p-4 sm:p-6">
          <div className="space-y-4 sm:space-y-6">
            {sortedGroupKeys.map((groupName) => {
              const groupFiles = groupedFiles[groupName];

              return (
                <div key={groupName} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-medium">{groupName}</h2>
                    <Badge variant="secondary" className="text-xs">
                      {groupFiles.length} {groupFiles.length === 1 ? "item" : "items"}
                    </Badge>
                  </div>
                  <div className="flex flex-col items-stretch gap-2">
                    {groupFiles.map(file => (
                      <Card 
                        key={file.id} 
                        className="py-0 hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => handleFileClick(file)}
                      >
                        <CardContent className="flex items-center gap-3 p-4">
                          <file.icon className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate" title={file.name}>
                              {file.name}
                            </p>
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
                          <Badge variant="outline" className="text-xs flex-shrink-0">
                            {file.type}
                          </Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  {groupName !== sortedGroupKeys[sortedGroupKeys.length - 1] && <Separator />}
                </div>
              );
            })}
            
            {/* Loading more indicator */}
            {loadingMore && (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading more...</span>
              </div>
            )}
            
            {/* Infinite scroll trigger */}
            <div ref={observerRef} className="h-4" />
            
            {/* End of results indicator */}
            {!hasMore && files.length > 0 && (
              <div className="text-center text-sm text-muted-foreground p-4">
                No more files to load
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}