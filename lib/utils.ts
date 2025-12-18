import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Constructs a full image URL from storage path
 * @param imagePath - The image path/name from the database
 * @param name - Optional name (unused, kept for backward compatibility)
 * @returns Full URL to the image or placeholder if no path provided
 */
export function getImageUrl(imagePath: string | null | undefined, name?: string): string {
  if (!imagePath) {
    return "/placeholder.png";
  }
  if (imagePath.startsWith("http")) return imagePath
  
  const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || "https://violet-bison-661615.hostingersite.com/storage/"
  return `${STORAGE_URL}${imagePath.replace(/^\//, "")}`
}

/**
 * Formats a URL to ensure it has a proper protocol (http:// or https://)
 * @param url - The URL to format
 * @returns Formatted URL with protocol
 */
export function formatExternalUrl(url: string | null | undefined): string | null {
  if (!url) return null
  
  // Remove any leading/trailing whitespace
  url = url.trim()
  
  // If it already has a protocol, return as is
  if (url.match(/^https?:\/\//i)) {
    return url
  }
  
  // If it starts with //, add https:
  if (url.startsWith('//')) {
    return `https:${url}`
  }
  
  // Otherwise, add https://
  return `https://${url}`
}
