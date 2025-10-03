import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import WorkOrderDetail from './WorkOrderDetail';
import { 
  Clock, 
  User, 
  Building2, 
  Settings, 
  AlertTriangle,
  Filter,
  Search,
  Calendar,
  CheckSquare
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const COLUMNS = [
  { id: 'Backlog', title: 'Backlog', color: 'status-backlog' },
  { id: 'Scheduled', title: 'Scheduled', color: 'status-scheduled' },
  { id: 'In Progress', title: 'In Progress', color: 'status-in-progress' },
  { id: 'Completed', title: 'Completed', color: 'status-completed' },
  { id: 'On Hold', title: 'On Hold', color: 'status-on-hold' }
];

function KanbanBoard({ user }) {
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [departments, setDepartments] = useState([]);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);

  const fetchWorkOrders = async () => {
    try {
      const response = await axios.get(`${API}/work-orders`);
      setWorkOrders(response.data);
    } catch (error) {
      console.error('Error fetching work orders:', error);
      toast.error('Failed to load work orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${API}/departments`);
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  useEffect(() => {
    fetchWorkOrders();
    fetchDepartments();
  }, []);

  const handleDragStart = (e, workOrder) => {
    setDraggedItem(workOrder);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    setDragOverColumn(columnId);
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOverColumn(null);
  };

  const handleDrop = async (e, columnId) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (!draggedItem || draggedItem.status === columnId) {
      setDraggedItem(null);
      return;
    }

    try {
      await axios.put(`${API}/work-orders/${draggedItem.id}`, {
        status: columnId
      });

      setWorkOrders(prevOrders =>
        prevOrders.map(wo =>
          wo.id === draggedItem.id ? { ...wo, status: columnId } : wo
        )
      );

      toast.success(`Work order moved to ${columnId}`);
    } catch (error) {
      console.error('Error updating work order status:', error);
      toast.error('Failed to update work order status');
    }

    setDraggedItem(null);
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'Critical': 'priority-critical',
      'High': 'priority-high',
      'Medium': 'priority-medium',
      'Low': 'priority-low'
    };
    return colors[priority] || 'bg-gray-500';
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getCompletedChecklistCount = (checklist) => {
    if (!checklist || checklist.length === 0) return { completed: 0, total: 0 };
    const completed = checklist.filter(item => item.completed).length;
    return { completed, total: checklist.length };
  };

  // Filter work orders
  const filteredWorkOrders = workOrders.filter(wo => {
    const matchesDepartment = !filterDepartment || filterDepartment === 'all' || wo.department_id === filterDepartment;
    const matchesPriority = !filterPriority || filterPriority === 'all' || wo.priority === filterPriority;
    const matchesSearch = !searchTerm || 
      wo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wo.wo_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (wo.description && wo.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesDepartment && matchesPriority && matchesSearch;
  });

  const getWorkOrdersForColumn = (columnId) => {
    return filteredWorkOrders.filter(wo => wo.status === columnId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="kanban-board">
      {/* Header with filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Work Orders Board</h2>
            <p className="text-gray-600 mt-1">
              {filteredWorkOrders.length} work orders • Drag and drop to update status
            </p>
          </div>
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search work orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
                data-testid="search-work-orders"
              />
            </div>
            
            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger className="w-full sm:w-48" data-testid="filter-department">
                <div className="flex items-center">
                  <Filter className="w-4 h-4 mr-2 text-gray-500" />
                  <SelectValue placeholder="All Departments" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-full sm:w-36" data-testid="filter-priority">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {COLUMNS.map(column => {
          const columnWorkOrders = getWorkOrdersForColumn(column.id);
          const isDragOver = dragOverColumn === column.id;
          
          return (
            <div key={column.id} className="flex flex-col">
              {/* Column Header */}
              <div className={`bg-white rounded-t-lg border-t-4 ${column.color} p-4 border-l border-r border-gray-200`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{column.title}</h3>
                  <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                    {columnWorkOrders.length}
                  </Badge>
                </div>
              </div>

              {/* Column Content */}
              <div
                className={`
                  flex-1 bg-gray-50 border-l border-r border-b border-gray-200 rounded-b-lg p-3 min-h-96
                  ${isDragOver ? 'bg-blue-50 border-blue-300 border-2 border-dashed' : ''}
                `}
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.id)}
                data-testid={`kanban-column-${column.id.toLowerCase().replace(' ', '-')}`}
              >
                <div className="space-y-3">
                  {columnWorkOrders.map(workOrder => {
                    const { completed, total } = getCompletedChecklistCount(workOrder.checklist);
                    const overdue = isOverdue(workOrder.due_date);
                    
                    return (
                      <Card
                        key={workOrder.id}
                        className={`
                          cursor-move hover:shadow-lg transition-all duration-200 card-animation
                          ${draggedItem?.id === workOrder.id ? 'opacity-50 rotate-2' : ''}
                          ${overdue ? 'ring-2 ring-red-300' : ''}
                        `}
                        draggable
                        onDragStart={(e) => handleDragStart(e, workOrder)}
                        data-testid={`work-order-card-${workOrder.wo_id}`}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-xs font-medium text-gray-500">
                                  {workOrder.wo_id}
                                </span>
                                <Badge className={`text-xs px-2 py-0.5 ${getPriorityColor(workOrder.priority)}`}>
                                  {workOrder.priority}
                                </Badge>
                                {overdue && (
                                  <Badge className="bg-red-100 text-red-700 text-xs px-2 py-0.5">
                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                    Overdue
                                  </Badge>
                                )}
                              </div>
                              <h4 className="font-medium text-gray-900 text-sm leading-tight">
                                {workOrder.title}
                              </h4>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-2">
                            {/* Type and Department */}
                            <div className="flex items-center justify-between text-xs text-gray-600">
                              <span className="flex items-center">
                                <Settings className="w-3 h-3 mr-1" />
                                {workOrder.type}
                              </span>
                              {workOrder.department_name && (
                                <span className="flex items-center">
                                  <Building2 className="w-3 h-3 mr-1" />
                                  {workOrder.department_name}
                                </span>
                              )}
                            </div>
                            
                            {/* Machine */}
                            {workOrder.machine_name && (
                              <div className="text-xs text-gray-600">
                                Machine: {workOrder.machine_name}
                              </div>
                            )}
                            
                            {/* Assignee */}
                            {workOrder.assignee_name && (
                              <div className="flex items-center text-xs text-gray-600">
                                <User className="w-3 h-3 mr-1" />
                                {workOrder.assignee_name}
                              </div>
                            )}
                            
                            {/* Due Date */}
                            {workOrder.due_date && (
                              <div className={`flex items-center text-xs ${
                                overdue ? 'text-red-600 font-medium' : 'text-gray-600'
                              }`}>
                                <Calendar className="w-3 h-3 mr-1" />
                                Due {formatDate(workOrder.due_date)}
                              </div>
                            )}
                            
                            {/* Checklist Progress */}
                            {total > 0 && (
                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center text-gray-600">
                                  <CheckSquare className="w-3 h-3 mr-1" />
                                  Checklist {completed}/{total}
                                </div>
                                <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                  <div 
                                    className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                                    style={{ width: `${(completed / total) * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}
                            
                            {/* Tags */}
                            {workOrder.tags && workOrder.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {workOrder.tags.slice(0, 2).map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs px-1.5 py-0.5">
                                    {tag}
                                  </Badge>
                                ))}
                                {workOrder.tags.length > 2 && (
                                  <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                                    +{workOrder.tags.length - 2}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                  
                  {/* Empty state */}
                  {columnWorkOrders.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Clock className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-sm">No work orders</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default KanbanBoard;
