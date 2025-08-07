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

export function getCloudinaryUrl (publicId: string | undefined) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  
  if (!cloudName || !publicId) {
    return "";
  }

  return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`;
}