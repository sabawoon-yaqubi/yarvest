"use client"

import { useEffect, useState } from "react"

export function YarvestLoader() {
  const [dots, setDots] = useState("")

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."))
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50">
      <div className="flex flex-col items-center gap-6">
        {/* Animated Leaf Icon */}
        <div className="relative">
          {/* Background glow */}
          <div className="absolute inset-0 animate-pulse rounded-full bg-emerald-400/20 blur-2xl" />
          
          {/* Rotating leaves */}
          <div className="relative">
            <div className="animate-spin-slow">
              <svg
                width="80"
                height="80"
                viewBox="0 0 80 80"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-lg"
              >
                {/* Leaf 1 */}
                <path
                  d="M40 10C40 10 30 20 30 35C30 45 35 50 40 50C45 50 50 45 50 35C50 20 40 10 40 10Z"
                  fill="#16a34a"
                  className="animate-pulse"
                  style={{ animationDelay: "0s" }}
                />
                {/* Leaf 2 */}
                <path
                  d="M40 30C40 30 50 40 65 40C75 40 80 35 80 30C80 25 75 20 65 20C50 20 40 30 40 30Z"
                  fill="#22c55e"
                  className="animate-pulse"
                  style={{ animationDelay: "0.2s" }}
                />
                {/* Leaf 3 */}
                <path
                  d="M40 30C40 30 30 40 15 40C5 40 0 35 0 30C0 25 5 20 15 20C30 20 40 30 40 30Z"
                  fill="#15803d"
                  className="animate-pulse"
                  style={{ animationDelay: "0.4s" }}
                />
                {/* Center circle */}
                <circle cx="40" cy="30" r="6" fill="#84cc16" />
              </svg>
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-2xl font-bold text-emerald-800">Yarvest</h2>
          <p className="text-sm font-medium text-emerald-600">Loading fresh goodness{dots}</p>
        </div>

        {/* Progress Bar */}
        <div className="w-48 h-1.5 bg-emerald-200 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-500 via-green-500 to-lime-500 animate-progress rounded-full" />
        </div>

        {/* Bouncing Fruits */}
        <div className="flex gap-3 mt-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
          <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
          <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
        </div>
      </div>
    </div>
  )
}

