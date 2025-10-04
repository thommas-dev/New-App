import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  X, 
  Calendar, 
  User, 
  Building2, 
  Settings, 
  Clock, 
  FileText,
  CheckSquare,
  Edit3,
  Printer,
  Save,
  Tag,
  Plus,
  Trash2
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function WorkOrderDetail({ workOrder, onClose, onUpdate, user }) {
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: workOrder.title,
    priority: workOrder.priority,
    status: workOrder.status,
    assignee: workOrder.assignee || 'none',
    due_date: workOrder.due_date ? new Date(workOrder.due_date).toISOString().slice(0, 16) : '',
    scheduled_start: workOrder.scheduled_start ? new Date(workOrder.scheduled_start).toISOString().slice(0, 16) : '',
    scheduled_end: workOrder.scheduled_end ? new Date(workOrder.scheduled_end).toISOString().slice(0, 16) : '',
    estimated_duration: workOrder.estimated_duration || '',
    description: workOrder.description || ''
  });
  const [checklist, setChecklist] = useState(workOrder.checklist || []);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [newChecklistItem, setNewChecklistItem] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API}/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
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

  const handleSave = async () => {
    setLoading(true);
    try {
      const updateData = {
        ...formData,
        assignee: formData.assignee === 'none' ? null : formData.assignee,
        estimated_duration: formData.estimated_duration ? parseInt(formData.estimated_duration) : null,
        due_date: formData.due_date || null,
        scheduled_start: formData.scheduled_start || null,
        scheduled_end: formData.scheduled_end || null
      };

      const response = await axios.put(`${API}/work-orders/${workOrder.id}`, updateData);
      
      toast.success('Work order updated successfully!');
      setEditMode(false);
      
      if (onUpdate) {
        onUpdate(response.data);
      }
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to update work order';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleChecklistToggle = (itemId, completed) => {
    // Update local state only (no auto-save, no parent update)
    const updatedChecklist = checklist.map(item => 
      item.id === itemId 
        ? { 
            ...item, 
            completed, 
            completed_by: completed ? user.username : null,
            completed_at: completed ? new Date().toISOString() : null
          } 
        : item
    );
    
    setChecklist(updatedChecklist);
  };

  const addChecklistItem = () => {
    if (!newChecklistItem.trim()) return;
    
    const newItem = {
      id: Date.now().toString(),
      text: newChecklistItem.trim(),
      completed: false,
      created_at: new Date().toISOString(),
      created_by: user.username
    };
    
    setChecklist(prev => [...prev, newItem]);
    setNewChecklistItem('');
    toast.success('Checklist item added');
  };

  const removeChecklistItem = (itemId) => {
    setChecklist(prev => prev.filter(item => item.id !== itemId));
    toast.success('Checklist item removed');
  };

  const saveChecklistChanges = async () => {
    try {
      // Save to backend
      await axios.put(`${API}/work-orders/${workOrder.id}`, {
        checklist: checklist
      });
      
      // Trigger cross-page synchronization
      const updateEvent = new CustomEvent('workOrderUpdated', {
        detail: { workOrderId: workOrder.id, checklist: checklist }
      });
      window.dispatchEvent(updateEvent);
      
      toast.success('Checklist saved successfully!');
      
      // Don't call onUpdate to prevent modal from closing
      // Parent component will refresh data when modal is actually closed
    } catch (error) {
      console.error('Failed to save checklist:', error);
      toast.error('Failed to save checklist');
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const printContent = generateWorkOrderPrintContent();
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const generateWorkOrderPrintContent = () => {
    const completedItems = workOrder.checklist?.filter(item => item.completed).length || 0;
    const totalItems = workOrder.checklist?.length || 0;
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Work Order - ${workOrder.wo_id}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              line-height: 1.4; 
            }
            .header { 
              border-bottom: 2px solid #333; 
              padding-bottom: 10px; 
              margin-bottom: 20px; 
            }
            .title { 
              font-size: 24px; 
              font-weight: bold; 
              margin-bottom: 5px; 
            }
            .subtitle { 
              color: #666; 
              font-size: 14px; 
            }
            .section { 
              margin-bottom: 20px; 
            }
            .section-title { 
              font-size: 16px; 
              font-weight: bold; 
              margin-bottom: 10px; 
              border-bottom: 1px solid #ddd; 
              padding-bottom: 5px; 
            }
            .info-grid { 
              display: grid; 
              grid-template-columns: 1fr 1fr; 
              gap: 10px; 
              margin-bottom: 15px; 
            }
            .info-item { 
              display: flex; 
            }
            .info-label { 
              font-weight: bold; 
              min-width: 120px; 
            }
            .checklist-item { 
              margin: 8px 0; 
              display: flex; 
              align-items: center; 
            }
            .checkbox { 
              width: 16px; 
              height: 16px; 
              border: 1px solid #333; 
              margin-right: 10px; 
              display: inline-block; 
            }
            .checkbox.checked::after { 
              content: '✓'; 
              font-weight: bold; 
              display: block; 
              text-align: center; 
              line-height: 14px; 
            }
            .signature-section { 
              margin-top: 40px; 
              display: grid; 
              grid-template-columns: 1fr 1fr; 
              gap: 40px; 
            }
            .signature-box { 
              border-top: 1px solid #333; 
              padding-top: 5px; 
              text-align: center; 
            }
            @media print { 
              body { margin: 0; } 
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">${workOrder.title}</div>
            <div class="subtitle">Work Order ${workOrder.wo_id} - ${workOrder.type}</div>
          </div>

          <div class="section">
            <div class="section-title">Work Order Information</div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Priority:</span>
                <span>${workOrder.priority}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Status:</span>
                <span>${workOrder.status}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Assignee:</span>
                <span>${workOrder.assignee_name || 'Not assigned'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Requested By:</span>
                <span>${workOrder.requested_by_name}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Department:</span>
                <span>${workOrder.department_name || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Machine:</span>
                <span>${workOrder.machine_name || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Due Date:</span>
                <span>${workOrder.due_date ? new Date(workOrder.due_date).toLocaleDateString() : 'Not set'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Created:</span>
                <span>${new Date(workOrder.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          ${workOrder.description ? `
            <div class="section">
              <div class="section-title">Description</div>
              <p>${workOrder.description}</p>
            </div>
          ` : ''}

          <div class="section">
            <div class="section-title">Checklist (${completedItems}/${totalItems} completed)</div>
            ${workOrder.checklist && workOrder.checklist.length > 0 ? 
              workOrder.checklist.map(item => `
                <div class="checklist-item">
                  <span class="checkbox ${item.completed ? 'checked' : ''}"></span>
                  <span>${item.text}</span>
                </div>
              `).join('') : 
              '<p>No checklist items defined.</p>'
            }
          </div>

          ${workOrder.tags && workOrder.tags.length > 0 ? `
            <div class="section">
              <div class="section-title">Tags</div>
              <p>${workOrder.tags.join(', ')}</p>
            </div>
          ` : ''}

          <div class="section">
            <div class="section-title">Notes/Comments</div>
            <div style="border: 1px solid #ddd; min-height: 80px; padding: 10px;">
              <!-- Space for technician notes -->
            </div>
          </div>

          <div class="signature-section">
            <div class="signature-box">
              <div>Technician Signature</div>
            </div>
            <div class="signature-box">
              <div>Supervisor Signature</div>
            </div>
          </div>

          <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #666;">
            Generated on ${new Date().toLocaleDateString()} - SimplePM Board
          </div>
        </body>
      </html>
    `;
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
      'Backlog': 'bg-gray-100 text-gray-800',
      'Scheduled': 'bg-blue-100 text-blue-800',
      'In Progress': 'bg-yellow-100 text-yellow-800',
      'Completed': 'bg-green-100 text-green-800',
      'On Hold': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const completedItems = checklist.filter(item => item.completed).length;
  const totalItems = checklist.length;
  const progressPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white">
        <CardHeader className="pb-4 border-b">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="font-mono text-xs">
                    {workOrder.wo_id}
                  </Badge>
                  <Badge className={getPriorityColor(workOrder.priority)}>
                    {workOrder.priority}
                  </Badge>
                  <Badge className={getStatusColor(workOrder.status)}>
                    {workOrder.status}
                  </Badge>
                </div>
              </div>
              
              {editMode ? (
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="text-xl font-semibold mb-2"
                  data-testid="edit-wo-title"
                />
              ) : (
                <CardTitle className="text-xl text-gray-900">{workOrder.title}</CardTitle>
              )}
              
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  Requested by {workOrder.requested_by_name}
                </span>
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(workOrder.created_at)}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {!editMode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditMode(true)}
                  data-testid="edit-work-order-btn"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
              
              {editMode && (
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  data-testid="save-work-order-btn"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </>
                  )}
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                data-testid="print-work-order-btn"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (onUpdate) {
                    // Refresh parent data when closing
                    onUpdate(workOrder);
                  }
                  onClose();
                }}
                className="h-8 w-8 p-0"
                data-testid="close-work-order-detail"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <CardContent className="p-6">
            <Tabs defaultValue="details" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="checklist">
                  Checklist ({completedItems}/{totalItems})
                </TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="files">Files</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Priority</Label>
                      {editMode ? (
                        <Select 
                          value={formData.priority} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="mt-1">
                          <Badge className={getPriorityColor(workOrder.priority)}>
                            {workOrder.priority}
                          </Badge>
                        </div>
                      )}
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">Status</Label>
                      {editMode ? (
                        <Select 
                          value={formData.status} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Scheduled">Scheduled</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                            <SelectItem value="On Hold">On Hold</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="mt-1">
                          <Badge className={getStatusColor(workOrder.status)}>
                            {workOrder.status}
                          </Badge>
                        </div>
                      )}
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">Assignee</Label>
                      {editMode ? (
                        <Select 
                          value={formData.assignee} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, assignee: value }))}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select assignee" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No assignee</SelectItem>
                            {users.map(user => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.username} ({user.role})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="mt-1 text-sm text-gray-900">
                          {workOrder.assignee_name || 'Not assigned'}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">Location</Label>
                      <div className="mt-1 space-y-1">
                        <p className="text-sm text-gray-900">{workOrder.site}</p>
                        {workOrder.department_name && (
                          <p className="text-sm text-gray-600 flex items-center">
                            <Building2 className="w-4 h-4 mr-1" />
                            {workOrder.department_name}
                          </p>
                        )}
                        {workOrder.machine_name && (
                          <p className="text-sm text-gray-600 flex items-center">
                            <Settings className="w-4 h-4 mr-1" />
                            {workOrder.machine_name}
                          </p>
                        )}
                        {workOrder.location && (
                          <p className="text-sm text-gray-600">{workOrder.location}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Due Date</Label>
                      {editMode ? (
                        <Input
                          type="datetime-local"
                          value={formData.due_date}
                          onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                          className="mt-1"
                        />
                      ) : (
                        <p className="mt-1 text-sm text-gray-900">
                          {formatDate(workOrder.due_date)}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">Scheduled Start</Label>
                      {editMode ? (
                        <Input
                          type="datetime-local"
                          value={formData.scheduled_start}
                          onChange={(e) => setFormData(prev => ({ ...prev, scheduled_start: e.target.value }))}
                          className="mt-1"
                        />
                      ) : (
                        <p className="mt-1 text-sm text-gray-900">
                          {formatDate(workOrder.scheduled_start)}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">Scheduled End</Label>
                      {editMode ? (
                        <Input
                          type="datetime-local"
                          value={formData.scheduled_end}
                          onChange={(e) => setFormData(prev => ({ ...prev, scheduled_end: e.target.value }))}
                          className="mt-1"
                        />
                      ) : (
                        <p className="mt-1 text-sm text-gray-900">
                          {formatDate(workOrder.scheduled_end)}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">Estimated Duration</Label>
                      {editMode ? (
                        <div className="flex items-center space-x-2 mt-1">
                          <Input
                            type="number"
                            placeholder="e.g., 120"
                            value={formData.estimated_duration}
                            onChange={(e) => setFormData(prev => ({ ...prev, estimated_duration: e.target.value }))}
                            className="flex-1"
                          />
                          <span className="text-sm text-gray-500">minutes</span>
                        </div>
                      ) : (
                        <p className="mt-1 text-sm text-gray-900">
                          {workOrder.estimated_duration ? `${workOrder.estimated_duration} minutes` : 'Not set'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-sm font-medium text-gray-700">Description</Label>
                  {editMode ? (
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className="mt-1"
                      placeholder="Detailed description of the work to be performed..."
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                      {workOrder.description || 'No description provided.'}
                    </p>
                  )}
                </div>

                {workOrder.tags && workOrder.tags.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Tags</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {workOrder.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="checklist" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Checklist</h3>
                  <div className="text-sm text-gray-600">
                    {completedItems} of {totalItems} completed ({Math.round(progressPercentage)}%)
                  </div>
                </div>

                {totalItems > 0 && (
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                )}

                {/* Add new checklist item */}
                <div className="flex space-x-2 p-4 bg-blue-50 rounded-lg">
                  <Input
                    type="text"
                    placeholder="Add new checklist item (e.g., Check oil levels, Inspect belts)"
                    value={newChecklistItem}
                    onChange={(e) => setNewChecklistItem(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addChecklistItem()}
                    className="flex-1"
                    data-testid="new-wo-checklist-item"
                  />
                  <Button
                    onClick={addChecklistItem}
                    disabled={!newChecklistItem.trim()}
                    size="sm"
                    data-testid="add-wo-checklist-item"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  {checklist.map((item, index) => (
                    <div key={item.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Checkbox
                        id={`checklist-${item.id}`}
                        checked={item.completed}
                        onCheckedChange={(checked) => handleChecklistToggle(item.id, checked)}
                        className="mt-0.5"
                        data-testid={`checklist-item-${index}`}
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor={`checklist-${item.id}`}
                          className={`text-sm cursor-pointer ${
                            item.completed ? 'line-through text-gray-500' : 'text-gray-900'
                          }`}
                        >
                          {item.text}
                        </Label>
                        {item.completed && item.completed_by && (
                          <p className="text-xs text-gray-500 mt-1">
                            Completed by {item.completed_by} on {formatDate(item.completed_at)}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeChecklistItem(item.id)}
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>

                {totalItems > 0 && (
                  <div className="flex justify-end pt-4 border-t">
                    <Button
                      onClick={saveChecklistChanges}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      data-testid="save-work-order-checklist"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? 'Saving...' : 'Save Checklist'}
                    </Button>
                  </div>
                )}

                {totalItems === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <CheckSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>No checklist items for this work order. Add maintenance procedures above.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="activity" className="space-y-4">
                <h3 className="text-lg font-medium">Activity Log</h3>
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Activity tracking will be implemented in Phase 2.</p>
                </div>
              </TabsContent>

              <TabsContent value="files" className="space-y-4">
                <h3 className="text-lg font-medium">Files & Attachments</h3>
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>File management will be implemented in Phase 2.</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}

export default WorkOrderDetail;