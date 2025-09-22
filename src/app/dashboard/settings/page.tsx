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
  Save
} from 'lucide-react';
import { useTheme } from 'next-themes';

export default function SettingsPage() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [settings, setSettings] = useState({
    profile: {
      name: session?.user?.name || '',
      email: session?.user?.email || '',
      avatar: (session?.user as any)?.avatar || '',
    },
    preferences: {
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY',
      theme: (theme as 'light' | 'dark' | 'system') || 'system',
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

  useEffect(() => {
    try {
      const currency = JSON.parse(localStorage.getItem('sft:currency') || '"USD"');
      const dateFormat = JSON.parse(localStorage.getItem('sft:dateFormat') || '"MM/DD/YYYY"');
      setSettings((prev) => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          currency,
          dateFormat,
          theme: (theme as any) || 'system',
        }
      }));
    } catch {}
  }, []);

  useEffect(() => {
    setSettings((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        name: session?.user?.name || '',
        email: session?.user?.email || '',
        avatar: (session?.user as any)?.avatar || '',
      },
      preferences: {
        ...prev.preferences,
        theme: (theme as any) || 'system',
      }
    }));
  }, [session, theme]);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Persist preferences locally
      localStorage.setItem('sft:currency', JSON.stringify(settings.preferences.currency));
      localStorage.setItem('sft:dateFormat', JSON.stringify(settings.preferences.dateFormat));
      setTheme(settings.preferences.theme);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendTestEmail = async () => {
    try {
      setEmailSending(true);
      const res = await fetch('/api/settings/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
    } finally {
      setEmailSending(false);
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
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={settings.profile.avatar} />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{settings.profile.name || 'Unnamed User'}</p>
                <p className="text-sm text-muted-foreground">{settings.profile.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span>Preferences</span>
            </CardTitle>
            <CardDescription>Localization and appearance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select value={settings.preferences.currency} onValueChange={(v) => setSettings(s => ({...s, preferences: { ...s.preferences, currency: v as any }}))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="INR">INR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date Format</Label>
                <Select value={settings.preferences.dateFormat} onValueChange={(v) => setSettings(s => ({...s, preferences: { ...s.preferences, dateFormat: v as any }}))}>
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
                <Label className="flex items-center space-x-2"><Palette className="h-4 w-4 mr-2" /> Theme</Label>
                <Select value={settings.preferences.theme} onValueChange={(v: 'light' | 'dark' | 'system') => setSettings(s => ({...s, preferences: { ...s.preferences, theme: v }}))}>
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
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Notifications</span>
            </CardTitle>
            <CardDescription>Manage your notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label>Email Notifications</Label>
              <Switch checked={settings.notifications.email} onCheckedChange={(v) => setSettings(s => ({...s, notifications: { ...s.notifications, email: v }}))} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Weekly Reports</Label>
              <Switch checked={settings.notifications.weeklyReports} onCheckedChange={(v) => setSettings(s => ({...s, notifications: { ...s.notifications, weeklyReports: v }}))} />
            </div>
            <div>
              <Button onClick={sendTestEmail} disabled={emailSending}>
                {emailSending ? 'Sending…' : 'Send Test Email'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Privacy</span>
            </CardTitle>
            <CardDescription>Control your data preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label>Share anonymized data</Label>
              <Switch checked={settings.privacy.dataSharing} onCheckedChange={(v) => setSettings(s => ({...s, privacy: { ...s.privacy, dataSharing: v }}))} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Allow analytics</Label>
              <Switch checked={settings.privacy.analytics} onCheckedChange={(v) => setSettings(s => ({...s, privacy: { ...s.privacy, analytics: v }}))} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}





