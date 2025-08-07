'use client'

import { useEffect, useMemo, useState } from 'react';
import { RecentFile } from '@/components/dashboard/sections/Recents'
import { getCloudinaryUrl } from '@/lib/utils'
import { Loader2Icon } from 'lucide-react'
import Image from 'next/image'
import { Document, Page, usePageContext } from 'react-pdf'
import invariant from 'tiny-invariant';

export default function Thumbnail({ file }: { file: RecentFile }) {
  return (
    <>
      {
        (file.type === 'image') ? (
          <Image
            fill
            src={getCloudinaryUrl(file.publicId)}
            alt={file.name}
            className="object-contain"
            loading="lazy"
          />
        ) : (file.type === 'document') ? (
          <Document
            file={getCloudinaryUrl(file.publicId)}
            className="relative flex overflow-hidden items-center justify-center size-full bg-muted"
            loading={<LoadingThumbnail />}
            error={<DefaultThumbnail />}
          >
            <Page
              loading={<LoadingThumbnail />}
              error={<DefaultThumbnail />}
              pageNumber={1}
              renderMode='custom'
              customRenderer={CustomRenderer}
              className='size-full bg-muted! flex items-center justify-center'
              renderAnnotationLayer={false}
              renderTextLayer={false}
            />
          </Document>
        ) : <DefaultThumbnail />
      }
    </>
  )
}

function LoadingThumbnail() {
  return (
    <div className="flex items-center justify-center gap-2 bg-muted text-muted-foreground">
      <Loader2Icon className="animate-spin h-6 w-6" />
      <span>Loading...</span>
    </div>
  )
}

function DefaultThumbnail() {
  return (
    <div className="flex items-center justify-center bg-muted text-muted-foreground">
      <span>No preview available</span>
    </div>
  )
}


function CustomRenderer() {
  const pageContext = usePageContext()
  invariant(pageContext, 'Unable to find Page context.')
  const { _className, page, rotate, scale } = pageContext
  invariant(page, 'Attempted to render page canvas, but no page was specified.')

  const viewport = useMemo(
    () => page.getViewport({ scale, rotation: rotate }),
    [page, rotate, scale]
  )

  const [thumbnailSrc, setThumbnailSrc] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height

    const renderContext = {
      canvasContext: canvas.getContext('2d', { alpha: false })!,
      viewport,
    }
    const task = page.render(renderContext)

    task.promise
      .then(() => {
        if (!cancelled) {
          setThumbnailSrc(canvas.toDataURL())
        }
      })
      .catch(() => {
        // you could set an error placeholder here if you like
      })

    return () => {
      cancelled = true
      task.cancel()
    }
  }, [page, viewport])

  return (
    <>
      {
        !thumbnailSrc ? (
          <div
            className={`${_className}__image bg-muted size-full flex items-center justify-center`}
          >
            <LoadingThumbnail />
          </div>
        ) : (
          <Image
            alt="PDF page thumbnail"
            src={thumbnailSrc}
            loading="lazy"
            className={`${_className}__image object-contain bg-muted`}
            fill
          />
        )
      }
    </>
  )
}