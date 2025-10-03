import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  X, 
  Plus, 
  Settings, 
  Building2, 
  Clock,
  Calendar,
  Repeat
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function MaintenanceTaskForm({ type, frequency, onClose, onCreate, user }) {
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    machine: '',
    frequency: frequency || 'Daily',
    time: '08:00',
    priority: 'Medium',
    notes: '',
    safety_notes: ''
  });
  const [checklistItems, setChecklistItems] = useState([]);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [departments, setDepartments] = useState([]);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (formData.department) {
      fetchMachines(formData.department);
    } else {
      setMachines([]);
      setFormData(prev => ({ ...prev, machine: '' }));
    }
  }, [formData.department]);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${API}/departments`);
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchMachines = async (departmentId) => {
    try {
      const response = await axios.get(`${API}/machines?department_id=${departmentId}`);
      setMachines(response.data);
    } catch (error) {
      console.error('Error fetching machines:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.department || !formData.machine) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const checklistWithIds = checklistItems.map((item, index) => ({
        id: `new-${Date.now()}-${index}`,
        text: item,
        completed: false,
        created_by: user.username,
        created_at: new Date().toISOString()
      }));

      const newTask = {
        ...formData,
        checklist: checklistWithIds,
        created_by: user.username,
        created_at: new Date().toISOString()
      };

      onCreate(newTask);
      toast.success('Maintenance task created successfully!');
    } catch (error) {
      toast.error('Failed to create maintenance task');
    } finally {
      setLoading(false);
    }
  };

  const addChecklistItem = () => {
    if (!newChecklistItem.trim()) return;
    
    setChecklistItems(prev => [...prev, newChecklistItem.trim()]);
    setNewChecklistItem('');
  };

  const removeChecklistItem = (index) => {
    setChecklistItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getFrequencyIcon = (freq) => {
    const icons = {
      'Daily': Clock,
      'Weekly': Calendar,
      'Monthly': Repeat
    };
    return icons[freq] || Clock;
  };

  const FrequencyIcon = getFrequencyIcon(formData.frequency);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden bg-white">
        <CardHeader className="pb-4 border-b">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <FrequencyIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl text-gray-900">
                  Create {formData.frequency} Maintenance Task
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Add a new preventive maintenance schedule
                </p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
              data-testid="close-maintenance-form"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Information</h3>
                
                <div>
                  <Label htmlFor="task-title" className="text-sm font-medium text-gray-700">
                    Task Title *
                  </Label>
                  <Input
                    id="task-title"
                    type="text"
                    placeholder="e.g., Oil Level Check - CNC Machine 01"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    required
                    className="mt-1"
                    data-testid="maintenance-task-title"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Department *</Label>
                    <Select 
                      value={formData.department} 
                      onValueChange={(value) => handleChange('department', value)}
                    >
                      <SelectTrigger className="mt-1" data-testid="maintenance-task-department">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map(dept => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Machine/Equipment *</Label>
                    <Select 
                      value={formData.machine} 
                      onValueChange={(value) => handleChange('machine', value)}
                      disabled={!formData.department}
                    >
                      <SelectTrigger className="mt-1" data-testid="maintenance-task-machine">
                        <SelectValue placeholder={formData.department ? "Select machine" : "Select department first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {machines.map(machine => (
                          <SelectItem key={machine.id} value={machine.id}>
                            {machine.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Frequency</Label>
                    <Select 
                      value={formData.frequency} 
                      onValueChange={(value) => handleChange('frequency', value)}
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
                  </div>

                  <div>
                    <Label htmlFor="task-time" className="text-sm font-medium text-gray-700">
                      Scheduled Time
                    </Label>
                    <Input
                      id="task-time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => handleChange('time', e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Priority</Label>
                    <Select 
                      value={formData.priority} 
                      onValueChange={(value) => handleChange('priority', value)}
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
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Instructions</h3>
                
                <div>
                  <Label htmlFor="task-notes" className="text-sm font-medium text-gray-700">
                    Maintenance Instructions
                  </Label>
                  <Textarea
                    id="task-notes"
                    placeholder="Detailed instructions for performing this maintenance task..."
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    rows={4}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="task-safety" className="text-sm font-medium text-gray-700">
                    Safety Notes
                  </Label>
                  <Textarea
                    id="task-safety"
                    placeholder="Important safety considerations and precautions..."
                    value={formData.safety_notes}
                    onChange={(e) => handleChange('safety_notes', e.target.value)}
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Checklist */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Checklist Items</h3>
                
                <div className="flex space-x-2">
                  <Input
                    type="text"
                    placeholder="Add checklist item (e.g., Check oil levels)"
                    value={newChecklistItem}
                    onChange={(e) => setNewChecklistItem(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addChecklistItem())}
                    className="flex-1"
                    data-testid="new-maintenance-task-checklist-item"
                  />
                  <Button
                    type="button"
                    onClick={addChecklistItem}
                    disabled={!newChecklistItem.trim()}
                    size="sm"
                    data-testid="add-maintenance-task-checklist-item"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {checklistItems.length > 0 && (
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {checklistItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm text-gray-700">{item}</span>
                        <Button
                          type="button"
                          onClick={() => removeChecklistItem(index)}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !formData.title.trim() || !formData.department || !formData.machine}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  data-testid="create-maintenance-task-btn"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating...</span>
                    </div>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Task
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}

export default MaintenanceTaskForm;