# 🎯 Role-Based Dashboard System

## Overview
After login/registration, users are automatically redirected to their appropriate dashboard based on their role.

## 📊 Dashboard Routing Priority

If a user has multiple roles, they are redirected based on this priority order:

1. **Seller/Producer** → `/admin` (Highest Priority)
2. **Deliverer** → `/courier`
3. **Helper/Volunteer** → `/volunteers`
4. **Buyer** → `/` (Home Page)

## 🎭 Role Definitions

### 1. 🛒 Buyer
- **Dashboard**: Home Page (`/`)
- **Purpose**: Purchase fresh produce from local farmers
- **Features**:
  - Browse products
  - Add to cart
  - Place orders
  - Track deliveries
  - View order history

### 2. 🏪 Seller/Producer
- **Dashboard**: `/admin`
- **Purpose**: Sell farm products
- **Features**:
  - Manage products
  - View orders
  - Track sales
  - Manage inventory
  - View analytics
  - Handle harvest requests

### 3. 👥 Helper/Volunteer
- **Dashboard**: `/volunteers`
- **Purpose**: Help with harvesting and community work
- **Features**:
  - View harvesting tasks
  - Track volunteer hours
  - See community impact
  - Schedule availability
  - Earn rewards

### 4. 🚚 Deliverer/Courier
- **Dashboard**: `/courier`
- **Purpose**: Deliver products to customers
- **Features**:
  - View delivery routes
  - Accept delivery jobs
  - Track earnings
  - View performance metrics
  - Update delivery status

## 💾 Data Storage

### User Roles Table
```javascript
localStorage: "yarvest_user_roles"
[
  {
    id: "ROLE123456789",
    user_id: "123",
    role_id: "1" // 1=buyer, 2=seller, 3=helper, 4=deliverer
  }
]
```

### Role IDs
- `1` - Buyer
- `2` - Seller/Producer
- `3` - Helper/Volunteer
- `4` - Deliverer/Courier

## 🔄 Login Flow

```
User Logs In
    ↓
System Checks Roles
    ↓
Has Seller Role? → YES → Redirect to /admin
    ↓ NO
Has Deliverer Role? → YES → Redirect to /courier
    ↓ NO
Has Helper Role? → YES → Redirect to /volunteers
    ↓ NO
Has Buyer Role? → YES → Redirect to /
    ↓ NO
No Roles → Redirect to / (Default)
```

## 📝 Registration Flow

```
1. Enter Email
2. Enter Personal Info (Name, Phone, Password)
3. Select Role(s) ⭐ MULTI-SELECT ALLOWED
4. Enter Address
5. Complete Registration
6. Auto-login & Redirect to Dashboard
```

## 🛠️ Utility Functions

### `getDashboardPath(roles: Role[])`
Returns the appropriate dashboard path based on user roles.

```typescript
import { getDashboardPath } from "@/lib/auth"

const roles = ["buyer", "seller"]
const path = getDashboardPath(roles) // Returns "/admin"
```

### `getCurrentUserRoles()`
Gets the current logged-in user's roles.

```typescript
import { getCurrentUserRoles } from "@/lib/role-utils"

const roles = getCurrentUserRoles() // Returns ["buyer", "seller"]
```

### `hasRole(role: Role)`
Check if user has a specific role.

```typescript
import { hasRole } from "@/lib/role-utils"

if (hasRole("seller")) {
  // Show seller-specific features
}
```

## 🧪 Testing

### Test Accounts
Default accounts (from lib/auth.ts):

**Account 1:**
- Email: `john@example.com`
- Password: `password123`
- Roles: (needs to be set after login)

**Account 2:**
- Email: `jane@example.com`
- Password: `password123`
- Roles: (needs to be set after login)

### Create Test Accounts

1. **Buyer Only:**
   - Register new account
   - Select only "Buyer" role
   - Should redirect to `/`

2. **Seller:**
   - Register new account
   - Select "Seller/Producer" role
   - Should redirect to `/admin`

3. **Multiple Roles:**
   - Register new account
   - Select "Buyer" + "Seller"
   - Should redirect to `/admin` (seller has priority)

4. **Deliverer:**
   - Register new account
   - Select "Delivery Driver" role
   - Should redirect to `/courier`

5. **Helper:**
   - Register new account
   - Select "Helper/Volunteer" role
   - Should redirect to `/volunteers`

## 🔐 Access Control

Future enhancements can include:
- Protected routes based on roles
- Role-based navigation menus
- Feature flags per role
- Permission-based actions

## 📱 Example Usage

### Protecting a Route
```typescript
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { hasRole } from "@/lib/role-utils"

export default function SellerOnlyPage() {
  const router = useRouter()
  
  useEffect(() => {
    if (!hasRole("seller")) {
      router.push("/")
    }
  }, [router])
  
  return <div>Seller Dashboard</div>
}
```

### Dynamic Navigation
```typescript
import { getRoleBasedNavigation } from "@/lib/role-utils"

const navigation = getRoleBasedNavigation()
// Returns role-specific navigation items
```

## 🎉 Summary

Users can now:
- ✅ Select multiple roles during registration
- ✅ Automatically redirected to appropriate dashboard after login
- ✅ Access role-specific features
- ✅ Have their roles stored in localStorage
- ✅ Switch between dashboards if they have multiple roles

