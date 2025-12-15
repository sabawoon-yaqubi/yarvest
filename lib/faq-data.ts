import { FAQCategory, FAQ } from "@/types/faq"
import { BookOpen, MessageCircle, HelpCircle, CheckCircle, Package, CreditCard, Shield, Truck, Users, Wrench, HeartHandshake, Award, MapPin } from "lucide-react"

// FAQ Categories
export const faqCategories: FAQCategory[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: BookOpen,
    description: "Learn how to get started with Yarvest",
    order: 1,
  },
  {
    id: "roles-features",
    title: "Roles & Features",
    icon: Users,
    description: "Understanding Buyer, Seller, Courier, and Helper roles",
    order: 2,
  },
  {
    id: "orders-delivery",
    title: "Orders & Delivery",
    icon: Truck,
    description: "Everything about placing and tracking orders",
    order: 3,
  },
  {
    id: "products",
    title: "Products",
    icon: Package,
    description: "Information about our products",
    order: 4,
  },
  {
    id: "harvesting-tools",
    title: "Harvesting Tools",
    icon: Wrench,
    description: "Renting and borrowing harvesting equipment",
    order: 5,
  },
  {
    id: "harvest-requests",
    title: "Harvest Requests",
    icon: HeartHandshake,
    description: "Requesting help and volunteering for harvests",
    order: 6,
  },
  {
    id: "courier-volunteer",
    title: "Courier & Volunteer",
    icon: Truck,
    description: "Delivering orders and volunteering",
    order: 7,
  },
  {
    id: "leaderboard-points",
    title: "Leaderboard & Points",
    icon: Award,
    description: "Earning points and climbing the leaderboard",
    order: 8,
  },
  {
    id: "account-billing",
    title: "Account & Billing",
    icon: CreditCard,
    description: "Manage your account and billing",
    order: 9,
  },
  {
    id: "payment-security",
    title: "Payment & Security",
    icon: Shield,
    description: "Payment methods and security information",
    order: 10,
  },
]

