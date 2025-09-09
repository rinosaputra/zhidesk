// Error boundary component
export const ErrorBoundary: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-destructive mb-4">Something went wrong</h1>
      <p className="text-gray-600">Please try refreshing the page</p>
    </div>
  </div>
)

// Loading component
export const RouteLoading: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
)
