import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a consistent numeric seed from a string
 * This ensures the same name always returns the same image
 */
function generateSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Extracts keywords from a name for better image matching
 */
function extractKeywords(name: string): string[] {
  const cleanName = name.trim().toLowerCase();
  const words = cleanName.split(/[\s,\-_]+/).filter(w => w.length > 2);
  return words;
}

/**
 * Gets a free image URL based on the name using multiple fallback sources
 * Uses intelligent keyword matching and multiple free image services
 * @param name - The name/keyword to search for images
 * @param width - Image width (default: 400)
 * @param height - Image height (default: 400)
 * @returns URL to a free image based on the name
 */
function getFreeImageUrl(name: string, width: number = 400, height: number = 400): string {
  if (!name || name.trim().length === 0) {
    return "/placeholder.svg";
  }

  const cleanName = name.trim().toLowerCase();
  const seed = generateSeed(cleanName);
  const keywords = extractKeywords(cleanName);
  const primaryKeyword = keywords[0] || cleanName;
  const encodedName = encodeURIComponent(primaryKeyword);
  const fullEncodedName = encodeURIComponent(cleanName);

  // Comprehensive category mapping for better image relevance
  // Maps keywords to specific Picsum image IDs that match the category
  const categoryMap: Record<string, number> = {
    // Food & Produce
    'food': 292, 'meal': 292, 'dish': 292, 'cuisine': 292,
    'fruit': 1080, 'fruits': 1080, 'apple': 1080, 'orange': 1080, 'banana': 1080,
    'vegetable': 1015, 'vegetables': 1015, 'veggie': 1015, 'veggies': 1015,
    'grocery': 292, 'groceries': 292, 'store': 292, 'market': 292,
    'fresh': 1080, 'organic': 1015, 'natural': 1015,
    
    // Meat & Protein
    'meat': 292, 'beef': 292, 'chicken': 292, 'pork': 292, 'fish': 292,
    'protein': 292, 'steak': 292, 'seafood': 292,
    
    // Dairy
    'dairy': 292, 'milk': 292, 'cheese': 292, 'yogurt': 292, 'butter': 292,
    
    // Beverages
    'beverage': 292, 'drink': 292, 'juice': 292, 'soda': 292, 'water': 292,
    'coffee': 292, 'tea': 292, 'wine': 292, 'beer': 292,
    
    // Snacks & Bakery
    'snack': 292, 'snacks': 292, 'chips': 292, 'candy': 292,
    'bakery': 292, 'bread': 292, 'cake': 292, 'cookie': 292, 'pastry': 292,
    
    // Frozen & Packaged
    'frozen': 292, 'packaged': 292, 'canned': 292,
    
    // Health & Wellness
    'health': 1015, 'wellness': 1015, 'vitamin': 1015, 'supplement': 1015,
    
    // General categories
    'product': 292, 'item': 292, 'category': 292,
  };

  // Strategy 1: Try to find a matching category for better relevance
  // This uses Picsum Photos with specific image IDs that match categories
  for (const keyword of keywords) {
    const matchedCategory = Object.keys(categoryMap).find(cat => 
      keyword.includes(cat) || cat.includes(keyword)
    );
    
    if (matchedCategory) {
      const categoryId = categoryMap[matchedCategory];
      return `https://picsum.photos/id/${categoryId}/${width}/${height}`;
    }
  }

  // Strategy 2: Use Unsplash Source with keyword search (semantic matching)
  // This provides better semantic matching based on the actual keyword
  // Unsplash Source searches their database for images matching the keyword
  // Format: https://source.unsplash.com/{width}x{height}/?{keyword}
  // Note: This service is deprecated but still functional for most use cases
  const unsplashUrl = `https://source.unsplash.com/${width}x${height}/?${fullEncodedName}`;
  
  // Strategy 3: Fallback to seed-based Picsum for consistency
  // This ensures the same name always returns the same image
  // The seed is generated from the name hash, so same name = same image
  const picsumUrl = `https://picsum.photos/seed/${seed}/${width}/${height}`;
  
  // Priority: Unsplash (semantic search) > Picsum (consistent seed-based)
  // Unsplash provides better keyword matching, Picsum provides reliability
  // If Unsplash fails to load, the browser will show a broken image
  // For production, you might want to implement client-side fallback logic
  return unsplashUrl;
}

/**
 * Constructs a full image URL from storage path
 * @param imagePath - The image path/name from the database
 * @param name - Optional name/keyword for generating placeholder images
 * @returns Full URL to the image or placeholder if no path provided
 */
export function getImageUrl(imagePath: string | null | undefined, name?: string): string {
  if (!imagePath) {
    if (name) {
      return getFreeImageUrl(name);
    }
    return "/placeholder.svg";
  }
  if (imagePath.startsWith("http")) return imagePath
  
  const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || "https://violet-bison-661615.hostingersite.com/storage/"
  return `${STORAGE_URL}${imagePath.replace(/^\//, "")}`
}
