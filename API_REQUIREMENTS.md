# API Requirements for Products Page

This document outlines the API endpoints needed for the dynamic products page functionality.

## Current API Endpoints (Already Available)

Based on `lib/product-api.ts`, the following endpoints are already implemented:

1. **GET `/products`** - Fetch all products
   - Response structure: `{ success: boolean, data: { products: Product[], count?: number } }`
   - Should return array of products with all necessary fields

2. **GET `/products/:id`** - Fetch single product details
   - Response structure: `{ success: boolean, data: { product: Product } }`
   - Should return detailed product information

3. **GET `/categories`** - Fetch all categories
   - Response structure: `{ success: boolean, data: Category[] }`

4. **GET `/categories/:uniqueId/products`** - Fetch products by category
   - Response structure: `{ success: boolean, data: { category: Category, products: Product[], count: number } }`

## Required API Endpoints (Need to be Created)

### 1. GET `/products` - Enhanced with Query Parameters

**Current Status**: ✅ Exists but may need enhancements

**Required Query Parameters**:
- `search` (optional): Search query string to filter products by name, producer, or SKU
- `category` (optional): Filter by category ID or unique_id
- `organic` (optional): Boolean filter for organic products only
- `min_price` (optional): Minimum price filter
- `max_price` (optional): Maximum price filter
- `sort_by` (optional): Sort field (`price`, `rating`, `name`, `created_at`)
- `sort_order` (optional): Sort direction (`asc`, `desc`)
- `page` (optional): Page number for pagination
- `per_page` (optional): Items per page (default: 20)

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 1,
        "unique_id": "PROD000001",
        "name": "Organic Heirloom Tomatoes",
        "price": "4.99",
        "discount": "0.00",
        "stock": 100,
        "sku": "TOMO001",
        "main_image": "path/to/image.jpg",
        "images": [
          {
            "id": 1,
            "image": "path/to/image1.jpg"
          }
        ],
        "seller": {
          "id": 1,
          "first_name": "John",
          "last_name": "Doe",
          "email": "john@example.com",
          "profile_image": "path/to/profile.jpg"
        },
        "product_category": {
          "id": 1,
          "name": "Vegetables",
          "unique_id": "CAT00000001"
        },
        "product_type": {
          "id": 1,
          "name": "/lb"
        },
        "organic": true,
        "is_organic": true,
        "rating": 4.8,
        "average_rating": 4.8,
        "reviews_count": 128,
        "reviews": 128,
        "excerpt": "Short description",
        "details": "Full product description",
        "status": true,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
      }
    ],
    "count": 100,
    "page": 1,
    "per_page": 20,
    "total_pages": 5
  }
}
```

### 2. GET `/products/:id` - Single Product Details

**Current Status**: ⚠️ Needs verification

**Required Fields in Response**:
- All basic product fields
- Full seller/producer information
- All product images
- Category information
- Product type/unit information
- Reviews and ratings
- Stock information
- Additional details (origin, season, nutrition facts if available)

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "product": {
      "id": 1,
      "unique_id": "PROD000001",
      "name": "Organic Heirloom Tomatoes",
      "price": "4.99",
      "discount": "0.00",
      "stock": 100,
      "sku": "TOMO001",
      "main_image": "path/to/image.jpg",
      "images": [
        {
          "id": 1,
          "image": "path/to/image1.jpg"
        }
      ],
      "seller": {
        "id": 1,
        "first_name": "John",
        "last_name": "Doe",
        "email": "john@example.com",
        "profile_image": "path/to/profile.jpg",
        "business_name": "Green Valley Farm"
      },
      "product_category": {
        "id": 1,
        "name": "Vegetables",
        "unique_id": "CAT00000001"
      },
      "product_type": {
        "id": 1,
        "name": "/lb"
      },
      "organic": true,
      "is_organic": true,
      "rating": 4.8,
      "average_rating": 4.8,
      "reviews_count": 128,
      "reviews": 128,
      "excerpt": "Short description",
      "details": "Full product description with all details",
      "origin": "Marin County, CA",
      "season": "Summer to Fall",
      "harvested": "Daily",
      "nutrition_facts": {
        "calories": 18,
        "protein": "0.9g",
        "carbs": "3.9g",
        "fiber": "1.2g"
      },
      "status": true,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  }
}
```

