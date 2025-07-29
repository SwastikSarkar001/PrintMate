'use client';

// Add TrashIcon to your imports
import { CalendarIcon, FileIcon, FolderIcon, ImageIcon, VideoIcon, Loader2, EyeIcon, DownloadIcon, TrashIcon } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react"; // Kept useRef for pagination

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator"; // Separator is needed for grouping
import { Button } from "@/components/ui/button";
import NoDocumentsFound from "@/ui/NoDocumentsFound";
import { CloudinaryFile } from "@/types/types";
import { useAuth } from "@/lib/auth-context";

// --- HELPER FUNCTION FOR ROBUST URLS ---
const getCloudinaryUrl = (publicId: string | undefined, type: 'thumbnail' | 'preview') => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName || !publicId) {
    // Return a placeholder or empty string if config is missing to prevent crashes
    return "";
  }

  // Use a small, cropped thumbnail for the grid view to save bandwidth
  if (type === 'thumbnail') {
    return `https://res.cloudinary.com/${cloudName}/image/upload/c_fill,h_300,w_300/${publicId}`;
  }

  // Use the full image delivery for the large preview modal
  return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`;
};

// RecentFile type now includes the icon property for rendering
type RecentFile = CloudinaryFile & {
  icon: React.ComponentType<{ className?: string }>;
};

// The ApiResponse type for pagination
type ApiResponse = {
  files: CloudinaryFile[];
  nextCursor: string | null;
  hasMore: boolean;
  total: number;
};

const getFileIcon = (type: string): React.ComponentType<{ className?: string }> => {
  switch (type.toLowerCase()) {
    case 'image': return ImageIcon;
    case 'video': return VideoIcon;
    case 'folder': return FolderIcon;
    case 'document':
    case 'pdf': return FileIcon;
    case 'spreadsheet':
    case 'presentation': return FileIcon;
    default: return FileIcon;
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
      groupKey = fileDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    }
    if (!groups[groupKey]) { groups[groupKey] = []; }
    groups[groupKey].push(file);
  });
  Object.keys(groups).forEach((key) => {
    groups[key].sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime());
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
  // State to track the file currently being deleted
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
  const observerRef = useRef<HTMLDivElement>(null); // For infinite scroll

  // --- Re-integrated fetchFiles function with pagination ---
  const fetchFiles = useCallback(async (cursor: string | null = null, append = false) => {
    if (!user?.id) { setLoading(false); return; }
    try {
      if (!append) setLoading(true); else setLoadingMore(true);
      const params = new URLSearchParams({ limit: '20', userId: user.id });
      if (cursor) { params.append('cursor', cursor); }
      const response = await fetch(`/api/files/recent?${params}`);
      if (!response.ok) { throw new Error('Failed to fetch files'); }
      const data: ApiResponse = await response.json();
      const filesWithIcons: RecentFile[] = data.files.map(file => ({ ...file, icon: getFileIcon(file.type) }));
      if (append) { setFiles(prev => [...prev, ...filesWithIcons]); } else { setFiles(filesWithIcons); }
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false); setLoadingMore(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) { fetchFiles(); }
  }, [fetchFiles, user?.id]);

  // --- Infinite Scroll Logic ---
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          fetchFiles(nextCursor, true);
        }
      }, { threshold: 0.1 }
    );
    const currentRef = observerRef.current;
    if (currentRef) { observer.observe(currentRef); }
    return () => { if (currentRef) { observer.unobserve(currentRef); } };
  }, [fetchFiles, nextCursor, hasMore, loadingMore, loading]);

  // --- ADDED: Delete handler function ---
  const handleDelete = async (fileToDelete: CloudinaryFile, e: React.MouseEvent) => {
    e.stopPropagation();

    const confirmed = window.confirm(`Are you sure you want to delete "${fileToDelete.name}"? This action cannot be undone.`);
    if (!confirmed) return;

    setDeletingFileId(fileToDelete.id);

    try {
      const response = await fetch('/api/files/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId: fileToDelete.id,
          publicId: fileToDelete.publicId,
          resourceType: fileToDelete.resourceType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete file.');
      }

      // Update UI instantly by removing the file from the local state
      setFiles(currentFiles => currentFiles.filter(f => f.id !== fileToDelete.id));

    } catch (error) {
      console.error('Deletion Error:', error);
      alert(error instanceof Error ? error.message : 'An unknown error occurred during deletion.');
    } finally {
      setDeletingFileId(null);
    }
  };


  const groupedFiles = groupFilesByMonth(files);
  const sortedGroupKeys = Object.keys(groupedFiles).sort((a, b) => {
    if (a === "This Month") return -1; if (b === "This Month") return 1;
    return new Date(b + " 1").getTime() - new Date(a + " 1").getTime();
  });

  const formatTime = (dateString: string) => new Date(dateString).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const isToday = (dateString: string) => new Date(dateString).toDateString() === new Date().toDateString();

  const handleFileClick = (file: RecentFile) => setSelectedFile(file);
  const handleDownload = (file: RecentFile, e: React.MouseEvent) => {
    e.stopPropagation();
    // Use the original URL for download to get the original file
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.click();
  };
  const handlePreview = (file: RecentFile, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(file);
  };
  const closePreview = () => setSelectedFile(null);

  // --- SIMPLIFIED AND RELIABLE CHECKS ---
  const isPDF = (file: RecentFile) => file.type === 'document';
  const isImage = (file: RecentFile) => file.type === 'image';

  if (loading) { return <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /><span className="ml-2">Loading...</span></div>; }
  if (error) { return <div className="p-8 text-red-500">Error: {error}</div>; }

  return (
    <div className="dashboard-section">
      <div className="dashboard-section-header">
        <CalendarIcon className="size-5" />
        <h1 className="dashboard-section-header-h1">Recent Documents</h1>
        <Badge variant="outline" className="ml-auto">{files.length} documents</Badge>
      </div>

      {sortedGroupKeys.length === 0 && !loading ? <NoDocumentsFound /> : (
        <div className="grow overflow-y-auto p-4 sm:p-6">
          <div className="space-y-4 sm:space-y-6">
            {sortedGroupKeys.map((groupName) => (
              <div key={groupName} className="space-y-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-medium">{groupName}</h2>
                  <Badge variant="secondary" className="text-xs">{groupedFiles[groupName].length} {groupedFiles[groupName].length === 1 ? "item" : "items"}</Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {groupedFiles[groupName].map(file => (
                    <Card key={file.id} className="hover:bg-muted/50 transition-colors cursor-pointer group relative">
                      {/* Deletion Overlay */}
                      {deletingFileId === file.id && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg z-10">
                          <Loader2 className="h-8 w-8 animate-spin text-white" />
                        </div>
                      )}
                      <CardContent className="p-4 flex flex-col h-full" onClick={() => handleFileClick(file)}>
                        <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                          {isImage(file) ? (
                            <img src={getCloudinaryUrl(file.publicId, 'thumbnail')} alt={file.name} className="w-full h-full object-cover" loading="lazy" />
                          ) : isPDF(file) ? (
                            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                              <FileIcon className="h-12 w-12 mb-2" />
                              <span className="text-xs text-center">PDF Document</span>
                            </div>
                          ) : (
                            <file.icon className="h-12 w-12 text-muted-foreground" />
                          )}
                        </div>
                        {/* --- RESTORED FILE INFO SECTION --- */}
                        <div className="space-y-2 mt-auto">
                          <p className="font-medium text-sm truncate" title={file.name}>{file.name}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{file.size}</span>
                            <span>{isToday(file.modified) ? `Today at ${formatTime(file.modified)}` : formatDate(file.modified)}</span>
                          </div>
                          {/* Apply flex-wrap here */}
                          <div className="flex items-center gap-1 pt-1 opacity-0 group-hover:opacity-100 transition-opacity flex-wrap">
                            <Button size="sm" variant="ghost" onClick={(e) => handlePreview(file, e)} className="h-6 px-2 text-xs"><EyeIcon className="h-3 w-3 mr-1" />Preview</Button>
                            <Button size="sm" variant="ghost" onClick={(e) => handleDownload(file, e)} className="h-6 px-2 text-xs"><DownloadIcon className="h-3 w-3 mr-1" />Download</Button>
                            {/* --- ADDED: Delete Button --- */}
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
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {groupName !== sortedGroupKeys[sortedGroupKeys.length - 1] && <Separator />}
              </div>
            ))}
            {loadingMore && <div className="flex items-center justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /><span className="ml-2">Loading more...</span></div>}
            <div ref={observerRef} className="h-4" />
            {!hasMore && files.length > 0 && <div className="text-center text-sm text-muted-foreground p-4">No more files to load</div>}
          </div>
        </div>
      )}

      {/* --- CORRECTED FILE PREVIEW MODAL --- */}
      {selectedFile && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={closePreview}>
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-4xl max-h-[90vh] w-full overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-medium truncate pr-4">{selectedFile.name}</h3>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button size="sm" variant="outline" onClick={(e) => handleDownload(selectedFile, e)}><DownloadIcon className="h-4 w-4 mr-1" />Download</Button>
                <Button size="sm" variant="ghost" onClick={closePreview}>Close</Button>
              </div>
            </div>
            <div className="p-4 overflow-auto">
              {isImage(selectedFile) ? (
                <img src={getCloudinaryUrl(selectedFile.publicId, 'preview')} alt={selectedFile.name} className="w-full h-auto max-h-full object-contain" />
              ) : isPDF(selectedFile) ? (
                <iframe
                  src={getCloudinaryUrl(selectedFile.publicId, 'preview')}
                  className="w-full h-[calc(90vh-100px)] border-0"
                  title={selectedFile.name}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground"><FileIcon className="h-16 w-16 mb-4" /><span>Preview not available for this file type.</span></div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}