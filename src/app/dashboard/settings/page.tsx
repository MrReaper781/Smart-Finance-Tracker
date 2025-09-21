'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Bell, 
  Shield, 
  Globe, 
  Palette, 
  Trash2,
  Save,
  Upload
} from 'lucide-react';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    profile: {
      name: session?.user?.name || '',
      email: session?.user?.email || '',
      avatar: session?.user?.avatar || '',
    },
    preferences: {
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY',
      theme: 'system',
      language: 'en',
    },
    notifications: {
      email: true,
      push: true,
      budgetAlerts: true,
      goalReminders: true,
      weeklyReports: true,
    },
    privacy: {
      dataSharing: false,
      analytics: true,
      marketing: false,
    },
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      // Save settings to API
      console.log('Saving settings:', settings);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        // Delete account API call
        console.log('Deleting account...');
      } catch (error) {
        console.error('Error deleting account:', error);
      }
    }
  };

  const userInitials = session?.user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Profile</span>
            </CardTitle>
            <CardDescription>
              Update your personal information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={settings.profile.avatar} alt={settings.profile.name} />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
              <div>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Change Avatar
                </Button>
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG or GIF. Max size 2MB.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={settings.profile.name}
                onChange={(e) => setSettings({
                  ...settings,
                  profile: { ...settings.profile, name: e.target.value }
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={settings.profile.email}
                onChange={(e) => setSettings({
                  ...settings,
                  profile: { ...settings.profile, email: e.target.value }
                })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="h-5 w-5" />
              <span>Preferences</span>
            </CardTitle>
            <CardDescription>
              Customize your experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select 
                value={settings.preferences.currency} 
                onValueChange={(value) => setSettings({
                  ...settings,
                  preferences: { ...settings.preferences, currency: value }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                  <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                  <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateFormat">Date Format</Label>
              <Select 
                value={settings.preferences.dateFormat} 
                onValueChange={(value) => setSettings({
                  ...settings,
                  preferences: { ...settings.preferences, dateFormat: value }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select 
                value={settings.preferences.theme} 
                onValueChange={(value) => setSettings({
                  ...settings,
                  preferences: { ...settings.preferences, theme: value }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select 
                value={settings.preferences.language} 
                onValueChange={(value) => setSettings({
                  ...settings,
                  preferences: { ...settings.preferences, language: value }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Notifications</span>
            </CardTitle>
            <CardDescription>
              Manage your notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email">Email Notifications</Label>
                <p className="text-sm text-gray-500">Receive notifications via email</p>
              </div>
              <Switch
                id="email"
                checked={settings.notifications.email}
                onCheckedChange={(checked) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, email: checked }
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="push">Push Notifications</Label>
                <p className="text-sm text-gray-500">Receive push notifications</p>
              </div>
              <Switch
                id="push"
                checked={settings.notifications.push}
                onCheckedChange={(checked) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, push: checked }
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="budgetAlerts">Budget Alerts</Label>
                <p className="text-sm text-gray-500">Get notified when approaching budget limits</p>
              </div>
              <Switch
                id="budgetAlerts"
                checked={settings.notifications.budgetAlerts}
                onCheckedChange={(checked) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, budgetAlerts: checked }
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="goalReminders">Goal Reminders</Label>
                <p className="text-sm text-gray-500">Reminders for your financial goals</p>
              </div>
              <Switch
                id="goalReminders"
                checked={settings.notifications.goalReminders}
                onCheckedChange={(checked) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, goalReminders: checked }
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="weeklyReports">Weekly Reports</Label>
                <p className="text-sm text-gray-500">Receive weekly financial summaries</p>
              </div>
              <Switch
                id="weeklyReports"
                checked={settings.notifications.weeklyReports}
                onCheckedChange={(checked) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, weeklyReports: checked }
                })}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Privacy & Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Privacy & Security</span>
          </CardTitle>
          <CardDescription>
            Control your data and privacy settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="dataSharing">Data Sharing</Label>
              <p className="text-sm text-gray-500">Allow sharing of anonymized data for product improvement</p>
            </div>
            <Switch
              id="dataSharing"
              checked={settings.privacy.dataSharing}
              onCheckedChange={(checked) => setSettings({
                ...settings,
                privacy: { ...settings.privacy, dataSharing: checked }
              })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="analytics">Analytics</Label>
              <p className="text-sm text-gray-500">Help us improve by sharing usage analytics</p>
            </div>
            <Switch
              id="analytics"
              checked={settings.privacy.analytics}
              onCheckedChange={(checked) => setSettings({
                ...settings,
                privacy: { ...settings.privacy, analytics: checked }
              })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="marketing">Marketing Communications</Label>
              <p className="text-sm text-gray-500">Receive marketing emails and updates</p>
            </div>
            <Switch
              id="marketing"
              checked={settings.privacy.marketing}
              onCheckedChange={(checked) => setSettings({
                ...settings,
                privacy: { ...settings.privacy, marketing: checked }
              })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            <span>Danger Zone</span>
          </CardTitle>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Delete Account</h4>
              <p className="text-sm text-gray-500">
                Permanently delete your account and all associated data
              </p>
            </div>
            <Button variant="destructive" onClick={handleDeleteAccount}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
