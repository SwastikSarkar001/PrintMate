'use client'

import { useState } from 'react'
import { RecentFile } from '@/components/dashboard/sections/Recents'
import { getCloudinaryUrl } from '@/lib/utils'
import Image from 'next/image'
import { Document, Page } from 'react-pdf'

export default function Thumbnail({ file }: { file: RecentFile }) {
  const [error, setError] = useState<string | null>(null)
  return (
    <>
      {
        (file.type === 'image') && (
          <Image
            fill
            src={getCloudinaryUrl(file.publicId, "thumbnail")}
            alt={file.name}
            className="size-full object-cover"
            loading="lazy"
          />
        )
      }
      {
        (file.type === 'document' && error) && (
          <div className="flex items-center justify-center w-full h-full bg-muted text-muted-foreground">
            <span>No preview available</span>
          </div>
        )
      }
      {
        (file.type === 'document' && !error) && (
          <Document
            file={getCloudinaryUrl(file.publicId, "preview")}
            className="size-full"
            renderMode="canvas"
            onLoadError={err => setError(err.message)}
            onLoadSuccess={() => setError(null)}
          >
            <Page
              pageNumber={1}
              className='size-full object-cover '
              renderAnnotationLayer={false}
              renderTextLayer={false}
            />
          </Document>
        )
      }
      {
        (file.type !== 'image' && file.type !== 'document') && (
          <div className="flex items-center justify-center w-full h-full  bg-muted text-muted-foreground">
            <span>No preview available</span>
          </div>
        )
      }
    </>
  )
}