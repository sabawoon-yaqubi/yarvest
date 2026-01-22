"use client";

import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { Footer } from "@/components/footer";
import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  MapPin,
  Filter,
  X,
  Map as MapIcon,
  List,
  Leaf,
  Phone,
  Globe,
  Navigation,
} from "lucide-react";
import {
  parseFarmsCSV,
  getUniqueStates,
  getUniqueProduceTypes,
  type Farm,
} from "@/lib/farms-data";
import dynamic from "next/dynamic";

// Dynamically import map to avoid SSR issues
const FarmsMap = dynamic(
  () =>
    import("@/components/farms-map").then((mod) => ({ default: mod.FarmsMap })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[600px] bg-gray-50 rounded-xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#5a9c3a] border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading map...</p>
        </div>
      </div>
    ),
  }
);

export default function FarmsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedProduce, setSelectedProduce] = useState<string>("");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [showFilters, setShowFilters] = useState(false);

  // Load farms data
  useEffect(() => {
    async function loadFarms() {
      try {
        // Add timestamp to bypass cache
        const timestamp = new Date().getTime();
        const response = await fetch(`/farms_fixed.csv?t=${timestamp}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        });
        const csvText = await response.text();
        const parsedFarms = parseFarmsCSV(csvText);
        console.log(`Loaded ${parsedFarms.length} farms from CSV`);
        setFarms(parsedFarms);
      } catch (error) {
        console.error("Error loading farms:", error);
      } finally {
        setLoading(false);
      }
    }
    loadFarms();
  }, []);

  // Get unique states and produce types
  const states = useMemo(() => getUniqueStates(farms), [farms]);
  const produceTypes = useMemo(() => getUniqueProduceTypes(farms), [farms]);

  // Filter farms
  const filteredFarms = useMemo(() => {
    return farms.filter((farm) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          farm.name.toLowerCase().includes(query) ||
          farm.city.toLowerCase().includes(query) ||
          farm.state.toLowerCase().includes(query) ||
          farm.produce.toLowerCase().includes(query) ||
          farm.full_address.toLowerCase().includes(query);

        if (!matchesSearch) return false;
      }

      // State filter
      if (selectedState && farm.state !== selectedState) {
        return false;
      }

      // Produce filter
      if (
        selectedProduce &&
        !farm.produce.toLowerCase().includes(selectedProduce.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }, [farms, searchQuery, selectedState, selectedProduce]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedState("");
    setSelectedProduce("");
  };

  const hasActiveFilters = searchQuery || selectedState || selectedProduce;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1 overflow-auto bg-gradient-to-b from-white via-gray-50/50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-[#5a9c3a]/10 rounded-xl">
                <Leaf className="h-8 w-8 text-[#5a9c3a]" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Find Farms</h1>
                <p className="text-gray-600 mt-1">
                  Discover local farms and U-Pick locations near you
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-4 mt-6">
              <div className="px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="text-2xl font-bold text-[#5a9c3a]">
                  {farms.length}
                </div>
                <div className="text-sm text-gray-600">Total Farms</div>
              </div>
              <div className="px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="text-2xl font-bold text-[#5a9c3a]">
                  {filteredFarms.length}
                </div>
                <div className="text-sm text-gray-600">Showing</div>
              </div>
              <div className="px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="text-2xl font-bold text-[#5a9c3a]">
                  {states.length}
                </div>
                <div className="text-sm text-gray-600">States</div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search farms by name, location, or produce..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>

              {/* View Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  onClick={() => setViewMode("list")}
                  className="h-12 px-4"
                >
                  <List className="h-4 w-4 mr-2" />
                  List
                </Button>
                <Button
                  variant={viewMode === "map" ? "default" : "outline"}
                  onClick={() => setViewMode("map")}
                  className="h-12 px-4"
                >
                  <MapIcon className="h-4 w-4 mr-2" />
                  Map
                </Button>
              </div>
            </div>

            {/* Filter Toggles */}
            <div className="flex flex-wrap gap-3">
              <Button
                variant={showFilters ? "default" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
                className="h-10"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>

              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="h-10 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}

              {selectedState && (
                <Badge
                  variant="secondary"
                  className="h-10 px-4 flex items-center gap-2"
                >
                  State: {selectedState}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setSelectedState("")}
                  />
                </Badge>
              )}

              {selectedProduce && (
                <Badge
                  variant="secondary"
                  className="h-10 px-4 flex items-center gap-2"
                >
                  Produce: {selectedProduce}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setSelectedProduce("")}
                  />
                </Badge>
              )}
            </div>

            {/* Filter Dropdowns */}
            {showFilters && (
              <Card className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* State Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Filter by State
                    </label>
                    <select
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#5a9c3a] focus:border-transparent"
                    >
                      <option value="">All States</option>
                      {states.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Produce Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Filter by Produce
                    </label>
                    <select
                      value={selectedProduce}
                      onChange={(e) => setSelectedProduce(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#5a9c3a] focus:border-transparent"
                    >
                      <option value="">All Produce</option>
                      {produceTypes.map((produce) => (
                        <option key={produce} value={produce}>
                          {produce}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#5a9c3a] border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Loading farms...</p>
              </div>
            </div>
          ) : viewMode === "map" ? (
            <div className="h-[600px] rounded-xl overflow-hidden shadow-lg border border-gray-200">
              <FarmsMap farms={filteredFarms} />
            </div>
          ) : (
            <>
              {filteredFarms.length === 0 ? (
                <Card className="p-12 text-center">
                  <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No farms found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your filters or search query
                  </p>
                  {hasActiveFilters && (
                    <Button onClick={clearFilters} variant="outline">
                      Clear Filters
                    </Button>
                  )}
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredFarms.map((farm, index) => (
                    <FarmCard key={index} farm={farm} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        <Footer />
      </main>
    </div>
  );
}

// Farm Card Component
function FarmCard({ farm }: { farm: Farm }) {
  // Utility function to truncate long text
  const truncateText = (text: string, maxLength: number = 100): string => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3).trim() + "...";
  };

  const produceList = farm.produce
    ? farm.produce
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean)
    : [];

  // Get address for Google Maps directions
  const getDirectionsUrl = () => {
    const address =
      farm.full_address ||
      `${farm.address}, ${farm.city}, ${farm.state} ${farm.zip}`.trim();
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
      address
    )}`;
  };

  // Parse farm type (can be comma-separated)
  const farmTypes = farm.farm_type
    ? farm.farm_type
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  // Truncate long fields for better UI
  const truncatedName = truncateText(farm.name, 60);
  const truncatedAddress = truncateText(
    farm.full_address || farm.address || "",
    80
  );
  const truncatedCityState =
    farm.city && farm.state
      ? truncateText(`${farm.city}, ${farm.state}`, 50)
      : truncateText(
          farm.full_address || farm.address || "Location not specified",
          50
        );

  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle
              className="text-xl mb-2 group-hover:text-[#5a9c3a] transition-colors wrap-break-word line-clamp-2"
              title={farm.name}
            >
              {truncatedName}
            </CardTitle>
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4 text-[#5a9c3a] shrink-0 mt-0.5" />
              <span
                className="wrap-break-word line-clamp-2"
                title={
                  farm.city && farm.state
                    ? `${farm.city}, ${farm.state}`
                    : farm.full_address ||
                      farm.address ||
                      "Location not specified"
                }
              >
                {truncatedCityState}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 flex flex-col">
        {/* Farm Type */}
        {farmTypes.length > 0 && (
          <div>
            <div className="flex flex-wrap gap-2">
              {farmTypes.slice(0, 3).map((type, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="bg-[#5a9c3a]/10 text-[#5a9c3a] border-[#5a9c3a]/20 text-xs wrap-break-word"
                >
                  {type}
                </Badge>
              ))}
              {farmTypes.length > 3 && (
                <Badge
                  variant="outline"
                  className="bg-[#5a9c3a]/10 text-[#5a9c3a] border-[#5a9c3a]/20 text-xs"
                >
                  +{farmTypes.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Produce */}
        {produceList.length > 0 && (
          <div className="shrink-0">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Available Produce:
            </p>
            <div className="flex flex-wrap gap-2">
              {produceList.slice(0, 5).map((produce, idx) => {
                const truncatedProduce = truncateText(produce, 20);
                return (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="text-xs wrap-break-word"
                    title={produce}
                  >
                    {truncatedProduce}
                  </Badge>
                );
              })}
              {produceList.length > 5 && (
                <Badge variant="secondary" className="text-xs">
                  +{produceList.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Spacer to push buttons to bottom */}
        <div className="flex-1"></div>

        {/* Actions */}
        <div className="space-y-3 pt-2 border-t border-gray-100">
          {/* Directions Button */}
          <a
            href={getDirectionsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            <Button className="w-full bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white">
              <Navigation className="h-4 w-4 mr-2" />
              Get Directions
            </Button>
          </a>

          {/* Contact Info */}
          <div className="flex flex-wrap gap-3 text-xs">
            {farm.phone && (
              <div className="flex items-center gap-1.5 text-gray-600 min-w-0">
                <Phone className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate" title={farm.phone}>
                  {truncateText(farm.phone, 20)}
                </span>
              </div>
            )}
            {farm.website && (
              <a
                href={
                  farm.website.startsWith("http")
                    ? farm.website
                    : `https://${farm.website}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[#5a9c3a] hover:underline flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <Globe className="h-3.5 w-3.5 shrink-0" />
                <span>Website</span>
              </a>
            )}
          </div>

          {/* Full Address */}
          {farm.full_address && (
            <p
              className="text-xs text-gray-500 wrap-break-word line-clamp-2 overflow-hidden text-ellipsis"
              title={farm.full_address}
            >
              {truncatedAddress}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
