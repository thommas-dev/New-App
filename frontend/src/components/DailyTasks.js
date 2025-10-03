import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import WorkOrderDetail from './WorkOrderDetail';
import MaintenanceTaskDetail from './MaintenanceTaskDetail';
import { 
  Clock,
  Bell,
  Settings,
  Wrench,
  CheckSquare,
  AlertTriangle,
  User,
  Building2,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';

function DailyTasks({ user }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState(null);
  const [todaysTasks, setTodaysTasks] = useState([
    {
      id: 1,
      title: 'Oil Level Check - CNC Machine 01',
      type: 'maintenance',
      scheduledTime: '08:00',
      department: 'Production',
      machine: 'CNC Machine 01',
      assignee: 'John Smith',
      priority: 'High',
      status: 'pending',
      overdue: false,
      frequency: 'Daily',
      notes: 'Check hydraulic oil levels and record readings. Top up if below minimum line.',
      safety_notes: 'Ensure machine is powered off before checking oil levels.',
      checklist: [
        { id: '1-1', text: 'Check oil level', completed: false, created_by: 'System', created_at: new Date().toISOString() },
        { id: '1-2', text: 'Record readings', completed: false, created_by: 'System', created_at: new Date().toISOString() },
        { id: '1-3', text: 'Top up if needed', completed: false, created_by: 'System', created_at: new Date().toISOString() }
      ]
    },
    {
      id: 2,
      wo_id: 'WO-2025-0003',
      title: 'Replace conveyor belt',
      type: 'repair',
      scheduledTime: '14:00',
      department: 'Production',
      department_name: 'Production',
      machine: 'Conveyor Belt A',
      machine_name: 'Conveyor Belt A',
      assignee: 'Mike Johnson',
      assignee_name: 'Mike Johnson',
      requested_by_name: 'admin2',
      priority: 'Critical',
      status: 'in-progress',
      overdue: true,
      description: 'Emergency conveyor belt replacement due to mechanical failure.',
      created_at: new Date().toISOString(),
      checklist: [
        { id: '2-1', text: 'Shut down production line', completed: true },
        { id: '2-2', text: 'Remove old belt', completed: false },
        { id: '2-3', text: 'Install new belt', completed: false },
        { id: '2-4', text: 'Test operation', completed: false }
      ],
      tags: ['urgent', 'production']
    },
    {
      id: 3,
      title: 'Conveyor Belt Inspection',
      type: 'maintenance',
      scheduledTime: '10:30',
      department: 'Production',
      machine: 'Conveyor Belt B',
      assignee: 'Sarah Davis',
      priority: 'Medium',
      status: 'completed',
      overdue: false,
      frequency: 'Daily',
      notes: 'Daily visual inspection of conveyor belt system for wear and proper operation.',
      safety_notes: 'Use lockout/tagout procedures before inspection.',
      checklist: [
        { id: '3-1', text: 'Visual inspection', completed: true, created_by: 'System', created_at: new Date().toISOString() },
        { id: '3-2', text: 'Check tension', completed: true, created_by: 'System', created_at: new Date().toISOString() },
        { id: '3-3', text: 'Clean belt surface', completed: true, created_by: 'System', created_at: new Date().toISOString() }
      ]
    },
    {
      id: 4,
      title: 'Safety System Check',
      type: 'maintenance',
      scheduledTime: '16:00',
      department: 'Safety',
      machine: 'Emergency Stops',
      assignee: 'Tom Wilson',
      priority: 'High',
      status: 'pending',
      overdue: false,
      frequency: 'Daily',
      notes: 'Daily safety system verification and testing.',
      safety_notes: 'Follow safety protocols when testing emergency systems.',
      checklist: [
        { id: '4-1', text: 'Test all emergency stops', completed: false, created_by: 'System', created_at: new Date().toISOString() },
        { id: '4-2', text: 'Check alarm systems', completed: false, created_by: 'System', created_at: new Date().toISOString() },
        { id: '4-3', text: 'Verify safety protocols', completed: false, created_by: 'System', created_at: new Date().toISOString() }
      ]
    }
  ]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getTasksByStatus = () => {
    const pending = todaysTasks.filter(task => task.status === 'pending');
    const inProgress = todaysTasks.filter(task => task.status === 'in-progress');
    const completed = todaysTasks.filter(task => task.status === 'completed');
    const overdue = todaysTasks.filter(task => task.overdue);
    
    return { pending, inProgress, completed, overdue };
  };

  const { pending, inProgress, completed, overdue } = getTasksByStatus();

  const getTypeIcon = (type) => {
    return type === 'maintenance' ? Settings : Wrench;
  };

  const getTypeColor = (type) => {
    return type === 'maintenance' 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'Critical': 'bg-red-500 text-white',
      'High': 'bg-orange-500 text-white',
      'Medium': 'bg-yellow-500 text-white',
      'Low': 'bg-green-500 text-white'
    };
    return colors[priority] || 'bg-gray-500 text-white';
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-gray-100 text-gray-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatTime = (timeString) => {
    const [hour, minute] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hour), parseInt(minute));
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const isTaskUpcoming = (timeString) => {
    const [hour, minute] = timeString.split(':');
    const taskTime = new Date();
    taskTime.setHours(parseInt(hour), parseInt(minute), 0, 0);
    
    const now = new Date();
    const timeDiff = taskTime.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    return hoursDiff > 0 && hoursDiff <= 2; // Upcoming in next 2 hours
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  const handleTaskUpdate = (updatedTask) => {
    // In a full implementation, you'd update the task in the state
    setSelectedTask(null);
  };

  const TaskCard = ({ task, showNotification = false }) => {
    const Icon = getTypeIcon(task.type);
    const upcomingTask = isTaskUpcoming(task.scheduledTime);
    
    return (
      <Card 
        className={`
          border transition-all duration-200 hover:shadow-md cursor-pointer
          ${task.overdue ? 'border-red-200 bg-red-50' : 'border-gray-200'}
          ${upcomingTask ? 'ring-2 ring-blue-200 bg-blue-50' : ''}
        `}
        onClick={() => handleTaskClick(task)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Icon className={`w-4 h-4 ${task.type === 'maintenance' ? 'text-green-600' : 'text-blue-600'}`} />
                <h3 className="font-medium text-gray-900">{task.title}</h3>
                {task.overdue && <AlertTriangle className="w-4 h-4 text-red-500" />}
                {upcomingTask && <Bell className="w-4 h-4 text-blue-500" />}
              </div>
              
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatTime(task.scheduledTime)}
                  </span>
                  <span className="flex items-center">
                    <User className="w-3 h-3 mr-1" />
                    {task.assignee}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="flex items-center">
                    <Building2 className="w-3 h-3 mr-1" />
                    {task.department}
                  </span>
                  <span className="flex items-center">
                    <Settings className="w-3 h-3 mr-1" />
                    {task.machine}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end space-y-2">
              <Badge className={getPriorityColor(task.priority)}>
                {task.priority}
              </Badge>
              <Badge className={getStatusColor(task.status)}>
                {task.status.replace('-', ' ')}
              </Badge>
            </div>
          </div>
          
          {task.checklist && task.checklist.length > 0 && (
            <div className="mt-3 p-3 bg-white rounded border">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-gray-600 flex items-center">
                  <CheckSquare className="w-3 h-3 mr-1" />
                  Checklist ({task.checklist.filter(item => task.status === 'completed' || (typeof item === 'object' && item.completed)).length}/{task.checklist.length})
                </p>
                <span className="text-xs font-medium text-blue-600">
                  {Math.round((task.checklist.filter(item => task.status === 'completed' || (typeof item === 'object' && item.completed)).length / task.checklist.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1 mb-2">
                <div 
                  className="bg-green-500 h-1 rounded-full transition-all duration-300"
                  style={{ width: `${(task.checklist.filter(item => task.status === 'completed' || (typeof item === 'object' && item.completed)).length / task.checklist.length) * 100}%` }}
                ></div>
              </div>
              <div className="space-y-1">
                {task.checklist.slice(0, 2).map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Checkbox 
                      size="sm" 
                      checked={task.status === 'completed' || (typeof item === 'object' && item.completed)}
                      disabled={task.status === 'completed'}
                    />
                    <span className={`text-xs ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                      {typeof item === 'string' ? item : (item?.text || item)}
                    </span>
                  </div>
                ))}
                {task.checklist.length > 2 && (
                  <p className="text-xs text-gray-500 ml-6">+{task.checklist.length - 2} more items</p>
                )}
              </div>
            </div>
          )}
          
          {showNotification && upcomingTask && (
            <div className="mt-3 p-2 bg-blue-100 border border-blue-200 rounded flex items-center space-x-2">
              <Bell className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-700 font-medium">Starts in less than 2 hours</span>
            </div>
          )}
          
          {task.overdue && (
            <div className="mt-3 p-2 bg-red-100 border border-red-200 rounded flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-700 font-medium">Overdue</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6" data-testid="daily-tasks">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
              <Clock className="w-6 h-6 mr-2 text-blue-600" />
              Daily Tasks
            </h2>
            <p className="text-gray-600 mt-1">
              Today's maintenance and repair notifications • {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {currentTime.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
              })}
            </Badge>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-r from-red-50 to-pink-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{overdue.length}</p>
                <p className="text-sm text-gray-600">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{pending.length}</p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{inProgress.length}</p>
                <p className="text-sm text-gray-600">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-r from-green-50 to-emerald-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckSquare className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{completed.length}</p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent & Upcoming */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Bell className="w-5 h-5 mr-2 text-red-500" />
            Urgent & Upcoming
          </h3>
          <div className="space-y-3">
            {todaysTasks
              .filter(task => task.overdue || isTaskUpcoming(task.scheduledTime))
              .map(task => (
                <TaskCard key={task.id} task={task} showNotification />
              ))}
            {todaysTasks.filter(task => task.overdue || isTaskUpcoming(task.scheduledTime)).length === 0 && (
              <Card className="border-2 border-dashed border-gray-300">
                <CardContent className="p-6 text-center">
                  <CheckSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-600">All tasks are on schedule</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* All Today's Tasks */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-500" />
            All Today's Tasks
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {todaysTasks
              .sort((a, b) => {
                // Sort by time
                const timeA = parseInt(a.scheduledTime.replace(':', ''));
                const timeB = parseInt(b.scheduledTime.replace(':', ''));
                return timeA - timeB;
              })
              .map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
          </div>
        </div>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <>
          {selectedTask.type === 'maintenance' ? (
            <MaintenanceTaskDetail
              task={selectedTask}
              onClose={() => setSelectedTask(null)}
              onUpdate={handleTaskUpdate}
              user={user}
            />
          ) : (
            <WorkOrderDetail
              workOrder={selectedTask}
              onClose={() => setSelectedTask(null)}
              onUpdate={handleTaskUpdate}
              user={user}
            />
          )}
        </>
      )}
    </div>
  );
}

export default DailyTasks;