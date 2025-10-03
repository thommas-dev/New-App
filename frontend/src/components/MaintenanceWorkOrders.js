import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar,
  Clock,
  Repeat,
  Plus,
  Settings,
  Building2,
  FileText
} from 'lucide-react';

function MaintenanceWorkOrders({ user }) {
  const [activeView, setActiveView] = useState('daily');

  const maintenanceTypes = [
    {
      id: 'daily',
      title: 'Daily Maintenance',
      icon: Clock,
      color: 'bg-blue-500',
      description: 'Daily inspection and maintenance tasks',
      count: 5,
      bgColor: 'from-blue-50 to-indigo-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 'weekly',
      title: 'Weekly Maintenance',
      icon: Calendar,
      color: 'bg-green-500',
      description: 'Weekly preventive maintenance schedules',
      count: 12,
      bgColor: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-200'
    },
    {
      id: 'monthly',
      title: 'Monthly Maintenance',
      icon: Repeat,
      color: 'bg-purple-500',
      description: 'Monthly comprehensive maintenance',
      count: 8,
      bgColor: 'from-purple-50 to-indigo-50',
      borderColor: 'border-purple-200'
    }
  ];

  const sampleMaintenanceTasks = {
    daily: [
      {
        id: 1,
        title: 'Oil Level Check - CNC Machine 01',
        department: 'Production',
        machine: 'CNC Machine 01',
        time: '08:00',
        status: 'pending',
        checklist: ['Check oil level', 'Record readings', 'Top up if needed']
      },
      {
        id: 2,
        title: 'Conveyor Belt Inspection',
        department: 'Production',
        machine: 'Conveyor Belt A',
        time: '14:00',
        status: 'completed',
        checklist: ['Visual inspection', 'Check tension', 'Clean belt surface']
      }
    ],
    weekly: [
      {
        id: 3,
        title: 'Filter Replacement - Air Compressor',
        department: 'Utilities',
        machine: 'Air Compressor Unit 1',
        frequency: 'Every Monday',
        status: 'scheduled',
        checklist: ['Turn off compressor', 'Replace air filter', 'Check pressure settings']
      }
    ],
    monthly: [
      {
        id: 4,
        title: 'Comprehensive HVAC Inspection',
        department: 'Facilities',
        machine: 'HVAC System',
        frequency: 'First Monday of month',
        status: 'pending',
        checklist: ['Check all filters', 'Inspect ductwork', 'Test thermostats', 'Clean coils']
      }
    ]
  };

  const handleCreateMaintenance = (type) => {
    // This would open a modal to create new maintenance tasks
    console.log(`Creating ${type} maintenance task`);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      scheduled: { color: 'bg-blue-100 text-blue-800', text: 'Scheduled' },
      completed: { color: 'bg-green-100 text-green-800', text: 'Completed' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge className={`${config.color} text-xs`}>
        {config.text}
      </Badge>
    );
  };

  return (
    <div className="space-y-6" data-testid="maintenance-work-orders">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
              <Settings className="w-6 h-6 mr-2 text-green-600" />
              Maintenance Work Orders
            </h2>
            <p className="text-gray-600 mt-1">
              Schedule and manage preventive maintenance tasks by frequency
            </p>
          </div>
        </div>
      </div>

      {/* Maintenance Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {maintenanceTypes.map((type) => {
          const Icon = type.icon;
          const isActive = activeView === type.id;
          
          return (
            <Card 
              key={type.id} 
              className={`
                cursor-pointer transition-all duration-200 card-animation border-0 shadow-sm
                ${isActive ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-lg'}
                bg-gradient-to-br ${type.bgColor}
              `}
              onClick={() => setActiveView(type.id)}
              data-testid={`maintenance-type-${type.id}`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 ${type.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-medium text-gray-900">
                        {type.title}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {type.description}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-white border border-gray-200 text-gray-700">
                    {type.count} tasks
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCreateMaintenance(type.id);
                  }}
                  className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-200"
                  size="sm"
                  data-testid={`create-${type.id}-maintenance`}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add {type.title.split(' ')[0]} Task
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Active View Content */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">
              {maintenanceTypes.find(t => t.id === activeView)?.title} Tasks
            </CardTitle>
            <Button
              onClick={() => handleCreateMaintenance(activeView)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              data-testid={`add-${activeView}-task-btn`}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {sampleMaintenanceTasks[activeView]?.map((task) => (
              <Card key={task.id} className="border border-gray-200 hover:shadow-md transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-2">{task.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Building2 className="w-4 h-4 mr-1" />
                          {task.department}
                        </span>
                        <span className="flex items-center">
                          <Settings className="w-4 h-4 mr-1" />
                          {task.machine}
                        </span>
                        {task.time && (
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {task.time}
                          </span>
                        )}
                        {task.frequency && (
                          <span className="flex items-center">
                            <Repeat className="w-4 h-4 mr-1" />
                            {task.frequency}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(task.status)}
                    </div>
                  </div>
                  
                  {task.checklist && task.checklist.length > 0 && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <FileText className="w-4 h-4 mr-1" />
                        Checklist ({task.checklist.length} items)
                      </p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {task.checklist.map((item, index) => (
                          <li key={index} className="flex items-center">
                            <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            
            {sampleMaintenanceTasks[activeView]?.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Settings className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">No {activeView} maintenance tasks yet</p>
                <p>Start by creating your first {activeView} maintenance schedule.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default MaintenanceWorkOrders;