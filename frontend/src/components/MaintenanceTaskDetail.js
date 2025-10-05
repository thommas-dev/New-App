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
  Settings, 
  Building2, 
  FileText,
  CheckSquare,
  Edit3,
  Save,
  Upload,
  Download,
  Plus,
  Trash2,
  Printer,
  Clock,
  Calendar,
  Repeat
} from 'lucide-react';

function MaintenanceTaskDetail({ task, onClose, onUpdate, user }) {
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [taskData, setTaskData] = useState({
    title: task.title,
    department: task.department,
    machine: task.machine,
    frequency: task.frequency || 'Daily',
    time: task.time || '08:00',
    priority: task.priority || 'Medium',
    notes: task.notes || '',
    safety_notes: task.safety_notes || ''
  });
  const [checklist, setChecklist] = useState(task.checklist || []);
  const [files, setFiles] = useState(task.files || []);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [isChecklistSaving, setIsChecklistSaving] = useState(false);
  const abortRef = useRef(null);
  
  // Generate unique cache key for this maintenance task
  const cacheKey = `equiptrack:checklist:maintenance:${task.id || 'sample'}`;
  
  // Load checklist from localStorage on mount (check for unsaved changes)
  useEffect(() => {
    const savedDraft = localStorage.getItem(cacheKey);
    if (savedDraft) {
      try {
        const draftChecklist = JSON.parse(savedDraft);
        // Only use draft if it's newer than current checklist
        if (draftChecklist.length !== checklist.length || 
            JSON.stringify(draftChecklist) !== JSON.stringify(checklist)) {
          setChecklist(draftChecklist);
        }
      } catch (error) {
        console.error('Failed to parse checklist draft:', error);
      }
    }
  }, []);
  
  useEffect(() => {
    return () => {
      // Cancel any in-flight save on unmount
      abortRef.current?.abort();
    };
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      // In a full implementation, you'd update via API
      toast.success('Maintenance task updated successfully!');
      setEditMode(false);
      
      if (onUpdate) {
        onUpdate({ ...task, ...taskData, checklist, files });
      }
    } catch (error) {
      toast.error('Failed to update maintenance task');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const printContent = generatePrintContent();
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const generatePrintContent = () => {
    const completedItems = checklist.filter(item => item.completed).length;
    const totalItems = checklist.length;
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Maintenance Work Order - ${taskData.title}</title>
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
              min-width: 100px; 
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
            <div class="title">${taskData.title}</div>
            <div class="subtitle">Maintenance Work Order - ${taskData.frequency}</div>
          </div>

          <div class="section">
            <div class="section-title">Task Information</div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Department:</span>
                <span>${taskData.department}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Machine:</span>
                <span>${taskData.machine}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Frequency:</span>
                <span>${taskData.frequency}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Scheduled Time:</span>
                <span>${taskData.time}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Priority:</span>
                <span>${taskData.priority}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Date:</span>
                <span>_________________</span>
              </div>
            </div>
          </div>

          ${taskData.notes ? `
            <div class="section">
              <div class="section-title">Instructions</div>
              <p>${taskData.notes}</p>
            </div>
          ` : ''}

          ${taskData.safety_notes ? `
            <div class="section">
              <div class="section-title">Safety Notes</div>
              <p style="background: #fff3cd; padding: 10px; border: 1px solid #ffeaa7; border-radius: 4px;">
                ${taskData.safety_notes}
              </p>
            </div>
          ` : ''}

          <div class="section">
            <div class="section-title">Checklist (${completedItems}/${totalItems} completed)</div>
            ${checklist.map(item => `
              <div class="checklist-item">
                <span class="checkbox ${item.completed ? 'checked' : ''}"></span>
                <span>${item.text}</span>
              </div>
            `).join('')}
            ${checklist.length === 0 ? '<p>No checklist items defined.</p>' : ''}
          </div>

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

  // Removed old functions - using async versions below

  const handleChecklistToggle = (itemId, completed) => {
    // Update local state only (no auto-save)
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
    // Save draft to localStorage for recovery
    localStorage.setItem(cacheKey, JSON.stringify(updatedChecklist));
  };

  const addChecklistItem = () => {
    if (!newChecklistItem.trim()) return;
    
    const newItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // More unique ID
      text: newChecklistItem.trim(),
      completed: false,
      created_at: new Date().toISOString(),
      created_by: user.username
    };
    
    const updatedChecklist = [...checklist, newItem];
    setChecklist(updatedChecklist);
    setNewChecklistItem('');
    // Save draft to localStorage
    localStorage.setItem(cacheKey, JSON.stringify(updatedChecklist));
    toast.success('Checklist item added');
  };

  const removeChecklistItem = (itemId) => {
    const updatedChecklist = checklist.filter(item => item.id !== itemId);
    setChecklist(updatedChecklist);
    // Save draft to localStorage
    localStorage.setItem(cacheKey, JSON.stringify(updatedChecklist));
    toast.success('Checklist item removed');
  };

  const saveChecklistChanges = async () => {
    // Prevent multiple simultaneous saves
    if (isChecklistSaving) return;
    
    setIsChecklistSaving(true);
    
    try {
      // Cancel any previous save request
      if (abortRef.current) {
        abortRef.current.abort();
      }
      
      // Create new AbortController for this request
      abortRef.current = new AbortController();
      
      // Check if this is a real work order (has wo_id) or sample maintenance task
      if (task.wo_id || task.id) {
        // This is a real work order - save to backend
        const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
        const API = `${BACKEND_URL}/api`;
        
        const response = await axios.put(`${API}/work-orders/${task.id}`, {
          checklist: checklist
        }, {
          signal: abortRef.current.signal
        });
        
        // Use authoritative data from backend response
        const savedChecklist = response.data.checklist || checklist;
        setChecklist(savedChecklist);
        
        // Clear localStorage draft after successful save
        localStorage.removeItem(cacheKey);
        
        // Trigger cross-page synchronization with authoritative data
        const updateEvent = new CustomEvent('workOrderUpdated', {
          detail: { workOrderId: task.id, checklist: savedChecklist }
        });
        window.dispatchEvent(updateEvent);
        
        toast.success('Checklist saved successfully to database!');
      } else {
        // This is sample maintenance task data - save to localStorage with expiry
        const savedData = {
          checklist: checklist,
          timestamp: Date.now(),
          taskId: task.id || 'sample'
        };
        localStorage.setItem(`equiptrack:sample:${task.id || 'default'}`, JSON.stringify(savedData));
        
        // Clear draft since we've saved it
        localStorage.removeItem(cacheKey);
        
        toast.success('Sample maintenance task updated locally!');
      }
      
      // Don't call onUpdate to prevent modal from closing
      // Parent component will refresh data when modal is actually closed
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Save request was aborted');
        return; // Don't show error for aborted requests
      }
      
      console.error('Failed to save checklist:', error);
      toast.error('Failed to save checklist');
    } finally {
      setIsChecklistSaving(false);
      abortRef.current = null;
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const newFile = {
        id: Date.now().toString(),
        name: file.name,
        size: file.size,
        type: file.type,
        uploaded_at: new Date().toISOString(),
        uploaded_by: user.username,
        url: URL.createObjectURL(file)
      };
      
      setFiles(prev => [...prev, newFile]);
      toast.success(`File "${file.name}" uploaded successfully`);
    }
  };

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
    toast.success('File removed');
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFrequencyIcon = (frequency) => {
    const icons = {
      'Daily': Clock,
      'Weekly': Calendar,
      'Monthly': Repeat
    };
    return icons[frequency] || Clock;
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
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div>
                  {editMode ? (
                    <Input
                      value={taskData.title}
                      onChange={(e) => setTaskData(prev => ({ ...prev, title: e.target.value }))}
                      className="text-xl font-semibold mb-2"
                      data-testid="edit-task-title"
                    />
                  ) : (
                    <CardTitle className="text-xl text-gray-900">{taskData.title}</CardTitle>
                  )}
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <Badge className="bg-green-100 text-green-800">
                      {taskData.frequency} Maintenance
                    </Badge>
                    <span className="flex items-center">
                      <Building2 className="w-4 h-4 mr-1" />
                      {taskData.department}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                data-testid="print-maintenance-task"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              
              {!editMode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditMode(true)}
                  data-testid="edit-maintenance-task-btn"
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
                  data-testid="save-maintenance-task-btn"
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
                variant="ghost"
                size="sm"
                onClick={() => {
                  // Block closing during save
                  if (isChecklistSaving) {
                    toast.info('Please wait for checklist to save before closing');
                    return;
                  }
                  
                  // Check for unsaved changes
                  const currentDraft = localStorage.getItem(cacheKey);
                  if (currentDraft && JSON.stringify(checklist) !== JSON.stringify(task.checklist)) {
                    const proceed = window.confirm('You have unsaved checklist changes. Close anyway?');
                    if (!proceed) return;
                    
                    // Clear draft if user chooses to discard changes
                    localStorage.removeItem(cacheKey);
                  }
                  
                  if (onUpdate) {
                    // Refresh parent data when closing
                    onUpdate({ ...task, checklist });
                  }
                  onClose();
                }}
                className="h-8 w-8 p-0"
                data-testid="close-maintenance-task-detail"
                disabled={isChecklistSaving}
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
                <TabsTrigger value="files">Files & Manuals</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Department</Label>
                      {editMode ? (
                        <Input
                          value={taskData.department}
                          onChange={(e) => setTaskData(prev => ({ ...prev, department: e.target.value }))}
                          className="mt-1"
                        />
                      ) : (
                        <p className="mt-1 text-sm text-gray-900 p-2 bg-gray-50 rounded">
                          {taskData.department}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">Machine/Equipment</Label>
                      {editMode ? (
                        <Input
                          value={taskData.machine}
                          onChange={(e) => setTaskData(prev => ({ ...prev, machine: e.target.value }))}
                          className="mt-1"
                        />
                      ) : (
                        <p className="mt-1 text-sm text-gray-900 p-2 bg-gray-50 rounded">
                          {taskData.machine}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">Priority</Label>
                      {editMode ? (
                        <Select 
                          value={taskData.priority} 
                          onValueChange={(value) => setTaskData(prev => ({ ...prev, priority: value }))}
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
                        <p className="mt-1 text-sm text-gray-900 p-2 bg-gray-50 rounded">
                          {taskData.priority}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Frequency</Label>
                      {editMode ? (
                        <Select 
                          value={taskData.frequency} 
                          onValueChange={(value) => setTaskData(prev => ({ ...prev, frequency: value }))}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Daily">Daily</SelectItem>
                            <SelectItem value="Weekly">Weekly</SelectItem>
                            <SelectItem value="Monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="mt-1 text-sm text-gray-900 p-2 bg-gray-50 rounded">
                          {taskData.frequency}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">Scheduled Time</Label>
                      {editMode ? (
                        <Input
                          type="time"
                          value={taskData.time}
                          onChange={(e) => setTaskData(prev => ({ ...prev, time: e.target.value }))}
                          className="mt-1"
                        />
                      ) : (
                        <p className="mt-1 text-sm text-gray-900 p-2 bg-gray-50 rounded">
                          {taskData.time}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">Task ID</Label>
                      <p className="mt-1 text-sm font-mono text-gray-600 p-2 bg-gray-50 rounded">
                        MT-{task.id || '001'}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-sm font-medium text-gray-700">Instructions</Label>
                  {editMode ? (
                    <Textarea
                      value={taskData.notes}
                      onChange={(e) => setTaskData(prev => ({ ...prev, notes: e.target.value }))}
                      rows={4}
                      className="mt-1"
                      placeholder="Detailed maintenance instructions..."
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap p-3 bg-gray-50 rounded-lg">
                      {taskData.notes || 'No instructions provided.'}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Safety Notes</Label>
                  {editMode ? (
                    <Textarea
                      value={taskData.safety_notes}
                      onChange={(e) => setTaskData(prev => ({ ...prev, safety_notes: e.target.value }))}
                      rows={3}
                      className="mt-1"
                      placeholder="Important safety considerations..."
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      {taskData.safety_notes || 'No safety notes specified.'}
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="checklist" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Maintenance Checklist</h3>
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

                {/* Add new checklist item - only in edit mode */}
                {editMode && (
                  <div className="flex space-x-2 p-4 bg-green-50 rounded-lg">
                    <Input
                      type="text"
                      placeholder="Add checklist item (e.g., Check oil levels, Inspect belts)"
                      value={newChecklistItem}
                      onChange={(e) => setNewChecklistItem(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addChecklistItem()}
                      className="flex-1"
                      data-testid="new-maintenance-checklist-item"
                    />
                    <Button
                      onClick={addChecklistItem}
                      disabled={!newChecklistItem.trim()}
                      size="sm"
                      data-testid="add-maintenance-checklist-item"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                <div className="space-y-3">
                  {checklist.map((item, index) => (
                    <div key={item.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Checkbox
                        id={`maintenance-checklist-${item.id}`}
                        checked={item.completed}
                        onCheckedChange={(checked) => handleChecklistToggle(item.id, checked)}
                        className="mt-0.5"
                        disabled={!editMode}
                        data-testid={`maintenance-checklist-item-${index}`}
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor={`maintenance-checklist-${item.id}`}
                          className={`text-sm cursor-pointer ${
                            item.completed ? 'line-through text-gray-500' : 'text-gray-900'
                          }`}
                        >
                          {item.text}
                        </Label>
                        <div className="text-xs text-gray-500 mt-1">
                          Added by {item.created_by} on {formatDate(item.created_at)}
                          {item.completed && item.completed_by && (
                            <span> • Completed by {item.completed_by}</span>
                          )}
                        </div>
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
                      disabled={loading || isChecklistSaving}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      data-testid="save-maintenance-checklist"
                    >
                      {isChecklistSaving ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Saving...</span>
                        </div>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Checklist
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {totalItems === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <CheckSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>No checklist items yet. Add maintenance procedures above.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="files" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Manuals & Documentation</h3>
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="maintenance-file-upload"
                    />
                    <Label htmlFor="maintenance-file-upload">
                      <Button variant="outline" size="sm" className="cursor-pointer" asChild>
                        <span>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload File
                        </span>
                      </Button>
                    </Label>
                  </div>
                </div>

                <div className="space-y-3">
                  {files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{file.name}</p>
                          <p className="text-sm text-gray-500">
                            {formatFileSize(file.size)} • Uploaded by {file.uploaded_by} on {formatDate(file.uploaded_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(file.url, '_blank')}
                          className="h-8 w-8 p-0"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {files.length === 0 && (
                  <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="mb-2">No files uploaded yet</p>
                    <p className="text-sm">Upload manuals, diagrams, or documentation for this maintenance task</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="schedule" className="space-y-4">
                <h3 className="text-lg font-medium">Maintenance Schedule</h3>
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Advanced scheduling features will be implemented in Phase 3.</p>
                  <p className="text-sm mt-2">Current: {taskData.frequency} at {taskData.time}</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}

export default MaintenanceTaskDetail;