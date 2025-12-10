import { LoadingSpinner } from "@/components/loading-spinner"

export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="px-6 py-16 max-w-7xl mx-auto">
        <LoadingSpinner />
      </div>
    </div>
  )
}

