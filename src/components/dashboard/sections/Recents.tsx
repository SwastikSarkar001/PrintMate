"use client";

// Add TrashIcon to your imports
import {
  CalendarIcon,
  FileIcon,
  FolderIcon,
  ImageIcon,
  VideoIcon,
  Loader2,
  EyeIcon,
  DownloadIcon,
  TrashIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "lucide-react";
import { MdClose, MdErrorOutline } from "react-icons/md";
import { useState, useEffect, useCallback, useRef } from "react"; // Kept useRef for pagination

import Image from "next/image";
import { fetchAdvanced } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator"; // Separator is needed for grouping
import { Button } from "@/components/ui/button";
import NoDocumentsFound from "@/ui/NoDocumentsFound";
import { CloudinaryFile } from "@/types/types";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { getCloudinaryUrl } from '@/lib/utils';
import Thumbnail from "@/ui/Thumbnail";

import { pdfjs, Document, Page } from "react-pdf";
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

// --- HELPER FUNCTION FOR ROBUST URLS ---


export type RecentFile = CloudinaryFile & {
  icon: React.ComponentType<{ className?: string }>;
};

// The ApiResponse type for pagination
type ApiResponse = {
  files: CloudinaryFile[];
  nextCursor: string | null;
  hasMore: boolean;
  total: number;
};

const getFileIcon = (
  type: string
): React.ComponentType<{ className?: string }> => {
  switch (type.toLowerCase()) {
    case "image":
      return ImageIcon;
    case "video":
      return VideoIcon;
    case "folder":
      return FolderIcon;
    case "document":
    case "pdf":
      return FileIcon;
    case "spreadsheet":
    case "presentation":
      return FileIcon;
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
    }
    else {
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
    groups[key].sort(
      (a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime()
    );
  });
  return groups;
}

export default function RecentsSection() {
  const { user } = useAuth();
  const [files, setFiles] = useState<RecentFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false); // For infinite scroll
  const [hasMore, setHasMore] = useState(true); // For infinite scroll
  const [nextCursor, setNextCursor] = useState<string | null>(null); // For infinite scroll
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<RecentFile | null>(null);
  const observerRef = useRef<HTMLDivElement>(null); // For infinite scroll

  // --- Re-integrated fetchFiles function with pagination ---
  const fetchFiles = useCallback(
    async (cursor: string | null = null, append = false) => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      try {
        if (!append) setLoading(true);
        else setLoadingMore(true);
        const params = new URLSearchParams({ limit: "20", userId: user.id });
        if (cursor) {
          params.append("cursor", cursor);
        }
        const response = await fetch(`/api/files/recent?${params}`);
        if (!response.ok) {
          throw new Error("Failed to fetch files");
        }
        const data: ApiResponse = await response.json();
        const filesWithIcons: RecentFile[] = data.files.map((file) => ({
          ...file,
          icon: getFileIcon(file.type),
        }));
        if (append) {
          setFiles((prev) => [...prev, ...filesWithIcons]);
        } else {
          setFiles(filesWithIcons);
        }
        setNextCursor(data.nextCursor);
        setHasMore(data.hasMore);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [user?.id]
  );

  useEffect(() => {
    if (user?.id) {
      fetchFiles();
    }
  }, [fetchFiles, user?.id]);

  // --- Infinite Scroll Logic ---
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
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
    return new Date(b + " 1").getTime() - new Date(a + " 1").getTime();
  });

  const handleDownload = (file: RecentFile, e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement("a");
    link.href = file.url;
    link.download = file.name;
    link.click();
  };

  return (
    <div className="dashboard-section">
      <div className="dashboard-section-header">
        <CalendarIcon className="size-5" />
        <h1 className="dashboard-section-header-h1">Recent Documents</h1>
        <Badge variant={error ? "destructive" : "outline"} className="ml-auto">
          {
            loading
            ? "Loading..."
            : error
            ? "Error"
            : `${files.length} document${files.length !== 1 ? "s" : ""}`
          }
        </Badge>
      </div>

      {
        loading ? (
          <div className="flex items-center justify-center h-full p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading...</span>
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 justify-center flex-col h-full p-8 text-muted-foreground">
            <MdErrorOutline className="size-16" />
            <div className="max-w-1/2 text-center">Error: {error}</div>
          </div>
        ) : sortedGroupKeys.length === 0 && !loading ? (
          <NoDocumentsFound />
        ) : (
          <div className="grow overflow-y-auto p-4 sm:p-6">
            <div className="space-y-4 sm:space-y-6">
              {sortedGroupKeys.map((groupName) => (
                <div key={groupName} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-medium">{groupName}</h2>
                    <Badge variant="secondary" className="text-xs">
                      {groupedFiles[groupName].length}{" "}
                      {groupedFiles[groupName].length === 1 ? "item" : "items"}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {groupedFiles[groupName].map((file) => (
                      <RecentFileCard
                        key={file.id}
                        file={file}
                        setSelectedFile={setSelectedFile}
                        handleDownload={handleDownload}
                        setFiles={setFiles}
                      />
                    ))}
                  </div>
                  {groupName !== sortedGroupKeys[sortedGroupKeys.length - 1] && (
                    <Separator />
                  )}
                </div>
              ))}
              {loadingMore && (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading more...</span>
                </div>
              )}
              <div ref={observerRef} className="h-4" />
              {!hasMore && files.length > 0 && (
                <div className="text-center text-sm text-muted-foreground p-4">
                  No more files to load
                </div>
              )}
            </div>
          </div>
        )
      }
      {
        error ||
        loading ||
        (
          selectedFile && (
            <PreviewSelectedFile
              file={selectedFile}
              setSelectedFile={setSelectedFile}
              handleDownload={handleDownload}
            />
          )
        )
      }
    </div>
  );
}

