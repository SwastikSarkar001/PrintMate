'use client'

import { FileUpload } from '@/components/ui/file-upload'
import { useState } from 'react'

export default function UploadSection() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [files, setFiles] = useState<File[]>([]);
  const handleFileUpload = (files: File[]) => {
    setFiles(files);
    console.log(files);
  };

  return (
    <div className="dashboard-section">
      {/* <div className="dashboard-section-header">
        <UploadIcon className="size-5" />
        <h1 className="dashboard-section-header-h1">Upload Files</h1>
      </div> */}
      <div className='grow p-4 sm:p-6'>
        <FileUpload onChange={handleFileUpload} />
      </div>
    </div>
  )
}
