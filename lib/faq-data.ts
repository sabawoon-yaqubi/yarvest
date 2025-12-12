import { FAQCategory, FAQ } from "@/types/faq"
import { BookOpen, MessageCircle, HelpCircle, CheckCircle, Package, CreditCard, Shield, Truck } from "lucide-react"

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
    id: "orders-delivery",
    title: "Orders & Delivery",
    icon: Truck,
    description: "Everything about placing and tracking orders",
    order: 2,
  },
  {
    id: "products",
    title: "Products",
    icon: Package,
    description: "Information about our products",
    order: 3,
  },
  {
    id: "account-billing",
    title: "Account & Billing",
    icon: CreditCard,
    description: "Manage your account and billing",
    order: 4,
  },
  {
    id: "payment-security",
    title: "Payment & Security",
    icon: Shield,
    description: "Payment methods and security information",
    order: 5,
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
    answer: "Yes! You can download our mobile app from the App Store or Google Play Store for iOS and Android devices.",
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
    answer: "We offer same-day delivery, next-day delivery, and scheduled deliveries. Delivery options vary by location.",
    order: 1,
  },
  {
    id: 6,
    categoryId: "orders-delivery",
    question: "How do I track my order?",
    answer: "You'll receive a tracking link via email once your order ships. You can also track orders in your account dashboard.",
    order: 2,
  },
  {
    id: 7,
    categoryId: "orders-delivery",
    question: "What if I'm not satisfied with my order?",
    answer: "Contact us within 48 hours for a full refund or replacement. We stand behind the quality of all our products.",
    order: 3,
  },
  {
    id: 8,
    categoryId: "orders-delivery",
    question: "Can I modify or cancel my order?",
    answer: "You can modify or cancel your order within 1 hour of placing it. After that, please contact our support team.",
    order: 4,
  },
  {
    id: 9,
    categoryId: "orders-delivery",
    question: "What are your delivery hours?",
    answer: "We deliver Monday through Saturday from 9 AM to 8 PM. Sunday deliveries are available in select areas.",
    order: 5,
  },
  {
    id: 10,
    categoryId: "orders-delivery",
    question: "Is there a minimum order amount?",
    answer: "Yes, we have a minimum order amount of $25 for free delivery. Orders below this amount may incur a delivery fee.",
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
