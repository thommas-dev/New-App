import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import TrialStatus from './TrialStatus';
import KanbanBoard from './KanbanBoard';
import DepartmentManagement from './DepartmentManagement';
import MachineManagement from './MachineManagement';
import MaintenanceWorkOrders from './MaintenanceWorkOrders';
import CalendarView from './CalendarView';
import DailyTasks from './DailyTasks';
import Support from './Support';
import WorkOrderForm from './WorkOrderForm';
import { Button } from '@/components/ui/button';
import { Plus, Menu, X } from 'lucide-react';

function Dashboard({ user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showWorkOrderForm, setShowWorkOrderForm] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50" data-testid="dashboard">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 
        transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 transition-transform duration-300 ease-in-out
      `}>
        <Sidebar 
          user={user} 
          onLogout={onLogout} 
          onCloseSidebar={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header 
          user={user}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          onCreateWorkOrder={() => setShowWorkOrderForm(true)}
        />

        {/* Content area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <TrialStatus />
          <Routes>
            <Route path="/" element={<KanbanBoard user={user} />} />
            <Route path="/maintenance" element={<MaintenanceWorkOrders user={user} />} />
            <Route path="/calendar" element={<CalendarView user={user} />} />
            <Route path="/daily-tasks" element={<DailyTasks user={user} />} />
            <Route path="/departments" element={<DepartmentManagement user={user} />} />
            <Route path="/machines" element={<MachineManagement user={user} />} />
            <Route path="/support" element={<Support user={user} />} />
          </Routes>
        </main>
      </div>

      {/* Work Order Form Modal */}
      {showWorkOrderForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Create Work Order</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowWorkOrderForm(false)}
                className="h-8 w-8 p-0"
                data-testid="close-work-order-form"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              <WorkOrderForm 
                user={user}
                onClose={() => setShowWorkOrderForm(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