### 3. GET `/products/related/:id` - Related Products

**Current Status**: ❌ Needs to be created

**Purpose**: Get products related to a specific product (same category or same producer)

**Query Parameters**:
- `limit` (optional): Number of related products to return (default: 5)

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "products": [
      // Array of related products (same structure as products list)
    ]
  }
}
```

### 4. GET `/products/search` - Advanced Search

**Current Status**: ❌ Needs to be created (or enhance `/products` with search)

**Purpose**: Search products with advanced filtering

**Query Parameters**:
- `q` (required): Search query
- `category` (optional): Filter by category
- `producer` (optional): Filter by producer/seller ID
- `organic` (optional): Boolean filter
- `min_price` (optional): Minimum price
- `max_price` (optional): Maximum price
- `sort_by` (optional): Sort field
- `sort_order` (optional): Sort direction

**Expected Response**: Same as `/products` endpoint

## Product Data Structure Requirements

### Required Fields

All product endpoints should return products with the following structure:

```typescript
{
  id: number                    // Product ID
  unique_id?: string            // Unique identifier (e.g., "PROD000001")
  name: string                  // Product name
  price: string | number        // Product price
  discount: string | number     // Discount amount (0 if no discount)
  stock: number                 // Available stock
  sku: string                   // SKU code
  main_image?: string           // Main product image path
  images?: Array<{              // Additional product images
    id: number
    image: string
  }>
  seller: {                     // Seller/Producer information
    id: number
    first_name?: string
    last_name?: string
    email: string
    profile_image?: string
    business_name?: string
  }
  product_category: {           // Category information
    id: number
    name: string
    unique_id?: string
  }
  product_type: {               // Product type/unit
    id: number
    name: string                // e.g., "/lb", "/pack", "/unit"
  }
  organic?: boolean             // Is organic product
  is_organic?: boolean          // Alternative field name
  rating?: number               // Average rating
  average_rating?: number       // Alternative field name
  reviews_count?: number        // Number of reviews
  reviews?: number              // Alternative field name
  excerpt?: string              // Short description
  details?: string              // Full description
  status: boolean               // Product status (active/inactive)
  created_at?: string           // Creation timestamp
  updated_at?: string           // Update timestamp
}
```

### Optional Fields (Recommended)

```typescript
{
  origin?: string               // Product origin location
  season?: string               // Season availability
  harvested?: string            // Harvest frequency
  nutrition_facts?: {           // Nutrition information
    calories: number
    protein: string
    carbs: string
    fiber: string
  }
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

## Pagination

For endpoints that support pagination:

```json
{
  "success": true,
  "data": {
    "products": [...],
    "count": 100,
    "page": 1,
    "per_page": 20,
    "total_pages": 5
  }
}
```

## Sorting Options

Products should support sorting by:
- `price` - Price (low to high or high to low)
- `rating` - Average rating
- `name` - Alphabetical
- `created_at` - Newest first
- `featured` - Featured products first (if applicable)

## Filtering Options

Products should support filtering by:
- **Search**: Name, producer, SKU
- **Category**: By category ID or unique_id
- **Organic**: Boolean filter
- **Price Range**: Min and max price
- **Producer/Seller**: By seller ID
- **Stock**: In stock only (optional)

## Notes for Backend Team

1. **Consistency**: Ensure all product endpoints return the same product structure
2. **Image Paths**: Use consistent image path format (relative paths preferred)
3. **Null Handling**: Handle null/undefined values gracefully
4. **Performance**: Consider pagination for large product lists
5. **Search**: Implement full-text search for product names, descriptions, and SKUs
6. **Related Products**: Implement logic to find related products (same category or producer)
7. **Rating/Reviews**: If review system exists, include average rating and count
8. **Discounts**: Calculate final price (price - discount) or return both values

## Testing Recommendations

1. Test with empty results
2. Test with large datasets (pagination)
3. Test search functionality with various queries
4. Test filtering combinations
5. Test sorting options
6. Test error scenarios (invalid IDs, network errors)

## Priority Order

1. **High Priority**: 
   - GET `/products` with query parameters (enhance existing)
   - GET `/products/:id` (verify/update existing)

2. **Medium Priority**:
   - GET `/products/related/:id` (new endpoint)

3. **Low Priority**:
   - GET `/products/search` (if not handled by enhanced `/products`)

