import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import WorkOrderDetail from './WorkOrderDetail';
import MaintenanceTaskDetail from './MaintenanceTaskDetail';
import { 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Settings,
  Wrench,
  Filter
} from 'lucide-react';

function CalendarView({ user }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState('month');
  const [selectedTask, setSelectedTask] = useState(null);

  // Sample data - in real app, this would come from API
  const sampleEvents = [
    {
      id: 1,
      title: 'Oil Level Check - CNC Machine 01',
      type: 'maintenance',
      date: '2025-10-03',
      time: '08:00',
      department: 'Production',
      machine: 'CNC Machine 01',
      status: 'scheduled'
    },
    {
      id: 2,
      title: 'Replace conveyor belt',
      type: 'repair',
      date: '2025-10-03',
      time: '14:00',
      department: 'Production',
      machine: 'Conveyor Belt A',
      status: 'in-progress'
    },
    {
      id: 3,
      title: 'Filter Replacement - Air Compressor',
      type: 'maintenance',
      date: '2025-10-07',
      time: '10:00',
      department: 'Utilities',
      machine: 'Air Compressor Unit 1',
      status: 'scheduled'
    },
    {
      id: 4,
      title: 'HVAC System Inspection',
      type: 'maintenance',
      date: '2025-10-07',
      time: '09:00',
      department: 'Facilities',
      machine: 'HVAC System',
      status: 'scheduled'
    },
    {
      id: 5,
      title: 'Pump Maintenance',
      type: 'maintenance',
      date: '2025-10-10',
      time: '13:00',
      department: 'Utilities',
      machine: 'Water Pump 1',
      status: 'scheduled'
    }
  ];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    const dateString = date.toISOString().split('T')[0];
    return sampleEvents.filter(event => event.date === dateString);
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    if (!date) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const getEventTypeIcon = (type) => {
    return type === 'maintenance' ? Settings : Wrench;
  };

  const getEventTypeColor = (type) => {
    return type === 'maintenance' 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const getStatusColor = (status) => {
    const colors = {
      'scheduled': 'bg-blue-500',
      'in-progress': 'bg-yellow-500',
      'completed': 'bg-green-500',
      'on-hold': 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  const handleTaskUpdate = (updatedTask) => {
    // In a full implementation, you'd update the task in the state
    setSelectedTask(null);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const days = getDaysInMonth(currentDate);
  const selectedDateEvents = getEventsForDate(selectedDate);

  return (
    <div className="space-y-6" data-testid="calendar-view">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
              <Calendar className="w-6 h-6 mr-2 text-blue-600" />
              Calendar
            </h2>
            <p className="text-gray-600 mt-1">
              View scheduled maintenance and repair work orders
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDate(new Date())}
            >
              Today
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth(-1)}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <CardTitle className="text-xl">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth(1)}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                const events = getEventsForDate(day);
                const hasEvents = events.length > 0;
                
                return (
                  <div
                    key={index}
                    className={`
                      min-h-24 p-1 border border-gray-100 cursor-pointer transition-colors
                      ${day ? 'hover:bg-gray-50' : 'bg-gray-25'}
                      ${isToday(day) ? 'bg-blue-50 border-blue-200' : ''}
                      ${isSelected(day) ? 'ring-2 ring-blue-500 bg-blue-25' : ''}
                    `}
                    onClick={() => day && setSelectedDate(day)}
                  >
                    {day && (
                      <>
                        <div className={`
                          text-sm font-medium mb-1
                          ${isToday(day) ? 'text-blue-600' : 'text-gray-900'}
                        `}>
                          {day.getDate()}
                        </div>
                        
                        {hasEvents && (
                          <div className="space-y-1">
                            {events.slice(0, 2).map(event => {
                              const Icon = getEventTypeIcon(event.type);
                              return (
                                <div
                                  key={event.id}
                                  className={`
                                    text-xs p-1 rounded border
                                    ${getEventTypeColor(event.type)}
                                    flex items-center space-x-1
                                  `}
                                >
                                  <div className={`w-2 h-2 rounded-full ${getStatusColor(event.status)}`}></div>
                                  <Icon className="w-3 h-3" />
                                  <span className="truncate flex-1">{event.title}</span>
                                </div>
                              );
                            })}
                            {events.length > 2 && (
                              <div className="text-xs text-gray-500 px-1">
                                +{events.length - 2} more
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Details */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="border-b">
            <CardTitle className="text-lg">
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {selectedDateEvents.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-600">
                    {selectedDateEvents.length} task{selectedDateEvents.length !== 1 ? 's' : ''} scheduled
                  </span>
                </div>
                
                {selectedDateEvents.map(event => {
                  const Icon = getEventTypeIcon(event.type);
                  return (
                    <div 
                      key={event.id} 
                      className="p-3 bg-gray-50 rounded-lg border cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleTaskClick(event)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          event.type === 'maintenance' ? 'bg-green-100' : 'bg-blue-100'
                        }`}>
                          <Icon className={`w-4 h-4 ${
                            event.type === 'maintenance' ? 'text-green-600' : 'text-blue-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm">{event.title}</h4>
                          <div className="text-xs text-gray-600 mt-1 space-y-1">
                            <div className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {event.time}
                            </div>
                            <div>{event.department} • {event.machine}</div>
                          </div>
                          <div className="mt-2">
                            <Badge className={`${getEventTypeColor(event.type)} text-xs`}>
                              {event.type}
                            </Badge>
                            <div className={`inline-block w-2 h-2 rounded-full ml-2 ${getStatusColor(event.status)}`}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No tasks scheduled for this date</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default CalendarView;