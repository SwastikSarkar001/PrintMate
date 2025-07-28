'use client'

import { cn } from "@/lib/utils";
import { useRef, useState } from "react";
import { motion } from "motion/react";
import { IconUpload } from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import {
  BsFiletypePng,
  BsFiletypeJpg,
  BsFiletypeSvg,
  BsFiletypePdf,
  BsFileEarmark,
  BsFileEarmarkImage,
  BsFiletypeBmp,
  BsFiletypeGif,
  BsFiletypeHeic,
  BsFiletypeTiff,
} from "react-icons/bs";
import { useAuth } from "@/lib/auth-context";
import { FileUploadResponse } from "@/types/apis";

const mainVariant = {
  initial: {
    x: 0,
    y: 0,
  },
  animate: {
    x: 20,
    y: -20,
    opacity: 0.9,
  },
};

const secondaryVariant = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
};

type FileWithProgress = {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
};

export const FileUpload = () => {
  const { user } = useAuth()
  const [filesWithProgress, setFilesWithProgress] = useState<FileWithProgress[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (newFiles: File[]) => {
    const newFilesWithProgress = newFiles.map(file => ({
      file,
      progress: 0,
      status: 'pending' as const
    }));
    
    setFilesWithProgress((prevFiles) => [...prevFiles, ...newFilesWithProgress]);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: true,
    accept: {
      "image/*": [],
      "application/pdf": []
    },
    onDrop: handleFileChange,
    onDropRejected: (error) => {
      console.log(error);
    },
  });

  // Function to simulate progress for individual files
  const simulateFileProgress = (fileIndex: number): Promise<void> => {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15 + 5; // Random progress between 5-20%
        
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          resolve();
        }
        
        setFilesWithProgress(prev => 
          prev.map((item, index) => 
            index === fileIndex 
              ? { ...item, progress: Math.min(progress, 100), status: 'uploading' as const }
              : item
          )
        );
      }, 100 + Math.random() * 200); // Random interval between 100-300ms
    });
  };

  // Function to upload a single file
  const uploadSingleFile = async (fileWithProgress: FileWithProgress, fileIndex: number): Promise<boolean> => {
    try {
      // Start progress simulation
      const progressPromise = simulateFileProgress(fileIndex);
      
      const form = new FormData();
      form.append('files', fileWithProgress.file);
      form.append('userId', user?.id || '');

      const uploadPromise = fetch('/api/upload', {
        method: 'POST',
        body: form,
      });

      // Wait for both progress simulation and actual upload
      const [, response] = await Promise.all([progressPromise, uploadPromise]);

      const json: FileUploadResponse = await response.json();

      if (json.success) {
        setFilesWithProgress(prev => 
          prev.map((item, index) => 
            index === fileIndex 
              ? { ...item, status: 'success' as const, progress: 100 }
              : item
          )
        );
        return true;
      } else {
        setFilesWithProgress(prev => 
          prev.map((item, index) => 
            index === fileIndex 
              ? { ...item, status: 'error' as const, error: json.message }
              : item
          )
        );
        return false;
      }
    } catch (error) {
      setFilesWithProgress(prev => 
        prev.map((item, index) => 
          index === fileIndex 
            ? { ...item, status: 'error' as const, error: (error as Error).message }
            : item
        )
      );
      return false;
    }
  };

  const handleFileUpload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!filesWithProgress.length || !user) return;
    
    setUploading(true);

    // Reset all files to uploading status
    setFilesWithProgress(prev => 
      prev.map(item => ({ ...item, status: 'uploading' as const, progress: 0 }))
    );

    // Upload all files concurrently
    const uploadPromises = filesWithProgress.map((fileWithProgress, index) => 
      uploadSingleFile(fileWithProgress, index)
    );

    try {
      const results = await Promise.all(uploadPromises);
      
      // Count successful and failed uploads
      const successCount = results.filter(Boolean).length;
      const failureCount = results.length - successCount;

      // Show toast notifications
      if (successCount > 0) {
        toast.success(`${successCount} file${successCount > 1 ? 's' : ''} uploaded successfully!`);
      }
      
      if (failureCount > 0) {
        toast.error(`${failureCount} file${failureCount > 1 ? 's' : ''} failed to upload!`);
      }

      // Update uploaded URLs with successful uploads
      const successfulFiles = filesWithProgress
        .filter((_, index) => results[index])
        .map(item => item.file);
      
      if (successfulFiles.length > 0) {
        // You might want to get the actual URLs from your upload response
        // For now, we'll just clear the files on success
        setTimeout(() => {
          setFilesWithProgress(prev => prev.filter((_, index) => !results[index]));
        }, 2000); // Keep successful files visible for 2 seconds
      }

    } catch (error) {
      console.error('Upload error:', error);
      toast.error('An unexpected error occurred during upload');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="w-full h-full" {...getRootProps()}>
      <motion.div
        onClick={handleClick}
        whileHover="animate"
        className="p-10 h-full group/file block rounded-lg cursor-pointer w-full relative overflow-hidden"
      >
        <input
          ref={fileInputRef}
          id="file-upload-handle"
          type="file"
          accept="image/*,application/pdf"
          onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
          className="hidden"
          {...getInputProps()}
        />
        <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] pointer-events-none">
          <GridPattern />
        </div>
        <div className="flex flex-col items-center justify-center h-full">
          <p className="relative z-20 font-sans font-bold text-foreground text-2xl">
            Upload Files
          </p>
          <p className="relative text-sm z-20 font-sans font-normal text-muted-foreground mt-2">
            Drag or drop your files here or click to upload
          </p>
          <p className="relative text-sm z-20 font-sans font-normal text-muted-foreground mt-0.5">
            Supported formats: *.pdf, *.jpg, *.png, *.jpeg, *.avif, *.webp, *.svg
          </p>
          <div className="relative w-full mt-8 max-w-xl mx-auto overflow-y-auto space-y-4">
            {filesWithProgress.length > 0 && filesWithProgress.map((fileWithProgress, idx) => (
              <FileComponent 
                key={idx} 
                fileWithProgress={fileWithProgress} 
                idx={idx} 
              />
            ))}
            {!filesWithProgress.length && (
              <motion.div
                layoutId="file-upload"
                variants={mainVariant}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
                className={cn(
                  "relative group-hover/file:shadow-2xl z-40 bg-white dark:bg-neutral-900 flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md",
                  "shadow-[0px_10px_50px_rgba(0,0,0,0.1)]"
                )}
              >
                {isDragActive ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-neutral-600 flex flex-col items-center"
                  >
                    Drop it
                    <IconUpload className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                  </motion.p>
                ) : (
                  <IconUpload className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                )}
              </motion.div>
            )}
            {!filesWithProgress.length && (
              <motion.div
                variants={secondaryVariant}
                className="absolute opacity-0 border border-dashed border-sky-400 inset-0 z-30 bg-transparent flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md"
              />
            )}
          </div>
          {filesWithProgress.length > 0 && (
            <button
              type="button"
              className="mt-8 items-center z-40 justify-center w-full max-w-60 px-6 py-2.5 text-center text-black duration-200 bg-white border-2 border-white rounded-full inline-flex hover:bg-transparent hover:border-white hover:text-white focus:outline-none focus-visible:outline-white text-sm focus-visible:ring-white disabled:cursor-not-allowed"
              onClick={handleFileUpload}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Files'}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

function renderFileType(type: string) {
  if (type.startsWith("image/")) {
    if (type === "image/bmp") return <BsFiletypeBmp />
    else if (type === "image/gif") return <BsFiletypeGif />
    else if (type === "image/heic") return <BsFiletypeHeic />
    else if (type === "image/jpeg") return <BsFiletypeJpg />
    else if (type === "image/png") return <BsFiletypePng />
    else if (type === "image/svg+xml") return <BsFiletypeSvg />
    else if (type === "image/tiff") return <BsFiletypeTiff />
    else return <BsFileEarmarkImage />
  }
  else if (type === "application/pdf") return <BsFiletypePdf />
  else return <BsFileEarmark />
}

function fileSize(size: number) {
  if (size < 1024) return size + " B";
  else if (size < 1024 * 1024) return (size / 1024).toFixed(2) + " KB";
  else if (size < 1024 * 1024 * 1024) return (size / (1024 * 1024)).toFixed(2) + " MB";
  else return (size / (1024 * 1024 * 1024)).toFixed(2) + " GB";
}

function FileComponent({ fileWithProgress, idx }: { fileWithProgress: FileWithProgress; idx: number }) {
  const { file, progress, status, error } = fileWithProgress;
  const comp = renderFileType(file.type);
  const size = fileSize(file.size);
  
  const getStatusColor = () => {
    switch (status) {
      case 'success': return 'text-green-600 dark:text-green-400';
      case 'error': return 'text-red-600 dark:text-red-400';
      case 'uploading': return 'text-blue-600 dark:text-blue-400';
      default: return 'text-neutral-600 dark:text-neutral-400';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'success': return 'Uploaded';
      case 'error': return 'Failed';
      case 'uploading': return `${Math.round(progress)}%`;
      default: return 'Ready';
    }
  };

  return (
    <motion.div
      key={"file" + idx}
      layoutId={idx === 0 ? "file-upload" : "file-upload-" + idx}
      className={cn(
        "relative overflow-hidden z-40 gap-4 bg-white dark:bg-neutral-900 flex items-stretch p-4 w-full mx-auto rounded-md",
        "shadow-sm",
        status === 'success' && "border-l-4 border-green-500 h-24 sm:h-28",
        status === 'error' && "border-l-4 border-red-500 h-24 sm:h-28",
        status === 'uploading' && "border-l-4 border-blue-500 h-24 sm:h-28",
        status === 'pending' && "h-24 sm:h-28"
      )}
      onClick={e => e.stopPropagation()}
    >
      {/* Progress bar background */}
      {status === 'uploading' && (
        <div className="absolute inset-0 bg-blue-50 dark:bg-blue-900/20">
          <div 
            className="h-full bg-blue-100 dark:bg-blue-800/30 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      
      <div className="*:size-full relative z-10">
        {comp}
      </div>
      
      <div className="flex flex-col justify-evenly grow relative z-10">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          layout
          className="text-sm sm:text-base text-neutral-700 dark:text-neutral-300 truncate max-w-xs"
        >
          {file.name}
        </motion.p>
        
        <div className="flex items-center justify-between">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            layout
            className="rounded-lg px-2 py-1 w-fit shrink-0 text-xs sm:text-sm text-neutral-600 dark:bg-neutral-800 dark:text-white shadow-input"
          >
            {size}
          </motion.p>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            layout
            className={cn("text-xs sm:text-sm font-medium", getStatusColor())}
          >
            {getStatusText()}
          </motion.p>
        </div>
        
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-red-600 dark:text-red-400 mt-1 truncate"
            title={error}
          >
            Error: {error}
          </motion.p>
        )}
      </div>
      
      {/* Success/Error indicators */}
      {status === 'success' && (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 relative z-10">
          <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
      
      {status === 'error' && (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 relative z-10">
          <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </motion.div>
  );
}

function GridPattern() {
  const columns = 41;
  const rows = 11;
  return (
    <div className="flex bg-gray-100 dark:bg-neutral-900 shrink-0 flex-wrap justify-center items-center gap-x-px gap-y-px scale-105">
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: columns }).map((_, col) => {
          const index = row * columns + col;
          return (
            <div
              key={`${col}-${row}`}
              className={`w-10 h-10 flex shrink-0 rounded-[2px] ${
                index % 2 === 0
                  ? "bg-gray-50 dark:bg-neutral-950"
                  : "bg-gray-50 dark:bg-neutral-950 shadow-[0px_0px_1px_3px_rgba(255,255,255,1)_inset] dark:shadow-[0px_0px_1px_3px_rgba(0,0,0,1)_inset]"
              }`}
            />
          );
        })
      )}
    </div>
  );
}