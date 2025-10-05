import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MaintenanceTaskDetail from './MaintenanceTaskDetail';
import MaintenanceTaskForm from './MaintenanceTaskForm';
import { 
  Calendar,
  Clock,
  Repeat,
  Plus,
  Settings,
  Building2,
  FileText,
  Printer
} from 'lucide-react';

function MaintenanceWorkOrders({ user }) {
  const [activeView, setActiveView] = useState('daily');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [maintenanceTasks, setMaintenanceTasks] = useState(null);
  const [workOrders, setWorkOrders] = useState([]);
  // Initialize maintenance tasks from localStorage or empty arrays
  const [sampleMaintenanceTasks, setSampleMaintenanceTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('equiptrack:maintenanceTasks');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          daily: parsed.daily || [],
          weekly: parsed.weekly || [],
          monthly: parsed.monthly || []
        };
      }
    } catch (error) {
      console.error('Failed to load maintenance tasks from localStorage:', error);
    }
    return {
      daily: [],
      weekly: [],
      monthly: []
    };
  });

  const API = process.env.REACT_APP_BACKEND_URL;

  // Save maintenance tasks to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('equiptrack:maintenanceTasks', JSON.stringify(sampleMaintenanceTasks));
    } catch (error) {
      console.error('Failed to save maintenance tasks to localStorage:', error);
    }
  }, [sampleMaintenanceTasks]);

  const maintenanceTypes = [
    {
      id: 'daily',
      title: 'Daily Maintenance',
      icon: Clock,
      color: 'bg-blue-500',
      description: 'Daily inspection and maintenance tasks',
      count: sampleMaintenanceTasks.daily?.length || 0,
      bgColor: 'from-blue-50 to-indigo-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 'weekly',
      title: 'Weekly Maintenance',
      icon: Calendar,
      color: 'bg-green-500',
      description: 'Weekly preventive maintenance schedules',
      count: sampleMaintenanceTasks.weekly?.length || 0,
      bgColor: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-200'
    },
    {
      id: 'monthly',
      title: 'Monthly Maintenance',
      icon: Repeat,
      color: 'bg-purple-500',
      description: 'Monthly comprehensive maintenance',
      count: sampleMaintenanceTasks.monthly?.length || 0,
      bgColor: 'from-purple-50 to-indigo-50',
      borderColor: 'border-purple-200'
    }
  ];

  const handleCreateMaintenance = (type) => {
    setMaintenanceTasks({ type, frequency: type.charAt(0).toUpperCase() + type.slice(1) });
    setShowTaskForm(true);
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  const handleTaskUpdate = (updatedTask) => {
    setSampleMaintenanceTasks(prev => ({
      ...prev,
      [activeView]: prev[activeView].map(task =>
        task.id === updatedTask.id ? updatedTask : task
      )
    }));
    // Don't close modal after save - let user close manually with X button
    // setSelectedTask(null);
  };

  const handleTaskCreate = (newTask) => {
    const taskWithId = {
      ...newTask,
      id: Date.now(),
      status: 'pending'
    };
    
    setSampleMaintenanceTasks(prev => ({
      ...prev,
      [maintenanceTasks.type]: [...(prev[maintenanceTasks.type] || []), taskWithId]
    }));
    
    setShowTaskForm(false);
    setMaintenanceTasks(null);
  };

  // Fetch real work orders and setup cross-page synchronization
  React.useEffect(() => {
    const fetchWorkOrders = async () => {
      try {
        const response = await fetch(`${API}/work-orders`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setWorkOrders(data);
        }
      } catch (error) {
        console.error('Error fetching work orders:', error);
      }
    };

    fetchWorkOrders();

    // Listen for work order updates from other pages
    const handleWorkOrderUpdate = (event) => {
      const { workOrderId, checklist } = event.detail;
      setWorkOrders(prevOrders =>
        prevOrders.map(wo =>
          wo.id === workOrderId
            ? { ...wo, checklist: checklist }
            : wo
        )
      );
    };

    window.addEventListener('workOrderUpdated', handleWorkOrderUpdate);
    
    // Cleanup listener
    return () => {
      window.removeEventListener('workOrderUpdated', handleWorkOrderUpdate);
    };
  }, [API]);

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
              <Card 
                key={task.id} 
                className="border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => handleTaskClick(task)}
              >
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle print individual task
                        }}
                        className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600"
                      >
                        <Printer className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {task.checklist && task.checklist.length > 0 && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 flex items-center mb-3">
                        <FileText className="w-4 h-4 mr-1" />
                        Checklist Items:
                      </p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {task.checklist.slice(0, 2).map((item, index) => (
                          <li key={index} className="flex items-center">
                            <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                            {typeof item === 'string' ? item : (item?.text || item)}
                          </li>
                        ))}
                        {task.checklist.length > 2 && (
                          <li className="text-xs text-gray-500 ml-4">+{task.checklist.length - 2} more items</li>
                        )}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            
            {(!sampleMaintenanceTasks[activeView] || sampleMaintenanceTasks[activeView].length === 0) && (
              <div className="text-center py-12 text-gray-500">
                <Settings className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">No {activeView} maintenance tasks yet</p>
                <p className="mb-4">Start by creating your first {activeView} maintenance schedule.</p>
                <Button
                  onClick={() => handleCreateMaintenance(activeView)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First {activeView.charAt(0).toUpperCase() + activeView.slice(1)} Task
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Task Detail Modal */}
      {selectedTask && (
        <MaintenanceTaskDetail
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleTaskUpdate}
          user={user}
        />
      )}

      {/* Maintenance Task Form Modal */}
      {showTaskForm && (
        <MaintenanceTaskForm
          type={maintenanceTasks?.type}
          frequency={maintenanceTasks?.frequency}
          onClose={() => {
            setShowTaskForm(false);
            setMaintenanceTasks(null);
          }}
          onCreate={handleTaskCreate}
          user={user}
        />
      )}
    </div>
  );
}

export default MaintenanceWorkOrders;