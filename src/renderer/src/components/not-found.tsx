// File: src/renderer/src/pages/not-found.tsx (Alternatif)
import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { AlertCircle, Home, ArrowLeft, Mail } from 'lucide-react'
import { ROUTES } from '../routes'

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-blue-50/50 to-muted/50 p-4">
      <div className="text-center space-y-8 w-full max-w-md">
        {/* Animated 404 */}
        <div className="relative">
          <div className="text-9xl font-bold text-primary/20 select-none">404</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <AlertCircle className="h-24 w-24 text-destructive animate-pulse" />
          </div>
        </div>

        {/* Content */}
        <Card className="w-full shadow-xl border-0">
          <CardHeader className="space-y-4">
            <CardTitle className="text-2xl font-bold text-foreground">Page Not Found</CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              We couldn{"'"}t find the page you{"'"}re looking for
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Debug Info */}
            <div className="text-left bg-muted/50 p-4 rounded-lg">
              <p className="text-sm font-medium text-muted-foreground">Attempted to access:</p>
              <code className="text-xs bg-background p-2 rounded mt-2 block break-all">
                {location.pathname}
              </code>
            </div>

            {/* Suggestions */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Here are some things you can try:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button
                  onClick={() => {
                    navigate(-1)
                  }}
                  variant="outline"
                  className="h-14 flex flex-col gap-1"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span className="text-xs">Go Back</span>
                </Button>

                <Button
                  onClick={() => {
                    navigate(ROUTES.DASHBOARD_OVERVIEW.$path())
                  }}
                  className="h-14 flex flex-col gap-1"
                >
                  <Home className="h-5 w-5" />
                  <span className="text-xs">Home Page</span>
                </Button>
              </div>
            </div>

            {/* Support Section */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Need assistance?</span>
              </div>
              <a
                href="mailto:support@zhidesk.com"
                className="text-primary hover:underline font-medium text-sm"
              >
                support@zhidesk.com
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Branding */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Zhidesk • Low-Code Desktop Platform</p>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
