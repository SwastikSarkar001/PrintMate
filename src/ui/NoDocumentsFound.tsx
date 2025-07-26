import React from 'react'

export default function NoDocumentsFound() {
  return (
    <div className="flex flex-col items-center gap-4 justify-center h-full text-muted-foreground">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className='w-2/5 max-w-48 max-h-48 aspect-square'
        viewBox="0 0 64 64"
      >
        <g data-name="outline color">
          <path
            fill="#f57c00"
            d="M25.26 60A3.26 3.26 0 0 1 22 56.74V30a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1v3h19a1 1 0 0 1 1 1v5a1 1 0 1 1-2 0v-4H34a1 1 0 0 1-1-1v-3h-9v25.74A1.26 1.26 0 0 0 25.26 58a1 1 0 1 1 0 2"
          />
          <path
            fill="#f57c00"
            d="M59 60H25.26a1 1 0 0 1 0-2 1.25 1.25 0 0 0 1.25-1.26V39a1 1 0 0 1 1-1H59a1 1 0 0 1 1 1v20a1 1 0 0 1-1 1m-30.74-2H58V40H28.51v16.74a3.3 3.3 0 0 1-.25 1.26"
          />
          <path
            fill="#999"
            d="M19 54a1 1 0 0 1-.69-.27 5.2 5.2 0 0 1-1.11-1.57L4.56 23.83a5 5 0 0 1 2.52-6.6l20.17-9a1 1 0 0 1 .82 1.77L7.9 19a3 3 0 0 0-1.52 4L19 51.32a3 3 0 0 0 .67.94A1 1 0 0 1 19 54"
          />
          <path
            fill="#999"
            d="M55.13 31a.8.8 0 0 1-.26 0 1 1 0 0 1-.7-1.22l3.73-13.67a3 3 0 0 0-.29-2.28 2.94 2.94 0 0 0-1.82-1.4L32.65 6.08A3 3 0 0 0 29 8.2l-5 18.06a1 1 0 0 1-1.93-.52L27 7.67a5 5 0 0 1 6.14-3.51l23.17 6.34a4.9 4.9 0 0 1 3 2.33 5 5 0 0 1 .49 3.8l-3.71 13.63a1 1 0 0 1-.96.74"
          />
        </g>
      </svg>
      <div className='text-center'>No recent documents found</div>
    </div>
  )
}
