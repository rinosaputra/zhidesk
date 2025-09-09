// File: src/renderer/src/pages/settings/SettingsPage.tsx
import React, { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@renderer/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@renderer/components/ui/tabs'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Label } from '@renderer/components/ui/label'
import { Switch } from '@renderer/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'
import { Separator } from '@renderer/components/ui/separator'
import { Badge } from '@renderer/components/ui/badge'
import {
  Settings,
  Database,
  Palette,
  User,
  Bell,
  Save,
  RotateCcw,
  Download,
  Upload
} from 'lucide-react'
import useThemeStore from '@renderer/components/theme/store'

const SelectTheme: React.FC = () => {
  const { setTheme, theme } = useThemeStore()
  return (
    <div className="space-y-2">
      <Label htmlFor="theme">Theme</Label>
      <Select value={theme} onValueChange={(value) => setTheme(value as 'system')}>
        <SelectTrigger>
          <SelectValue placeholder="Select theme" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="light">Light</SelectItem>
          <SelectItem value="dark">Dark</SelectItem>
          <SelectItem value="system">System</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general')

  // Default values from store or local storage
  const [settings, setSettings] = useState({
    theme: 'system',
    language: 'id',
    autoSave: true,
    notifications: true,
    backupInterval: 'daily'
  })

  const handleSave = (): void => {
    // Save settings to store or local storage
    console.log('Settings saved:', settings)
  }

  const handleReset = (): void => {
    setSettings({
      theme: 'system',
      language: 'id',
      autoSave: true,
      notifications: true,
      backupInterval: 'daily'
    })
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Settings className="w-8 h-8" />
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Kelola pengaturan aplikasi Zhidesk</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            <span className="hidden sm:inline">Database</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Account</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Pengaturan umum aplikasi Zhidesk</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={settings.language}
                    onValueChange={(value) => setSettings({ ...settings, language: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="id">Indonesia</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backupInterval">Auto Backup</Label>
                  <Select
                    value={settings.backupInterval}
                    onValueChange={(value) => setSettings({ ...settings, backupInterval: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select interval" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="autoSave">Auto Save</Label>
                    <p className="text-sm text-muted-foreground">
                      Simpan perubahan secara otomatis
                    </p>
                  </div>
                  <Switch
                    id="autoSave"
                    checked={settings.autoSave}
                    onCheckedChange={(checked) => setSettings({ ...settings, autoSave: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notifications">Notifications</Label>
                    <p className="text-sm text-muted-foreground">Aktifkan notifikasi aplikasi</p>
                  </div>
                  <Switch
                    id="notifications"
                    checked={settings.notifications}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, notifications: checked })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Sesuaikan tampilan aplikasi Zhidesk</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <SelectTheme />

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold">Preview</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="border rounded-lg p-4 text-center">
                    <div className="bg-white h-20 mb-2 rounded"></div>
                    <span className="text-sm">Light</span>
                  </div>
                  <div className="border rounded-lg p-4 text-center">
                    <div className="bg-gray-900 h-20 mb-2 rounded"></div>
                    <span className="text-sm">Dark</span>
                  </div>
                  <div className="border rounded-lg p-4 text-center">
                    <div className="bg-gradient-to-r from-white to-gray-900 dark:from-gray-800 dark:to-gray-900 h-20 mb-2 rounded"></div>
                    <span className="text-sm">System</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Database Settings */}
        <TabsContent value="database">
          <Card>
            <CardHeader>
              <CardTitle>Database Settings</CardTitle>
              <CardDescription>Kelola database dan backup data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Database Info</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Collections:</span>
                        <Badge variant="secondary">12</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Documents:</span>
                        <Badge variant="secondary">1,245</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Database Size:</span>
                        <Badge variant="secondary">15.2 MB</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Backup & Restore</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="w-4 h-4 mr-2" />
                      Backup Now
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Upload className="w-4 h-4 mr-2" />
                      Restore Backup
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold">Advanced</h3>
                <Button variant="destructive" className="w-full">
                  Clear All Data
                </Button>
                <p className="text-sm text-muted-foreground">
                  Hati-hati: Tindakan ini akan menghapus semua data dan tidak dapat dibatalkan.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Kelola notifikasi aplikasi</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Kirim notifikasi via email</p>
                  </div>
                  <Switch id="emailNotifications" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="desktopNotifications">Desktop Notifications</Label>
                    <p className="text-sm text-muted-foreground">Tampilkan notifikasi desktop</p>
                  </div>
                  <Switch id="desktopNotifications" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="soundNotifications">Sound Notifications</Label>
                    <p className="text-sm text-muted-foreground">Mainkan suara untuk notifikasi</p>
                  </div>
                  <Switch id="soundNotifications" />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold">Notification Types</h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="successNotifications">Success Notifications</Label>
                    <Switch id="successNotifications" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="errorNotifications">Error Notifications</Label>
                    <Switch id="errorNotifications" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="warningNotifications">Warning Notifications</Label>
                    <Switch id="warningNotifications" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="infoNotifications">Info Notifications</Label>
                    <Switch id="infoNotifications" defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Settings */}
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Kelola informasi akun Anda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" defaultValue="John Doe" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" defaultValue="john.doe@example.com" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" defaultValue="johndoe" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input id="bio" placeholder="Tell us about yourself" />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold">Change Password</h3>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" type="password" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold text-destructive">Danger Zone</h3>

                <div className="space-y-3">
                  <Button variant="destructive">Delete Account</Button>
                  <p className="text-sm text-muted-foreground">
                    Hati-hati: Tindakan ini akan menghapus akun Anda dan semua data yang terkait.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex items-center gap-4 justify-end">
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  )
}

export default SettingsPage
