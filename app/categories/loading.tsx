import { LoadingSpinner } from "@/components/loading-spinner"

export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="px-4 sm:px-6 py-8 max-w-7xl mx-auto">
        <LoadingSpinner />
      </div>
    </div>
  )
}

