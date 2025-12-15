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