// FAQs
export const faqs: FAQ[] = [
  // Getting Started
  {
    id: 1,
    categoryId: "getting-started",
    question: "How do I create an account?",
    answer: "Click on the Account button in the sidebar and follow the registration process. You'll need to provide your email address and create a password.",
    order: 1,
  },
  {
    id: 2,
    categoryId: "getting-started",
    question: "How do I place an order?",
    answer: "Browse products, add items to your cart, and proceed to checkout. You can review your order before finalizing the purchase.",
    order: 2,
  },
  {
    id: 3,
    categoryId: "getting-started",
    question: "Is there a mobile app?",
    answer: "We don't have a mobile app yet, but it's coming soon! In the meantime, our website works great on mobile and all devices.",
    order: 3,
  },
  {
    id: 4,
    categoryId: "getting-started",
    question: "Do I need to create an account to shop?",
    answer: "While you can browse products without an account, you'll need to create an account to place orders and track your purchases.",
    order: 4,
  },
  // Orders & Delivery
  {
    id: 5,
    categoryId: "orders-delivery",
    question: "What are your delivery options?",
    answer: "We do not provide direct delivery. However, you can use our volunteer courier network or choose available pickup options at your convenience.",
    order: 1,
  },
  {
    id: 6,
    categoryId: "orders-delivery",
    question: "How do I track my order?",
    answer: "Currently, you will be contacted by your volunteer courier or pick-up coordinator regarding the status of your order. Tracking details are not automated yet, but you can always message your assigned courier from the dashboard.",
    order: 2,
  },
  {
    id: 7,
    categoryId: "orders-delivery",
    question: "What if I'm not satisfied with my order?",
    answer: "Please notify us within 48 hours if there is any issue with your order. We will do our best to help resolve your concerns or arrange for a replacement if appropriate.",
    order: 3,
  },
  {
    id: 8,
    categoryId: "orders-delivery",
    question: "Can I modify or cancel my order?",
    answer: "You can request to modify or cancel your order as long as it has not yet been picked up by a volunteer courier. For changes, please contact our support or message your assigned courier directly.",
    order: 4,
  },
  {
    id: 9,
    categoryId: "orders-delivery",
    question: "What are your delivery hours?",
    answer: "Delivery and pickup hours depend on the availability of volunteer couriers and pickup site schedules. You can coordinate timing directly with your courier or the pickup location.",
    order: 5,
  },
  {
    id: 10,
    categoryId: "orders-delivery",
    question: "Is there a minimum order amount?",
    answer: "There is no strict minimum order amount for using volunteer couriers or pickup, but some locations may encourage combining orders to help volunteers. Please check with your local coordinator or on the checkout page for more details.",
    order: 6,
  },
  // Products
  {
    id: 11,
    categoryId: "products",
    question: "Are your products organic?",
    answer: "Many of our products are organic. Look for the organic badge on product pages. We clearly label all organic products.",
    order: 1,
  },
  {
    id: 12,
    categoryId: "products",
    question: "Where do your products come from?",
    answer: "All products are sourced from verified local farmers and producers within your region. We prioritize local sourcing.",
    order: 2,
  },
  {
    id: 13,
    categoryId: "products",
    question: "How fresh are the products?",
    answer: "Products are harvested and delivered within 24-48 hours of your order. We maintain cold chain storage for optimal freshness.",
    order: 3,
  },
  {
    id: 14,
    categoryId: "products",
    question: "What if a product is out of stock?",
    answer: "You can sign up for notifications when out-of-stock items become available. We restock regularly.",
    order: 4,
  },
  {
    id: 15,
    categoryId: "products",
    question: "Can I request a specific product?",
    answer: "Yes! You can submit product requests through your account dashboard. We'll do our best to source requested items.",
    order: 5,
  },
  // Account & Billing
  {
    id: 16,
    categoryId: "account-billing",
    question: "How do I update my account information?",
    answer: "Go to your Account page and click on 'Edit Profile' to update your information, address, and preferences.",
    order: 1,
  },
  {
    id: 17,
    categoryId: "account-billing",
    question: "How do I change my password?",
    answer: "In your Account settings, click on 'Security' and then 'Change Password'. You'll need to enter your current password.",
    order: 2,
  },
  {
    id: 18,
    categoryId: "account-billing",
    question: "Can I save multiple delivery addresses?",
    answer: "Yes, you can save multiple addresses in your account. Select your preferred address at checkout.",
    order: 3,
  },
  {
    id: 19,
    categoryId: "account-billing",
    question: "How do I view my order history?",
    answer: "All your orders are available in your Account dashboard under 'Order History'. You can view details and reorder items.",
    order: 4,
  },
  {
    id: 20,
    categoryId: "account-billing",
    question: "How do I delete my account?",
    answer: "You can delete your account from the Account Settings page. Please note that this action cannot be undone.",
    order: 5,
  },
  // Payment & Security
  {
    id: 21,
    categoryId: "payment-security",
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, PayPal, Apple Pay, Google Pay, and gift cards.",
    order: 1,
  },
  {
    id: 22,
    categoryId: "payment-security",
    question: "Is my payment information secure?",
    answer: "Yes, we use industry-standard encryption to protect your payment information. We never store your full credit card details.",
    order: 2,
  },
  {
    id: 23,
    categoryId: "payment-security",
    question: "Can I use multiple payment methods?",
    answer: "Yes, you can split payment between multiple methods at checkout. For example, use a gift card and credit card together.",
    order: 3,
  },
  {
    id: 24,
    categoryId: "payment-security",
    question: "How do I add or remove a payment method?",
    answer: "Go to your Account settings and select 'Payment Methods'. You can add, edit, or remove payment methods there.",
    order: 4,
  },
  {
    id: 25,
    categoryId: "payment-security",
    question: "What should I do if I see unauthorized charges?",
    answer: "Contact us immediately if you notice any unauthorized charges. We'll investigate and help resolve the issue promptly.",
    order: 5,
  },
  // Roles & Features
  {
    id: 26,
    categoryId: "roles-features",
    question: "What roles are available on Yarvest?",
    answer: "Yarvest offers four main roles: Buyer (shop for fresh produce), Seller/Producer (sell your farm products), Courier (deliver products to customers), and Helper/Volunteer (help with harvesting and community work). You can have multiple roles on the same account.",
    order: 1,
  },
  {
    id: 27,
    categoryId: "roles-features",
    question: "How do I add or change my roles?",
    answer: "Go to your Settings page and click on 'Your Roles' section. You can assign yourself additional roles like Courier or Helper. Buyer and Seller roles are default and cannot be removed.",
    order: 2,
  },
  {
    id: 28,
    categoryId: "roles-features",
    question: "Can I have multiple roles at the same time?",
    answer: "Yes! You can be a Buyer, Seller, Courier, and Helper all at the same time. Each role gives you access to different features and opportunities on the platform.",
    order: 3,
  },
  {
    id: 29,
    categoryId: "roles-features",
    question: "What can I do as a Seller/Producer?",
    answer: "As a Seller, you can list your products, manage inventory, receive orders, set up your store profile, and connect with local buyers. You'll also appear on the Producers map and leaderboard.",
    order: 4,
  },
  {
    id: 30,
    categoryId: "roles-features",
    question: "What can I do as a Courier?",
    answer: "As a Courier, you can accept delivery requests from sellers, set your availability and delivery radius, track your deliveries, and earn money for completed deliveries. You can manage your schedule in the Courier dashboard.",
    order: 5,
  },
  {
    id: 31,
    categoryId: "roles-features",
    question: "What can I do as a Helper/Volunteer?",
    answer: "As a Helper, you can browse harvest requests from farmers, offer to help with harvesting, track your volunteer activities, earn points for community contributions, and see your impact on the community.",
    order: 6,
  },
  // Harvesting Tools
  {
    id: 32,
    categoryId: "harvesting-tools",
    question: "What are Harvesting Tools?",
    answer: "Harvesting Tools are farming equipment that owners can rent out or lend to others. This includes tools like pruners, harvest baskets, ladders, and other equipment needed for harvesting.",
    order: 1,
  },
  {
    id: 33,
    categoryId: "harvesting-tools",
    question: "How do I rent a harvesting tool?",
    answer: "Browse available tools in the Harvesting Tools section, select a tool you need, and click 'Request Tool'. Fill in your requested dates, add a message, and choose pickup or delivery. The tool owner will review and approve or reject your request.",
    order: 2,
  },
  {
    id: 34,
    categoryId: "harvesting-tools",
    question: "How do I list my harvesting tool for rent?",
    answer: "Go to your Dashboard and navigate to 'Harvesting Tools'. Click 'Add Tool' and provide details like tool name, description, daily rate (for rent), deposit amount, location, condition, and usage instructions. Set availability to 'Available' to make it visible to others.",
    order: 3,
  },
  {
    id: 35,
    categoryId: "harvesting-tools",
    question: "What's the difference between rent and borrow?",
    answer: "Rent means you charge a daily rate for tool usage. Borrow means you lend the tool for free. Choose the type when listing your tool. Both options may require a security deposit.",
    order: 4,
  },
  {
    id: 36,
    categoryId: "harvesting-tools",
    question: "How do I approve or reject a tool request?",
    answer: "Go to 'My Tool Requests' in your Dashboard. You'll see pending requests with requester details and dates. You can approve with pickup location/method details or reject with a reason. Approved requests will update the tool's availability.",
    order: 5,
  },
  {
    id: 37,
    categoryId: "harvesting-tools",
    question: "What happens if my tool request is approved?",
    answer: "You'll receive a notification with approval details, pickup location, and method (pickup or delivery). The tool owner may include special instructions. Make sure to return the tool in good condition by the end date.",
    order: 6,
  },
  {
    id: 38,
    categoryId: "harvesting-tools",
    question: "Can I cancel a tool request?",
    answer: "Yes, you can cancel your pending requests. Once approved, contact the tool owner directly if you need to cancel. Cancelled requests will update the tool's availability status.",
    order: 7,
  },
  // Harvest Requests
  {
    id: 39,
    categoryId: "harvest-requests",
    question: "What are Harvest Requests?",
    answer: "Harvest Requests allow farmers to request help with harvesting their crops. Volunteers can browse available requests and offer to help. This connects farmers with community helpers.",
    order: 1,
  },
  {
    id: 40,
    categoryId: "harvest-requests",
    question: "How do I create a harvest request?",
    answer: "Go to your Dashboard and navigate to 'Harvest Requests'. Click 'Create Request' and provide details like harvest date, location (select from your saved addresses), products to harvest, and any special instructions. Volunteers will see your request and can offer help.",
    order: 2,
  },
  {
    id: 41,
    categoryId: "harvest-requests",
    question: "How do I offer to help with a harvest?",
    answer: "Browse available harvest requests in the 'Harvesting' section. Click on a request to see details, then click 'Offer Help'. The farmer will review offers and can accept one or more volunteers. You'll be notified if your offer is accepted.",
    order: 3,
  },
  {
    id: 42,
    categoryId: "harvest-requests",
    question: "Can I accept multiple volunteers for one harvest?",
    answer: "Yes! When reviewing offers, you can accept multiple volunteers for your harvest request. This is helpful for larger harvests that need more hands.",
    order: 4,
  },
  {
    id: 43,
    categoryId: "harvest-requests",
    question: "Do I earn points for helping with harvests?",
    answer: "Yes! Completing harvest requests earns you points that contribute to your leaderboard ranking. Track your points and impact in the 'Impact' section of your Volunteer dashboard.",
    order: 5,
  },
  {
    id: 44,
    categoryId: "harvest-requests",
    question: "How do I track my harvest requests and offers?",
    answer: "In your Dashboard, you can view 'My Requests' (requests you created) and 'My Offers' (requests where you offered help). Filter by status (pending, accepted, completed) to see your activity.",
    order: 6,
  },
  // Courier & Volunteer
  {
    id: 45,
    categoryId: "courier-volunteer",
    question: "How do I become a Courier?",
    answer: "Add the Courier role in your Settings. Then go to Courier Settings and set your availability, delivery radius, work hours, and days of the week. Once set up, you'll see available delivery requests.",
    order: 1,
  },
  {
    id: 46,
    categoryId: "courier-volunteer",
    question: "How do I accept a delivery request?",
    answer: "Sellers can request couriers for their orders. You'll see available requests in your Courier dashboard. Review the order details, pickup and delivery locations, then click 'Accept' if you can complete the delivery.",
    order: 2,
  },
  {
    id: 47,
    categoryId: "courier-volunteer",
    question: "How do I get paid as a Courier?",
    answer: "Earnings are calculated based on completed deliveries. View your earnings in the 'Earnings' section of your Courier dashboard. Payments are processed weekly and deposited to your connected bank account.",
    order: 3,
  },
  {
    id: 48,
    categoryId: "courier-volunteer",
    question: "Can I set my delivery radius?",
    answer: "Yes! In your Courier Settings, you can set your delivery radius in miles. You'll only see delivery requests within your specified radius. You can update this anytime.",
    order: 4,
  },
  {
    id: 49,
    categoryId: "courier-volunteer",
    question: "How do I manage my Courier schedule?",
    answer: "Set your availability, work hours (start and end time), and days of the week in Courier Settings. You can toggle availability on/off and update your schedule anytime. Use the Schedule page to see all your accepted deliveries.",
    order: 5,
  },
  {
    id: 50,
    categoryId: "courier-volunteer",
    question: "What's the difference between Courier and Helper roles?",
    answer: "Couriers deliver products from sellers to buyers and earn money. Helpers volunteer to assist with harvests and earn points. You can have both roles and switch between delivery work and volunteer harvesting.",
    order: 6,
  },
  // Leaderboard & Points
  {
    id: 51,
    categoryId: "leaderboard-points",
    question: "How does the Leaderboard work?",
    answer: "The Leaderboard ranks community members based on their contributions. You earn points for activities like completing harvest requests, helping farmers, making purchases, and selling products. Top contributors are featured on the homepage.",
    order: 1,
  },
  {
    id: 52,
    categoryId: "leaderboard-points",
    question: "How do I earn points?",
    answer: "You earn points by helping with harvest requests, completing deliveries, making purchases, selling products, and participating in community events. Different activities award different point values.",
    order: 2,
  },
  {
    id: 53,
    categoryId: "leaderboard-points",
    question: "Where can I see my points and ranking?",
    answer: "Check your ranking in the Leaderboard page. You can also view your points breakdown in your Dashboard under 'My Ranking' or 'My Points' to see how you earned points.",
    order: 3,
  },
  {
    id: 54,
    categoryId: "leaderboard-points",
    question: "What are badges on the Leaderboard?",
    answer: "Badges like Champion, Elite, and Pro are awarded based on your point totals and community contributions. Higher badges indicate greater community involvement and unlock special recognition.",
    order: 4,
  },
  // Products - Additional
  {
    id: 55,
    categoryId: "products",
    question: "How do I view products on a map?",
    answer: "Go to the Products page and click 'Map View'. You'll see all products with their seller locations on an interactive map. Click markers to see product details and seller information.",
    order: 6,
  },
  {
    id: 56,
    categoryId: "products",
    question: "How do I become a Seller and list products?",
    answer: "Add the Seller role in Settings, then go to your Dashboard. Click 'Add Product' to create listings with details like name, description, price, images, category, and location. Your products will appear in search and on the map.",
    order: 7,
  },
  {
    id: 57,
    categoryId: "products",
    question: "Do I need to add my address to sell products?",
    answer: "Yes, adding your address with coordinates is important so buyers can find you on the map. Go to Settings > Addresses to add your farm or business location. This helps buyers discover local products.",
    order: 8,
  },
  // Orders & Delivery - Additional
  {
    id: 58,
    categoryId: "orders-delivery",
    question: "How do I request a Courier for my order?",
    answer: "When you have an order ready to ship, go to Order Details and click 'Request Courier'. Available couriers in your area will see the request and can accept it. You'll be notified when a courier accepts.",
    order: 7,
  },
  {
    id: 59,
    categoryId: "orders-delivery",
    question: "How do I track my delivery?",
    answer: "Once a courier accepts your delivery request, you can track the order status in your Orders page. The courier will update the status as they pick up and deliver your order.",
    order: 8,
  },
  // Account & Billing - Additional
  {
    id: 60,
    categoryId: "account-billing",
    question: "How do I manage my Helper/Courier settings?",
    answer: "Go to Settings and scroll to Helper Settings or Courier Settings. You can set availability, delivery radius, work hours, days of the week, and other preferences specific to each role.",
    order: 6,
  },
  {
    id: 61,
    categoryId: "account-billing",
    question: "How do I add multiple delivery addresses?",
    answer: "In Settings > Addresses, click 'Add Address' to save multiple locations. You can set a default address and use different addresses for different purposes (home, farm, business).",
    order: 7,
  },
]

// Helper function to get FAQs by category
export function getFAQsByCategory(categoryId: string): FAQ[] {
  return faqs
    .filter((faq) => faq.categoryId === categoryId)
    .sort((a, b) => (a.order || 0) - (b.order || 0))
}

// Helper function to get category with FAQs
export function getCategoryWithFAQs(categoryId: string): FAQCategory | null {
  const category = faqCategories.find((cat) => cat.id === categoryId)
  if (!category) return null

  return {
    ...category,
    faqs: getFAQsByCategory(categoryId),
  }
}

// Helper function to get all categories with their FAQs
export function getAllCategoriesWithFAQs(): FAQCategory[] {
  return faqCategories
    .map((category) => ({
      ...category,
      faqs: getFAQsByCategory(category.id),
    }))
    .sort((a, b) => (a.order || 0) - (b.order || 0))
}

// Helper function to search FAQs
export function searchFAQs(query: string): FAQ[] {
  const lowerQuery = query.toLowerCase()
  return faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(lowerQuery) ||
      faq.answer.toLowerCase().includes(lowerQuery)
  )
}



