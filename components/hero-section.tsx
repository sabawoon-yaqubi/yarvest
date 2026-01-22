"use client";

import { Button } from "@/components/ui/button";
import {
  ShoppingBag,
  Store,
  Leaf,
} from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  return (
    <div className="relative overflow-hidden rounded-3xl mx-6 mt-6 shadow-2xl">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0">
        <img
          src="https://www.pennington.com/-/media/Project/OneWeb/Pennington/Images/garden/blog/how-to-grow-tasty-homegrown-vegetables/how-to-grow-tasty-homegrown-tomatoes.jpg?h=617&iar=0&w=1200&hash=6796412BBDA9C344CCBE8B81F87E1928"
          alt="Fresh produce"
          className="w-full h-full object-cover object-center brightness-110 contrast-110 saturate-110"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#5a9c3a]/75 via-[#5a9c3a]/70 to-[#5a9c3a]/65"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#5a9c3a]/35 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24 lg:py-32">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Leaf className="w-4 h-4" />
            <span>Supporting Local Farms & Neighbors</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-tight text-white">
            Share your produce & tools with your{" "}
            <span className="text-yellow-300 drop-shadow-lg">neighbors</span>
          </h1>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/products">
              <Button
                size="lg"
                className="bg-white text-[#5a9c3a] hover:bg-gray-50 text-base md:text-lg px-8 py-6 rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all hover:scale-105"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Shop Now
              </Button>
            </Link>
            <Link href="/admin/products/new">
              <Button
                size="lg"
                className="bg-white text-[#5a9c3a] hover:bg-gray-50 text-base md:text-lg px-8 py-6 rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all hover:scale-105"
              >
                <Store className="w-5 h-5 mr-2" />
                List Produce
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
