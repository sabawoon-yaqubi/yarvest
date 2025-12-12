# API Requirements for Producers/Stores Page

This document outlines the API endpoints needed for the dynamic producers page functionality.

## Required API Endpoints

### 1. GET `/stores` - Fetch All Producers/Stores

**Purpose**: Get all producers/stores in the marketplace

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "stores": [
      {
        "id": 1,
        "unique_id": "STORE000001",
        "name": "Green Valley Farm",
        "location": "Marin County, CA",
        "full_address": "123 Farm Road, Marin County, CA 94941",
        "specialty": "Organic Vegetables",
        "description": "Family-owned organic farm...",
        "image": "path/to/image.jpg",
        "rating": {
          "average": 4.9,
          "total": 156
        },
        "average_rating": 4.9,
        "verified": true,
        "is_verified": true,
        "products": 45,
        "products_count": 45,
        "total_products": 45,
        "years_in_business": 15,
        "established": "2008",
        "founded": "2008",
        "email": "contact@greenvalleyfarm.com",
        "phone": "(415) 555-0101",
        "phone_number": "(415) 555-0101",
        "website": "www.greenvalleyfarm.com",
        "website_url": "www.greenvalleyfarm.com",
        "certifications": ["USDA Organic", "Non-GMO Project Verified"],
        "activities": ["Farm Tours", "CSA Programs", "Farmers Market"],
        "delivery_areas": ["Marin County", "San Francisco", "East Bay"],
        "deliveryAreas": ["Marin County", "San Francisco", "East Bay"],
        "total_reviews": 156,
        "reviews_count": 156,
        "reviews": 156,
        "created_at": "2008-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
      }
    ],
    "count": 100
  }
}
```

### 2. GET `/stores/top-sellers` - Top Sellers

**Purpose**: Get producers with the most products (top sellers)

**Query Parameters** (optional):
- `limit` (optional): Number of results to return (default: 4)

**Expected Response**: Same structure as `/stores` endpoint

### 3. GET `/stores/certified-organic` - Certified Organic Producers

**Purpose**: Get producers with organic certifications

**Query Parameters** (optional):
- `limit` (optional): Number of results to return (default: 4)

**Expected Response**: Same structure as `/stores` endpoint

**Note**: Should filter producers that have certifications containing "organic" (case-insensitive)

### 4. GET `/stores/most-reviewed` - Most Reviewed Producers

**Purpose**: Get producers sorted by total number of reviews

**Query Parameters** (optional):
- `limit` (optional): Number of results to return (default: 4)

**Expected Response**: Same structure as `/stores` endpoint

**Note**: Should include `total_reviews` or `reviews_count` field

### 5. GET `/stores/new-this-season` - New Producers

**Purpose**: Get recently joined producers (newest first)

**Query Parameters** (optional):
- `limit` (optional): Number of results to return (default: 4)

**Expected Response**: Same structure as `/stores` endpoint

**Note**: Should be sorted by `created_at` descending

### 6. GET `/stores/:id` - Single Producer Details

**Purpose**: Get detailed information about a specific producer

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "store": {
      // Same structure as producer in list, but with full details
      "id": 1,
      "name": "Green Valley Farm",
      // ... all fields from list endpoint
      // Additional detailed fields can be included
    }
  }
}
```

### 7. GET `/stores/:id/products` - Producer Products

