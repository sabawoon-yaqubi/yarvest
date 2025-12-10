# 🎯 Role-Based Dashboard Routing

## ✅ Already Implemented!

Your project automatically redirects users to their appropriate dashboard based on their role after login or registration.

---

## 📊 Dashboard Routes by Role

| Role | Dashboard URL | Priority |
|------|--------------|----------|
| 🏪 **Seller/Producer** | `/admin` | 1 (Highest) |
| 🚚 **Deliverer/Courier** | `/courier` | 2 |
| 👥 **Helper/Volunteer** | `/volunteers` | 3 |
| 🛒 **Buyer** | `/` (Home) | 4 (Default) |

### Priority System

If a user has **multiple roles**, they are redirected based on this priority order:

1. **Seller** → `/admin` (highest priority)
2. **Deliverer** → `/courier`
3. **Helper** → `/volunteers`
4. **Buyer** → `/` (home page)

**Example:**
- User with roles: [buyer, seller] → Redirects to `/admin` ✅
- User with roles: [buyer, helper] → Redirects to `/volunteers` ✅
- User with roles: [deliverer, buyer] → Redirects to `/courier` ✅

---

## 🔧 How It Works

### 1. Login Flow

```typescript
// components/auth-modal.tsx (lines 69-83)

const handleLogin = async (e: React.FormEvent) => {
  const result = loginUser(email, password)
  
  if (result.success && result.user) {
    login(result.user)
    
    // ✅ Automatic redirection based on roles
    if (result.roles && result.roles.length > 0) {
      const dashboardPath = getDashboardPath(result.roles)
      router.push(dashboardPath) // Redirects to role-specific dashboard
    } else {
      router.push("/") // Default to home
    }
  }
}
```

### 2. Registration Flow

```typescript
// components/auth-modal.tsx (lines 127-155)

const handleRegisterFinal = async (e: React.FormEvent) => {
  const result = registerUser(
    formData.firstName,
    formData.lastName,
    email,
    password,
    formData.phone,
    selectedRoles, // User-selected roles
    address
  )
  
  if (result.success) {
    const loginResult = loginUser(email, password)
    if (loginResult.success && loginResult.user) {
      login(loginResult.user)
      
      // ✅ Automatic redirection based on selected roles
      const dashboardPath = getDashboardPath(selectedRoles)
      router.push(dashboardPath)
    }
  }
}
```

### 3. Dashboard Path Function

```typescript
// lib/auth.ts (lines 262-272)

export function getDashboardPath(roles: Role[]): string {
  if (!roles || roles.length === 0) return "/"
  
  // Priority order: seller > deliverer > helper > buyer
  if (roles.includes("seller")) return "/admin"
  if (roles.includes("deliverer")) return "/courier"
  if (roles.includes("helper")) return "/volunteers"
  if (roles.includes("buyer")) return "/"
  
  return "/" // Default fallback
}
```

---

## 🧪 Testing

### Test Scenario 1: Seller Registration
1. Open http://localhost:3000
2. Click "Login" → "Sign up"
3. Fill in details
4. **Select "Seller/Producer" role**
5. Complete registration
6. ✅ **Redirects to `/admin`**

### Test Scenario 2: Deliverer Registration
1. Register new account
2. **Select "Delivery Driver" role**
3. Complete registration
4. ✅ **Redirects to `/courier`**

### Test Scenario 3: Multiple Roles
1. Register new account
2. **Select "Buyer" + "Seller"**
3. Complete registration
4. ✅ **Redirects to `/admin`** (seller has higher priority)

### Test Scenario 4: Login
1. Go to login
2. Enter credentials
3. ✅ **Automatically redirects to your role's dashboard**

---

## 📁 Available Dashboards

### 1. 🏪 Seller/Producer Dashboard (`/admin`)
```
/admin
├── /admin/products       - Manage products
├── /admin/orders         - View orders
├── /admin/analytics      - Sales analytics
├── /admin/profile        - Profile settings
└── /admin/settings       - Account settings
```

### 2. 🚚 Courier Dashboard (`/courier`)
```
/courier
├── /courier/deliveries   - Active deliveries
├── /courier/routes       - Delivery routes
├── /courier/earnings     - Earnings tracker
├── /courier/performance  - Performance stats
└── /courier/profile      - Profile settings
```

### 3. 👥 Volunteer Dashboard (`/volunteers`)
```
/volunteers
├── /volunteers/harvesting - Harvesting tasks
├── /volunteers/impact     - Community impact
├── /volunteers/schedule   - Schedule
├── /volunteers/earnings   - Rewards
└── /volunteers/profile    - Profile settings
```

### 4. 🛒 Buyer Dashboard (`/`)
```
/ (Home)
├── /products             - Browse products
├── /cart                 - Shopping cart
├── /profile              - Order history
└── /favorites            - Saved items
```

---

## 🔄 Switching Between Dashboards

If a user has multiple roles, they can manually navigate to other dashboards:

### Add Dashboard Switcher (Optional)

You can add this to your header for users with multiple roles:

```typescript
// components/header.tsx

import { getCurrentUserRoles } from '@/lib/role-utils'

const userRoles = getCurrentUserRoles()

{userRoles.length > 1 && (
  <select onChange={(e) => router.push(e.target.value)}>
    {userRoles.includes('seller') && <option value="/admin">Producer Dashboard</option>}
    {userRoles.includes('deliverer') && <option value="/courier">Courier Dashboard</option>}
    {userRoles.includes('helper') && <option value="/volunteers">Volunteer Dashboard</option>}
    {userRoles.includes('buyer') && <option value="/">Shop</option>}
  </select>
)}
```

---

## 🎯 Summary

✅ **Login** → Automatically redirects based on stored roles
✅ **Registration** → Automatically redirects based on selected roles
✅ **Multiple Roles** → Uses priority system (seller > deliverer > helper > buyer)
✅ **No Roles** → Defaults to home page (`/`)

---

## 🔗 Related Files

- `components/auth-modal.tsx` - Login/Registration with redirection
- `lib/auth.ts` - getDashboardPath() function
- `lib/role-utils.ts` - Role utility functions
- All dashboard pages exist in `/app` directory

---

**Everything is working! Just test the login/registration flow and users will be automatically redirected to their dashboard!** 🚀

