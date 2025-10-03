import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, Plus, Bell } from 'lucide-react';

function Header({ user, onMenuClick, onCreateWorkOrder }) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left side - Mobile menu button and title */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden h-8 w-8 p-0"
            data-testid="mobile-menu-btn"
          >
            <Menu className="h-4 w-4" />
          </Button>
          
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Maintenance Dashboard
            </h1>
            <p className="text-sm text-gray-500">
              Manage work orders and preventive maintenance
            </p>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="h-10 w-10 p-0 relative"
            data-testid="notifications-btn"
          >
            <Bell className="h-5 w-5 text-gray-600" />
            {/* Notification badge */}
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></div>
          </Button>

          {/* Create Work Order button */}
          <Button
            onClick={onCreateWorkOrder}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium px-4 py-2 shadow-lg btn-animation"
            data-testid="create-work-order-btn"
          >
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">New Work Order</span>
            <span className="sm:hidden">New WO</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

export default Header;
