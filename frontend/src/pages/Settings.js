import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings as SettingsIcon, Users, Database, Bell } from 'lucide-react';

const Settings = () => {
  return (
    <div data-testid="settings-page">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Settings</h1>
        <p className="text-slate-600">System configuration and preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Users className="h-5 w-5 text-indigo-600" />
              </div>
              Roles & Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">Manage user roles and access control</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Database className="h-5 w-5 text-purple-600" />
              </div>
              Master Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">Configure categories, types, and master lists</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Bell className="h-5 w-5 text-green-600" />
              </div>
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">Configure alerts and notification preferences</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <SettingsIcon className="h-5 w-5 text-orange-600" />
              </div>
              System Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">General system settings and preferences</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
