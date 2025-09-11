// File: src/renderer/src/pages/dashboard/overview.tsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import {
  BarChart3,
  Database,
  FileText,
  FormInput,
  Plus,
  ArrowRight,
  Users,
  Activity,
  TrendingUp,
  Download
} from 'lucide-react'
import { ROUTES } from '../../routes'

const collections = []
const forms = []
const reports = []
const DashboardOverview: React.FC = () => {
  const navigate = useNavigate()
  // const { setLoading } = useAppStore()
  // const { collections } = useDataStore()
  // const { forms } = useFormBuilderStore()
  // const { reports } = useReportBuilderStore()

  // Stats data
  const stats = [
    {
      title: 'Total Collections',
      value: collections.length,
      icon: Database,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100',
      description: 'Data collections available'
    },
    {
      title: 'Forms Created',
      value: forms.length,
      icon: FormInput,
      color: 'text-green-500',
      bgColor: 'bg-green-100',
      description: 'JSON form configurations'
    },
    {
      title: 'Reports Generated',
      value: reports.length,
      icon: FileText,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100',
      description: 'PDF report templates'
    },
    {
      title: 'Total Records',
      value: collections.reduce((acc) => acc + Math.floor(Math.random() * 1000), 0),
      icon: Users,
      color: 'text-orange-500',
      bgColor: 'bg-orange-100',
      description: 'Across all collections'
    }
  ]

  const quickActions = [
    {
      title: 'Create New Form',
      description: 'Build a new JSON form configuration',
      icon: FormInput,
      action: () => navigate(ROUTES.FORMS_CREATE.$path()),
      color: 'text-green-600'
    },
    {
      title: 'Generate Report',
      description: 'Create a new PDF report template',
      icon: FileText,
      action: () => navigate(ROUTES.REPORTS_CREATE.$path()),
      color: 'text-purple-600'
    },
    // {
    //   title: 'Browse Data',
    //   description: 'View and manage your data collections',
    //   icon: Database,
    //   action: () => navigate(ROUTES.DATA_COLLECTIONS.$path()),
    //   color: 'text-blue-600'
    // },
    {
      title: 'View Analytics',
      description: 'See detailed usage statistics',
      icon: BarChart3,
      action: () => navigate(ROUTES.DASHBOARD_ANALYTICS.$path()),
      color: 'text-orange-600'
    }
  ]

  const recentActivities = [
    {
      action: 'Form Created',
      target: 'User Registration Form',
      time: '2 minutes ago',
      icon: FormInput,
      color: 'text-green-500'
    },
    {
      action: 'Report Generated',
      target: 'Sales Summary Q3',
      time: '15 minutes ago',
      icon: FileText,
      color: 'text-purple-500'
    },
    {
      action: 'Data Updated',
      target: 'Users Collection',
      time: '1 hour ago',
      icon: Database,
      color: 'text-blue-500'
    },
    {
      action: 'Validation Schema',
      target: 'Product Schema Updated',
      time: '2 hours ago',
      icon: Activity,
      color: 'text-orange-500'
    }
  ]

  const handleNavigation = (path: string): void => {
    navigate(path)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground">
            Welcome to Zhidesk - Your low-code desktop platform
          </p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export Dashboard
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>Get started with these quick actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {quickActions.map((action, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 cursor-pointer transition-colors"
                // onClick={() => handleNavigation(action.action())}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full bg-accent`}>
                    <action.icon className={`h-4 w-4 ${action.color}`} />
                  </div>
                  <div>
                    <h4 className="font-medium">{action.title}</h4>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest activities in your workspace</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className={`p-2 rounded-full bg-accent mt-1`}>
                  <activity.icon className={`h-4 w-4 ${activity.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{activity.action}</span>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{activity.target}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>Current status of Zhidesk platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <p className="font-medium text-green-800">Database</p>
                <p className="text-sm text-green-600">Connected & Healthy</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div>
                <p className="font-medium text-blue-800">ORPC Server</p>
                <p className="text-sm text-blue-600">Running Smoothly</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium text-green-800">Memory</p>
                <p className="text-sm text-green-600">Optimal Usage</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Create Buttons */}
      <div className="flex flex-wrap gap-4">
        <Button
          onClick={() => handleNavigation(ROUTES.FORMS_CREATE.$path())}
          variant="outline"
          className="flex items-center gap-2"
        >
          <FormInput className="h-4 w-4" />
          New Form
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => handleNavigation(ROUTES.REPORTS_CREATE.$path())}
          variant="outline"
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          New Report
          <Plus className="h-4 w-4" />
        </Button>
        {/* <Button
          onClick={() => handleNavigation(ROUTES.DATABASE.$path())}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Database className="h-4 w-4" />
          Manage Data
          <ArrowRight className="h-4 w-4" />
        </Button> */}
      </div>
    </div>
  )
}

export default DashboardOverview
