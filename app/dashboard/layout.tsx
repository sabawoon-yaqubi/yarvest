"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import api from "@/lib/axios";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  Leaf,
  DollarSign,
  BarChart3,
  Calendar,
  HeartHandshake,
  Award,
  TrendingUp,
  MapPin,
  Settings,
  Menu,
  X,
  LogOut,
  User,
  Home,
  CreditCard,
  FileCheck,
  Star,
  Car,
  Wrench,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { getImageUrl } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const COLORS = {
  primary: "#5a9c3a",
  primaryDark: "#0d7a3f",
  primaryLight: "#7ab856",
  accent: "#e8f5e9",
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const logout = useAuthStore((state) => state.logout);

  const [userRoles, setUserRoles] = useState<string[]>([]);

  useEffect(() => {
    if (user && !isLoading) {
      const roles = (user as any).roles?.map((r: any) => r.name) || [];
      if (roles.length > 0) {
        setUserRoles(roles);
      } else {
        api
          .get("/user/roles")
          .then((response) => {
            const apiRoles =
              response.data?.data?.roles?.map((r: any) => r.name) || [];
            setUserRoles(apiRoles);
          })
          .catch(() => {
            setUserRoles(["Buyer"]);
          });
      }
    }
  }, [user, isLoading]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  const hasBuyer = userRoles.some((r: string) => r.toLowerCase() === "buyer");
  const hasSeller = userRoles.some((r: string) => r.toLowerCase() === "seller");
  const hasHelper = userRoles.some((r: string) => r.toLowerCase() === "helper");
  const hasCourier = userRoles.some(
    (r: string) => r.toLowerCase() === "courier"
  );

  type MenuItem = {
    icon: any;
    label: string;
    href: string;
    section: string;
  };

  const allMenuItems: MenuItem[] = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      href: "/dashboard",
      section: "main",
    },
    {
      icon: BarChart3,
      label: "Analytics",
      href: "/admin/analytics",
      section: "main",
    },
  ];

  // Buyer menu items
  if (hasBuyer) {
    allMenuItems.push(
      {
        icon: ShoppingCart,
        label: "My Orders",
        href: "/orders",
        section: "buyer",
      },
      
      {
        icon: HeartHandshake,
        label: "Favorites",
        href: "/admin/favorites",
        section: "buyer",
      }
    );
  }

  // Seller menu items
  if (hasSeller) {
    allMenuItems.push(
      {
        icon: Package,
        label: "Products",
        href: "/admin/products",
        section: "seller",
      },
      {
        icon: ShoppingCart,
        label: "Orders",
        href: "/admin/orders",
        section: "seller",
      },
      {
        icon: Leaf,
        label: "Harvest Requests",
        href: "/admin/harvest-requests",
        section: "seller",
      }
     
    );
  }

  // Helper menu items
  if (hasHelper) {
    allMenuItems.push(
      {
        icon: Leaf,
        label: "Harvesting",
        href: "/volunteers/harvesting",
        section: "helper",
      },
      {
        icon: Calendar,
        label: "Schedule",
        href: "/volunteers/schedule",
        section: "helper",
      },
      {
        icon: Award,
        label: "Impact",
        href: "/volunteers/impact",
        section: "helper",
      },
      {
        icon: DollarSign,
        label: "Earnings",
        href: "/volunteers/earnings",
        section: "helper",
      },
      {
        icon: Truck,
        label: "Deliveries",
        href: "/volunteers/deliveries",
        section: "helper",
      },
      {
        icon: TrendingUp,
        label: "Performance",
        href: "/volunteers/performance",
        section: "helper",
      },
      {
        icon: Wrench,
        label: "Equipment",
        href: "/dashboard/equipment",
        section: "helper",
      }
    );
  }

  // Courier menu items
  if (hasCourier) {
    allMenuItems.push(
      {
        icon: Truck,
        label: "Deliveries",
        href: "/courier/deliveries",
        section: "courier",
      },
      {
        icon: MapPin,
        label: "Routes",
        href: "/courier/routes",
        section: "courier",
      },
      {
        icon: DollarSign,
        label: "Earnings",
        href: "/courier/earnings",
        section: "courier",
      },
      {
        icon: TrendingUp,
        label: "Performance",
        href: "/courier/performance",
        section: "courier",
      },
      {
        icon: DollarSign,
        label: "Pricing",
        href: "/dashboard/pricing",
        section: "courier",
      },
      {
        icon: Car,
        label: "Vehicles",
        href: "/dashboard/vehicles",
        section: "courier",
      }
    );
  }

  // Profile/Account section - available for all users
  allMenuItems.push(
    {
      icon: CreditCard,
      label: "Bank Accounts",
      href: "/dashboard/bank-accounts",
      section: "account",
    },
    {
      icon: FileCheck,
      label: "Verifications",
      href: "/dashboard/verifications",
      section: "account",
    },
    {
      icon: Star,
      label: "Reviews",
      href: "/dashboard/reviews",
      section: "account",
    },
    
    {
      icon: HeartHandshake,
      label: "Donations",
      href: "/dashboard/donations",
      section: "account",
    },
    {
      icon: Users,
      label: "Referrals",
      href: "/dashboard/referrals",
      section: "account",
    }
  );

  // Settings - single entry at the end for all users
  allMenuItems.push({
    icon: Settings,
    label: "Settings",
    href: "/settings",
    section: "settings",
  });

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-white">
        <div className="flex-1 overflow-auto flex items-center justify-center">
          <div
            className="w-8 h-8 border-4 rounded-full animate-spin"
            style={{
              borderColor: `${COLORS.primary} transparent ${COLORS.primary} ${COLORS.primary}`,
            }}
          />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 z-40 sticky top-0">
        <div className="flex items-center justify-between px-6 h-16">
          {/* Left: Logo and sidebar toggle */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="h-9 w-9 hover:bg-gray-50"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </Button>
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <img
                src="https://cdn.prod.website-files.com/67c12ad0bddda4257ffc4539/67c15cdb77981e22a226bc86_Navbar%20Brand.svg"
                alt="Yarvest"
                className="h-6 md:h-8"
              />
            </Link>
          </div>

          {/* Right: Profile Section */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-2 h-9 hover:bg-gray-50 rounded-lg"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-[#5a9c3a] to-[#0d7a3f] rounded-full flex items-center justify-center overflow-hidden ring-2 ring-white shadow-sm">
                  {user?.image || (user as any)?.profile_picture ? (
                    <img
                      src={getImageUrl(
                        user.image || (user as any).profile_picture
                      )}
                      alt={user?.first_name || "User"}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 text-white" />
                  )}
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-700">
                  {user?.first_name || "User"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 p-2 shadow-lg border border-gray-200"
            >
              {/* User Info Section */}
              <div className="px-3 py-3 mb-2 bg-gradient-to-br from-[#5a9c3a]/5 to-white rounded-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#5a9c3a] to-[#0d7a3f] rounded-full flex items-center justify-center overflow-hidden ring-2 ring-white shadow-sm">
                    {user?.image || (user as any)?.profile_picture ? (
                      <img
                        src={getImageUrl(
                          user.image || (user as any).profile_picture
                        )}
                        alt={user?.first_name || "User"}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {user?.first_name && user?.last_name
                        ? `${user.first_name} ${user.last_name}`
                        : user?.email?.split("@")[0] || "User"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
                {userRoles.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {userRoles.map((role, idx) => (
                      <Badge
                        key={`dropdown-role-${role}-${idx}`}
                        className="text-[10px] px-2 py-0.5 bg-[#5a9c3a]/10 text-[#5a9c3a] border border-[#5a9c3a]/20 font-medium"
                      >
                        {role}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <DropdownMenuSeparator className="my-2" />

              {/* Menu Items */}
              <DropdownMenuItem
                asChild
                className="px-3 py-2.5 rounded-lg cursor-pointer hover:bg-gray-50 focus:bg-gray-50 transition-colors"
              >
                <Link href="/settings" className="flex items-center w-full">
                  <Settings className="mr-3 h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Settings
                  </span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem
                asChild
                className="px-3 py-2.5 rounded-lg cursor-pointer hover:bg-gray-50 focus:bg-gray-50 transition-colors"
              >
                <Link href="/" className="flex items-center w-full">
                  <Home className="mr-3 h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Home
                  </span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-2" />

              <DropdownMenuItem
                onClick={handleLogout}
                className="px-3 py-2.5 rounded-lg cursor-pointer hover:bg-red-50 focus:bg-red-50 text-red-600 transition-colors"
              >
                <LogOut className="mr-3 h-4 w-4" />
                <span className="text-sm font-medium">Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={cn(
            "bg-white border-r border-gray-100 transition-all duration-300 ease-in-out z-30",
            sidebarOpen ? "w-64" : "w-0 md:w-20",
            "hidden md:block"
          )}
        >
          <div className="h-full flex flex-col overflow-hidden">
            <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1 scrollbar-hide">
              {sidebarOpen ? (
                <>
                  {/* Main Section */}
                  <div className="mb-8">
                    <div className="space-y-1">
                      {allMenuItems
                        .filter((item) => item.section === "main")
                        .map((item) => {
                          const Icon = item.icon;
                          const isActive = pathname === item.href;
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                                isActive
                                  ? "text-white shadow-md"
                                  : "text-gray-700 hover:bg-gray-50"
                              )}
                              style={
                                isActive
                                  ? { backgroundColor: COLORS.primary }
                                  : {}
                              }
                            >
                              <Icon
                                className={cn(
                                  "w-5 h-5 flex-shrink-0",
                                  isActive ? "text-white" : "text-gray-500"
                                )}
                              />
                              <span className="text-sm font-medium">
                                {item.label}
                              </span>
                            </Link>
                          );
                        })}
                    </div>
                  </div>

                  {/* Buyer Section */}
                  {hasBuyer && (
                    <div className="mb-8">
                      <p className="text-xs font-semibold text-gray-400 uppercase mb-3 px-3 tracking-wider">
                        Buyer
                      </p>
                      <div className="space-y-1">
                        {allMenuItems
                          .filter((item) => item.section === "buyer")
                          .map((item) => {
                            const Icon = item.icon;
                            const isActive =
                              pathname === item.href ||
                              pathname?.startsWith(item.href);
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                                  isActive
                                    ? "text-white shadow-md"
                                    : "text-gray-700 hover:bg-gray-50"
                                )}
                                style={
                                  isActive
                                    ? { backgroundColor: COLORS.primary }
                                    : {}
                                }
                              >
                                <Icon
                                  className={cn(
                                    "w-5 h-5 flex-shrink-0",
                                    isActive ? "text-white" : "text-gray-500"
                                  )}
                                />
                                <span className="text-sm font-medium">
                                  {item.label}
                                </span>
                              </Link>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {/* Seller Section */}
                  {hasSeller && (
                    <div className="mb-8">
                      <p className="text-xs font-semibold text-gray-400 uppercase mb-3 px-3 tracking-wider">
                        Seller
                      </p>
                      <div className="space-y-1">
                        {allMenuItems
                          .filter((item) => item.section === "seller")
                          .map((item) => {
                            const Icon = item.icon;
                            const isActive =
                              pathname === item.href ||
                              pathname?.startsWith(item.href);
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                                  isActive
                                    ? "text-white shadow-md"
                                    : "text-gray-700 hover:bg-gray-50"
                                )}
                                style={
                                  isActive
                                    ? { backgroundColor: COLORS.primary }
                                    : {}
                                }
                              >
                                <Icon
                                  className={cn(
                                    "w-5 h-5 flex-shrink-0",
                                    isActive ? "text-white" : "text-gray-500"
                                  )}
                                />
                                <span className="text-sm font-medium">
                                  {item.label}
                                </span>
                              </Link>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {/* Helper Section */}
                  {hasHelper && (
                    <div className="mb-8">
                      <p className="text-xs font-semibold text-gray-400 uppercase mb-3 px-3 tracking-wider">
                        Helper
                      </p>
                      <div className="space-y-1">
                        {allMenuItems
                          .filter((item) => item.section === "helper")
                          .map((item) => {
                            const Icon = item.icon;
                            const isActive =
                              pathname === item.href ||
                              pathname?.startsWith(item.href);
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                                  isActive
                                    ? "text-white shadow-md"
                                    : "text-gray-700 hover:bg-gray-50"
                                )}
                                style={
                                  isActive
                                    ? { backgroundColor: COLORS.primary }
                                    : {}
                                }
                              >
                                <Icon
                                  className={cn(
                                    "w-5 h-5 flex-shrink-0",
                                    isActive ? "text-white" : "text-gray-500"
                                  )}
                                />
                                <span className="text-sm font-medium">
                                  {item.label}
                                </span>
                              </Link>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {/* Courier Section */}
                  {hasCourier && (
                    <div className="mb-8">
                      <p className="text-xs font-semibold text-gray-400 uppercase mb-3 px-3 tracking-wider">
                        Courier
                      </p>
                      <div className="space-y-1">
                        {allMenuItems
                          .filter((item) => item.section === "courier")
                          .map((item) => {
                            const Icon = item.icon;
                            const isActive =
                              pathname === item.href ||
                              pathname?.startsWith(item.href);
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                                  isActive
                                    ? "text-white shadow-md"
                                    : "text-gray-700 hover:bg-gray-50"
                                )}
                                style={
                                  isActive
                                    ? { backgroundColor: COLORS.primary }
                                    : {}
                                }
                              >
                                <Icon
                                  className={cn(
                                    "w-5 h-5 flex-shrink-0",
                                    isActive ? "text-white" : "text-gray-500"
                                  )}
                                />
                                <span className="text-sm font-medium">
                                  {item.label}
                                </span>
                              </Link>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {/* Account Section */}
                  <div className="mb-8">
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-3 px-3 tracking-wider">
                      Account
                    </p>
                    <div className="space-y-1">
                      {allMenuItems
                        .filter((item) => item.section === "account")
                        .map((item) => {
                          const Icon = item.icon;
                          const isActive =
                            pathname === item.href ||
                            pathname?.startsWith(item.href);
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                                isActive
                                  ? "text-white shadow-md"
                                  : "text-gray-700 hover:bg-gray-50"
                              )}
                              style={
                                isActive
                                  ? { backgroundColor: COLORS.primary }
                                  : {}
                              }
                            >
                              <Icon
                                className={cn(
                                  "w-5 h-5 flex-shrink-0",
                                  isActive ? "text-white" : "text-gray-500"
                                )}
                              />
                              <span className="text-sm font-medium">
                                {item.label}
                              </span>
                            </Link>
                          );
                        })}
                    </div>
                  </div>

                  {/* Settings Section - at the end */}
                  <div className="mt-auto pt-8 border-t border-gray-100">
                    <div className="space-y-1">
                      {allMenuItems
                        .filter((item) => item.section === "settings")
                        .map((item) => {
                          const Icon = item.icon;
                          const isActive =
                            pathname === item.href ||
                            pathname?.startsWith(item.href);
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                                isActive
                                  ? "text-white shadow-md"
                                  : "text-gray-700 hover:bg-gray-50"
                              )}
                              style={
                                isActive
                                  ? { backgroundColor: COLORS.primary }
                                  : {}
                              }
                            >
                              <Icon
                                className={cn(
                                  "w-5 h-5 flex-shrink-0",
                                  isActive ? "text-white" : "text-gray-500"
                                )}
                              />
                              <span className="text-sm font-medium">
                                {item.label}
                              </span>
                            </Link>
                          );
                        })}
                    </div>
                  </div>
                </>
              ) : (
                // Collapsed sidebar
                <div className="flex flex-col items-center gap-2 p-2">
                  {allMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      pathname === item.href || pathname?.startsWith(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200",
                          isActive
                            ? "text-white shadow-md"
                            : "text-gray-700 hover:bg-gray-50"
                        )}
                        style={
                          isActive ? { backgroundColor: COLORS.primary } : {}
                        }
                        title={item.label}
                      >
                        <Icon
                          className={cn(
                            "w-5 h-5",
                            isActive ? "text-white" : "text-gray-500"
                          )}
                        />
                      </Link>
                    );
                  })}
                </div>
              )}
            </nav>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <aside
          className={cn(
            "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-gray-100 z-30 transition-transform duration-300 ease-in-out md:hidden",
            sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full"
          )}
        >
          <div className="h-full flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <Link href="/dashboard" className="flex items-center gap-2">
                <div
                  className="h-7 w-7 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: COLORS.primary }}
                >
                  <span className="text-white font-bold">Y</span>
                </div>
                <span className="text-lg font-bold text-gray-900">Yarvest</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
              {allMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href || pathname?.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                      isActive
                        ? "text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                    style={isActive ? { backgroundColor: COLORS.primary } : {}}
                  >
                    <Icon
                      className={cn(
                        "w-5 h-5 flex-shrink-0",
                        isActive ? "text-white" : "text-gray-500"
                      )}
                    />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-white">{children}</main>
      </div>
    </div>
  );
}
