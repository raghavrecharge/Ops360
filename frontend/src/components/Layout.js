import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Briefcase, Megaphone, Building2,
  Truck, UserCircle, UserPlus, ClipboardList, Receipt,
  FileText, DollarSign, BarChart3, Settings, Menu, X, LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const sidebarItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/clients', icon: Users, label: 'Clients' },
  { path: '/projects', icon: Briefcase, label: 'Projects' },
  { path: '/campaigns', icon: Megaphone, label: 'Campaigns' },
  { path: '/vendors', icon: Building2, label: 'Vendors' },
  { path: '/vehicles', icon: Truck, label: 'Vehicles' },
  { path: '/drivers', icon: UserCircle, label: 'Drivers' },
  { path: '/promoters', icon: UserPlus, label: 'Promoters / Anchors' },
  { path: '/operations', icon: ClipboardList, label: 'Operations' },
  { path: '/expenses', icon: Receipt, label: 'Expenses' },
  { path: '/reports', icon: FileText, label: 'Reports' },
  { path: '/accounts', icon: DollarSign, label: 'Accounts & Payments' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside
        data-testid="sidebar"
        className={`fixed left-0 top-0 h-full bg-white border-r border-slate-200 transition-all duration-300 z-50 ${
          sidebarOpen ? 'w-64' : 'w-16'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          {sidebarOpen && (
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              FleetOps
            </h1>
          )}
          <button
            data-testid="toggle-sidebar-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-140px)]">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              data-testid={`nav-${item.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-lg transition-all group ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 font-medium'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon size={20} className={isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'} />
                  {sidebarOpen && <span>{item.label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full border-t border-slate-200 p-3">
          <button
            data-testid="logout-btn"
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-3 w-full rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-16'
        }`}
      >
        <header className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-800">Welcome back, {user.name}</h2>
              <p className="text-sm text-slate-500 mt-0.5">{user.role}</p>
            </div>
          </div>
        </header>

        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
