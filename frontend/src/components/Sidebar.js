import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Building2, 
  Settings, 
  LogOut, 
  Clock, 
  Calendar,
  HelpCircle,
  Settings as SettingsIcon,
  Users
} from 'lucide-react';

function Sidebar({ user, onLogout, onCloseSidebar }) {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const menuItems = [
    {
      path: '/',
      label: 'Repair Work Orders',
      icon: LayoutDashboard,
      description: 'Repair work orders board'
    },
    {
      path: '/maintenance',
      label: 'Maintenance Work Orders',
      icon: Settings,
      description: 'Scheduled maintenance'
    },
    {
      path: '/calendar',
      label: 'Calendar',
      icon: Calendar,
      description: 'View scheduled tasks'
    },
    {
      path: '/daily-tasks',
      label: 'Daily Tasks',
      icon: Clock,
      description: 'Today\'s notifications'
    },
    {
      path: '/departments',
      label: 'Departments',
      icon: Building2,
      description: 'Manage departments',
      adminOnly: true
    },
    {
      path: '/machines',
      label: 'Machines',
      icon: Settings,
      description: 'Manage machines',
      adminOnly: true
    },
    {
      path: '/support',
      label: 'Support',
      icon: HelpCircle,
      description: 'Help & user manual'
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    !item.adminOnly || user.role === 'Admin'
  );

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 shadow-sm">
      {/* Logo and app name */}
      <div className="flex items-center px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <SettingsIcon className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">EquipTrack</h1>
            <p className="text-xs text-gray-500">Pro</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center">
            {user.role === 'Admin' ? (
              <SettingsIcon className="w-5 h-5 text-white" />
            ) : (
              <Users className="w-5 h-5 text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.username}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user.role}
            </p>
          </div>
        </div>
        
        {/* Trial status */}
        {user.is_trial_active && (
          <div className="mt-3 p-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-blue-700 font-medium">Free Trial Active</span>
            </div>
            <p className="text-xs text-blue-600 mt-1">
              Enjoy full access for 14 days
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onCloseSidebar}
              className={`
                flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${active 
                  ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
              data-testid={`nav-${item.path === '/' ? 'kanban' : item.path.slice(1)}`}
            >
              <Icon className={`w-5 h-5 mr-3 ${active ? 'text-blue-600' : 'text-gray-500'}`} />
              <div>
                <div>{item.label}</div>
                <div className="text-xs text-gray-500">{item.description}</div>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Logout button */}
      <div className="p-4 border-t border-gray-200">
        <Button
          onClick={onLogout}
          variant="ghost"
          className="w-full justify-start text-gray-700 hover:text-red-600 hover:bg-red-50"
          data-testid="logout-btn"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}

export default Sidebar;
