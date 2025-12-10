export function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="relative">
        {/* Animated carrots/vegetables */}
        <div className="flex items-end justify-center gap-4 mb-6">
          {/* Left carrot */}
          <div className="animate-bounce" style={{ animationDelay: "0ms", animationDuration: "1000ms" }}>
            <svg className="w-8 h-12 text-[#0A5D31] opacity-60" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L10 8L8 6L7 10L5 9L6 14L4 13L6 18C6 18 7 22 12 22C17 22 18 18 18 18L20 13L18 14L19 9L17 10L16 6L14 8L12 2Z" />
            </svg>
          </div>
          
          {/* Center carrot - larger and different timing */}
          <div className="animate-bounce" style={{ animationDelay: "150ms", animationDuration: "1000ms" }}>
            <svg className="w-10 h-16 text-[#0A5D31]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L10 8L8 6L7 10L5 9L6 14L4 13L6 18C6 18 7 22 12 22C17 22 18 18 18 18L20 13L18 14L19 9L17 10L16 6L14 8L12 2Z" />
            </svg>
          </div>
          
          {/* Right carrot */}
          <div className="animate-bounce" style={{ animationDelay: "300ms", animationDuration: "1000ms" }}>
            <svg className="w-8 h-12 text-[#0A5D31] opacity-60" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L10 8L8 6L7 10L5 9L6 14L4 13L6 18C6 18 7 22 12 22C17 22 18 18 18 18L20 13L18 14L19 9L17 10L16 6L14 8L12 2Z" />
            </svg>
          </div>
        </div>
        
        {/* Loading text */}
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-700 mb-1">Loading fresh products...</p>
          <div className="flex items-center justify-center gap-1">
            <span className="w-2 h-2 bg-[#0A5D31] rounded-full animate-pulse" style={{ animationDelay: "0ms" }}></span>
            <span className="w-2 h-2 bg-[#0A5D31] rounded-full animate-pulse" style={{ animationDelay: "200ms" }}></span>
            <span className="w-2 h-2 bg-[#0A5D31] rounded-full animate-pulse" style={{ animationDelay: "400ms" }}></span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function PageLoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <LoadingSpinner />
    </div>
  )
}