**Purpose**: Get all products from a specific producer

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "products": [
      // Array of products (same structure as /products endpoint)
    ],
    "count": 45
  }
}
```

**Alternative Response Structure**:
```json
{
  "success": true,
  "data": [
    // Array of products directly
  ]
}
```

## Producer Data Structure Requirements

### Required Fields

```typescript
{
  id: number                    // Producer/Store ID
  unique_id?: string            // Unique identifier (e.g., "STORE000001")
  name: string                 // Producer/store name
  location?: string             // Location (city, state, etc.)
  full_address?: string        // Full address
  specialty?: string            // Specialty (e.g., "Organic Vegetables")
  description?: string          // Description/bio
  image?: string               // Profile/store image path
  rating?: number | {          // Rating (can be number or object)
    average: number
    total: number
  }
  average_rating?: number       // Alternative field name
  verified?: boolean            // Is verified producer
  is_verified?: boolean        // Alternative field name
  products?: number            // Number of products
  products_count?: number      // Alternative field name
  total_products?: number     // Alternative field name
  years_in_business?: number   // Years in business
  established?: string         // Year established (e.g., "2008")
  founded?: string            // Alternative field name
  email?: string              // Contact email
  phone?: string              // Contact phone
  phone_number?: string       // Alternative field name
  website?: string            // Website URL
  website_url?: string        // Alternative field name
  certifications?: string[]    // Array of certifications
  activities?: string[]       // Array of activities/services
  delivery_areas?: string[]   // Array of delivery areas
  deliveryAreas?: string[]   // Alternative field name
  total_reviews?: number      // Total number of reviews
  reviews_count?: number      // Alternative field name
  reviews?: number            // Alternative field name
  created_at?: string         // Creation timestamp
  updated_at?: string         // Update timestamp
}
```

### Optional Fields (Recommended)

```typescript
{
  business_name?: string      // Business name (if different from name)
  store_name?: string         // Store name (alternative)
  city?: string              // City
  state?: string             // State
  country?: string           // Country
  latitude?: number          // Location latitude
  longitude?: number         // Location longitude
  profile_image?: string     // Profile image (alternative to image)
  main_image?: string        // Main image (alternative)
}
```

## Image URL Handling

- All image paths should be relative paths or full URLs
- The frontend uses `getImageUrl()` utility to handle image URLs
- Ensure image paths are consistent across all endpoints

## Error Handling

All endpoints should return errors in the following format:

```json
{
  "success": false,
  "message": "Error message here",
  "error": "Detailed error information (optional)"
}
```

## Response Structure Variations

The API should handle these response structure variations:

1. **Wrapped in data object**:
   ```json
   {
     "success": true,
     "data": {
       "stores": [...]
     }
   }
   ```

2. **Direct array**:
   ```json
   {
     "success": true,
     "data": [...]
   }
   ```

3. **With stores/producers key**:
   ```json
   {
     "success": true,
     "data": {
       "producers": [...]
     }
   }
   ```

## Rating Field Handling

The rating field can be:
- A number: `"rating": 4.9`
- An object: `"rating": { "average": 4.9, "total": 156 }`
- Alternative field: `"average_rating": 4.9`

The transformation function handles all these cases.

## Certifications, Activities, Delivery Areas

These fields can be:
- Arrays: `["USDA Organic", "Non-GMO"]`
- Comma-separated strings: `"USDA Organic, Non-GMO"`
- The transformation function handles both formats

## Years in Business Calculation

If `years_in_business` is not provided, it can be calculated from:
- `established` year (e.g., "2008")
- `founded` year
- `created_at` timestamp

## Notes for Backend Team

1. **Consistency**: Ensure all producer endpoints return the same producer structure
2. **Image Paths**: Use consistent image path format (relative paths preferred)
3. **Null Handling**: Handle null/undefined values gracefully
4. **Performance**: Consider pagination for large producer lists
5. **Filtering**: Implement proper filtering for certified organic (check certifications array)
6. **Sorting**: 
   - Top sellers: Sort by product count descending
   - Most reviewed: Sort by total reviews descending
   - New this season: Sort by created_at descending
7. **Rating/Reviews**: Include average rating and total review count
8. **Verification**: Include verified status for all producers

## Testing Recommendations

1. Test with empty results
2. Test with large datasets (pagination)
3. Test search functionality
4. Test filtering (organic, top sellers, etc.)
5. Test sorting options
6. Test error scenarios (invalid IDs, network errors)
7. Test with missing optional fields
8. Test with different data formats (arrays vs strings)

## Priority Order

1. **High Priority**: 
   - GET `/stores` (main endpoint)
   - GET `/stores/:id` (single producer)
   - GET `/stores/:id/products` (producer products)

2. **Medium Priority**:
   - GET `/stores/top-sellers`
   - GET `/stores/certified-organic`
   - GET `/stores/most-reviewed`
   - GET `/stores/new-this-season`

## Example API Calls

```bash
# Get all producers
GET /stores

# Get top sellers (limit to 4)
GET /stores/top-sellers?limit=4

# Get certified organic producers
GET /stores/certified-organic?limit=4

# Get most reviewed producers
GET /stores/most-reviewed?limit=4

# Get new producers
GET /stores/new-this-season?limit=4

# Get single producer
GET /stores/1

# Get producer products
GET /stores/1/products
```