type UtilityProps = {
  file: RecentFile;
  setSelectedFile: React.Dispatch<React.SetStateAction<RecentFile | null>>;
};

function PreviewSelectedFile({
  file,
  setSelectedFile,
  handleDownload,
}: UtilityProps & {
  handleDownload: (file: RecentFile, e: React.MouseEvent) => void;
}) {
  const [numPages, setNumPages] = useState<number>();
  const [scale, setScale] = useState<number>(1.0);
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  }

  const closePreview = () => setSelectedFile(null);
  const isPDF = (file: RecentFile) => file.type === "document";
  const isImage = (file: RecentFile) => file.type === "image";

  const zoomIn = () => setScale((s) => Math.min(s + 0.25, 3));
  const zoomOut = () => setScale((s) => Math.max(s - 0.25, 0.5));
  const resetZoom = () => setScale(1);

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={closePreview}
    >
      <div
        className="relative bg-white dark:bg-gray-900 rounded-lg max-w-4xl min-h-[50vh] max-h-[90vh] w-full overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium truncate pr-4">{file.name}</h3>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => handleDownload(file, e)}
            >
              <DownloadIcon className="h-4 w-4 mr-1" />
              Download
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={closePreview}
              className="cursor-pointer"
            >
              <MdClose className="h-4 w-4 mr-1" />
              Close
            </Button>
          </div>
        </div>
        {
          isPDF(file) && (
            <div className="absolute left-1/2 -translate-x-1/2 z-20 bottom-8 flex items-center justify-between p-2 rounded-full bg-gray-50 dark:bg-gray-800">
              {/* Page Nav */}
              {/* <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={prevPage} disabled={page <= 1}>
                  Prev
                </Button>
                <span>
                  Page <strong>{page}</strong> of <strong>{numPages}</strong>
                </span>
                <Button size="sm" variant="outline" onClick={nextPage} disabled={page >= numPages}>
                  Next
                </Button>
              </div> */}

              {/* Zoom */}
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="cursor-pointer rounded-full p-2!" onClick={zoomOut} disabled={scale <= 0.5}>
                  <ZoomOutIcon className="h-4 w-4" />
                </Button>
                <span className="mx-2">{Math.round(scale * 100)}%</span>
                <Button size="sm" variant="outline" className="cursor-pointer rounded-full p-2!" onClick={zoomIn} disabled={scale >= 3}>
                  <ZoomInIcon className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" className="cursor-pointer rounded-full " onClick={resetZoom}>
                  Reset
                </Button>
              </div>
            </div>
          )
        }
        <div className="p-4 overflow-auto relative">
          {isImage(file) ? (
            <Image
              fill
              src={getCloudinaryUrl(file.publicId, "preview")}
              alt={file.name}
              className="w-full h-auto max-h-full object-contain"
            />
          ) : isPDF(file) ? (
            <Document
              file={getCloudinaryUrl(file.publicId, "preview")}
              onLoadSuccess={onDocumentLoadSuccess}
              className="w-full flex gap-1 flex-col items-center justify-center"
            >
              {
                Array.from (
                  new Array(numPages),
                  (_el, index) => (
                    <Page
                      key={index}
                      scale={scale}
                      pageNumber={index + 1}
                      className="shrink-0"
                    />
                  )
                )
              }
            </Document>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <FileIcon className="h-16 w-16 mb-4" />
              <span>Preview not available for this file type.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

type ExtraUtilityProps = UtilityProps & {
  setFiles: React.Dispatch<React.SetStateAction<RecentFile[]>>;
  handleDownload: (file: RecentFile, e: React.MouseEvent) => void;
};

function RecentFileCard({
  file,
  setSelectedFile,
  setFiles,
  handleDownload,
}: UtilityProps & ExtraUtilityProps) {
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);

  const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  const isToday = (dateString: string) =>
    new Date(dateString).toDateString() === new Date().toDateString();

  const handleFileClick = (file: RecentFile) => setSelectedFile(file);

  const handlePreview = (file: RecentFile, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(file);
  };

  const handleDelete = async (
    fileToDelete: CloudinaryFile,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    const confirmed = window.confirm(
      `Are you sure you want to delete "${fileToDelete.name}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingFileId(fileToDelete.id);

    const promise = fetchAdvanced("/api/files/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileId: fileToDelete.id,
        publicId: fileToDelete.publicId,
        resourceType: fileToDelete.resourceType,
      }),
    });

    toast.promise(promise, {
      loading: "Sending print request...",
      success: (data) => {
        setFiles((currentFiles) =>
          currentFiles.filter((f) => f.id !== fileToDelete.id)
        );
        setDeletingFileId(null);
        return data.message;
      },
      error: (error: Error) => {
        setDeletingFileId(null);
        return error.message
          ? error.message.includes("is not valid JSON")
            ? "Connection error"
            : error.message
          : "Failed to send print request";
        // return error.message ?? 'Failed to send print request';
      },
    });
  };

  return (
    <Card
      key={file.id}
      className="hover:bg-muted/50 transition-colors cursor-pointer relative"
    >
      {deletingFileId === file.id && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg z-10">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      )}
      <CardContent
        className="flex flex-col gap-4 h-full"
        onClick={() => handleFileClick(file)}
      >
        <div className="aspect-square relative bg-muted rounded-lg flex items-center justify-center overflow-hidden">
          <Thumbnail file={file} />
        </div>
        <div className="space-y-1 mt-auto">
          <p className="font-medium text-sm truncate" title={file.name}>
            {file.name}
          </p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{file.size}</span>
            <span>
              {isToday(file.modified)
                ? `Today at ${formatTime(file.modified)}`
                : formatDate(file.modified)}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full *:grow">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => handlePreview(file, e)}
            className="h-6 cursor-pointer px-2 text-xs"
          >
            <EyeIcon className="h-3 w-3 mr-1" />
            Preview
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => handleDownload(file, e)}
            className="h-6 px-2 text-xs"
          >
            <DownloadIcon className="h-3 w-3 mr-1" />
            Download
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-xs text-red-500 hover:text-red-600"
            onClick={(e) => handleDelete(file, e)}
            disabled={!!deletingFileId}
          >
            <TrashIcon className="h-3 w-3 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
