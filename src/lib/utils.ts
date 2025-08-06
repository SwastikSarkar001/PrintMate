import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function fetchAdvanced(input: string | URL | globalThis.Request, init?: RequestInit) {
  const res = await fetch(input, init);
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(`HTTP ${res.status}: ${errorData.message || res.statusText}`);
  }
  return res.json() as Promise<{ status: boolean; message: string }>;
}

export function getCloudinaryUrl (
  publicId: string | undefined,
  type: "thumbnail" | "preview"
) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName || !publicId) {
    return "";
  }

  // If this publicId is a PDF (no file extension in the ID,
  // so we detect by embedding “.pdf” in the publicId when you save it),
  // you can also store your PDF uploads with a ".pdf" suffix in public_id
  // so this test works:
  const isPdf = publicId.toLowerCase().endsWith('.pdf');

  if (type === "thumbnail") {
    if (isPdf) {
      // First page of the PDF as a 300×300 thumbnail, JPEG
      // pg_0 = page 1; c_fill,h_300,w_300 for a cropped square
      return `https://res.cloudinary.com/${cloudName}/image/upload/pg_0,c_fill,h_300,w_300/${publicId}.jpg`;
    }
    // Image thumbnail as before
    return `https://res.cloudinary.com/${cloudName}/image/upload/c_fill,h_300,w_300/${publicId}`;
  }

  // preview mode: if PDF, serve the full first page as image, else original
  if (isPdf) {
    return `https://res.cloudinary.com/${cloudName}/image/upload/page=0/${publicId}.jpg`;
  }
  return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`;
}