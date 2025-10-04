import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { 
  Plus, 
  X, 
  Calendar,
  User,
  Building2,
  Settings,
  Tag,
  Clock
} from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

function WorkOrderForm({ user, onClose, onWorkOrderCreated }) {
  const [formData, setFormData] = useState({
    title: '',
    type: 'Repair',
    priority: 'Medium',
    assignee: '',
    site: 'Main Site',
    department_id: '',
    machine_id: '',
    location: '',
    due_date: '',
    scheduled_start: '',
    scheduled_end: '',
    estimated_duration: '',
    description: '',
    checklist_items: [],
    tags: []
  });

  const [departments, setDepartments] = useState([]);
  const [machines, setMachines] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    fetchDepartments();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (formData.department_id) {
      fetchMachines(formData.department_id);
    } else {
      setMachines([]);
      setFormData(prev => ({ ...prev, machine_id: '' }));
    }
  }, [formData.department_id]);

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

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API}/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        assignee: formData.assignee === 'none' ? null : formData.assignee,
        department_id: formData.department_id === 'none' ? null : formData.department_id,
        machine_id: formData.machine_id === 'none' ? null : formData.machine_id,
        estimated_duration: formData.estimated_duration ? parseInt(formData.estimated_duration) : null,
        due_date: formData.due_date || null,
        scheduled_start: formData.scheduled_start || null,
        scheduled_end: formData.scheduled_end || null
      };

      const response = await axios.post(`${API}/work-orders`, submitData);
      toast.success('Work order created successfully!');
      
      if (onWorkOrderCreated) {
        onWorkOrderCreated(response.data);
      }
      
      onClose();
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to create work order';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const addChecklistItem = () => {
    if (!newChecklistItem.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      checklist_items: [...prev.checklist_items, newChecklistItem.trim()]
    }));
    setNewChecklistItem('');
  };

  const removeChecklistItem = (index) => {
    setFormData(prev => ({
      ...prev,
      checklist_items: prev.checklist_items.filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    if (!newTag.trim() || formData.tags.includes(newTag.trim())) return;
    
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, newTag.trim()]
    }));
    setNewTag('');
  };

  const removeTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6" data-testid="work-order-form">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Information</h3>
        
        {/* Title */}
        <div>
          <Label htmlFor="title" className="text-sm font-medium text-gray-700">
            Title *
          </Label>
          <Input
            id="title"
            type="text"
            placeholder="Enter work order title"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            required
            className="mt-1"
            data-testid="wo-title"
          />
        </div>

        {/* Type and Priority */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-gray-700">Type *</Label>
            <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
              <SelectTrigger className="mt-1" data-testid="wo-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PM">Preventive Maintenance</SelectItem>
                <SelectItem value="Repair">Repair</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700">Priority</Label>
            <Select value={formData.priority} onValueChange={(value) => handleChange('priority', value)}>
              <SelectTrigger className="mt-1" data-testid="wo-priority">
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

        {/* Assignee */}
        <div>
          <Label className="text-sm font-medium text-gray-700">Assignee</Label>
          <Select value={formData.assignee} onValueChange={(value) => handleChange('assignee', value)}>
            <SelectTrigger className="mt-1" data-testid="wo-assignee">
              <SelectValue placeholder="Select assignee (optional)" />
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
        </div>
      </div>

      {/* Location Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Location & Equipment</h3>
        
        {/* Site */}
        <div>
          <Label htmlFor="site" className="text-sm font-medium text-gray-700">
            Site
          </Label>
          <Input
            id="site"
            type="text"
            value={formData.site}
            onChange={(e) => handleChange('site', e.target.value)}
            className="mt-1"
            data-testid="wo-site"
          />
        </div>

        {/* Department and Machine */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-gray-700">Department</Label>
            <Select value={formData.department_id} onValueChange={(value) => handleChange('department_id', value)}>
              <SelectTrigger className="mt-1" data-testid="wo-department">
                <SelectValue placeholder="Select department (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No department</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700">Machine</Label>
            <Select 
              value={formData.machine_id} 
              onValueChange={(value) => handleChange('machine_id', value)}
              disabled={!formData.department_id}
            >
              <SelectTrigger className="mt-1" data-testid="wo-machine">
                <SelectValue placeholder={formData.department_id ? "Select machine" : "Select department first"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No specific machine</SelectItem>
                {machines.map(machine => (
                  <SelectItem key={machine.id} value={machine.id}>
                    {machine.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Location */}
        <div>
          <Label htmlFor="location" className="text-sm font-medium text-gray-700">
            Specific Location
          </Label>
          <Input
            id="location"
            type="text"
            placeholder="e.g., Bay 3, Floor 2, Section A"
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
            className="mt-1"
            data-testid="wo-location"
          />
        </div>
      </div>

      {/* Scheduling */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Scheduling</h3>
        
        {/* Due Date and Estimated Duration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="due-date" className="text-sm font-medium text-gray-700">
              Due Date
            </Label>
            <Input
              id="due-date"
              type="datetime-local"
              value={formData.due_date}
              onChange={(e) => handleChange('due_date', e.target.value)}
              className="mt-1"
              data-testid="wo-due-date"
            />
          </div>

          <div>
            <Label htmlFor="estimated-duration" className="text-sm font-medium text-gray-700">
              Estimated Duration (minutes)
            </Label>
            <Input
              id="estimated-duration"
              type="number"
              placeholder="e.g., 120"
              value={formData.estimated_duration}
              onChange={(e) => handleChange('estimated_duration', e.target.value)}
              className="mt-1"
              data-testid="wo-estimated-duration"
            />
          </div>
        </div>

        {/* Scheduled Start and End */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="scheduled-start" className="text-sm font-medium text-gray-700">
              Scheduled Start
            </Label>
            <Input
              id="scheduled-start"
              type="datetime-local"
              value={formData.scheduled_start}
              onChange={(e) => handleChange('scheduled_start', e.target.value)}
              className="mt-1"
              data-testid="wo-scheduled-start"
            />
          </div>

          <div>
            <Label htmlFor="scheduled-end" className="text-sm font-medium text-gray-700">
              Scheduled End
            </Label>
            <Input
              id="scheduled-end"
              type="datetime-local"
              value={formData.scheduled_end}
              onChange={(e) => handleChange('scheduled_end', e.target.value)}
              className="mt-1"
              data-testid="wo-scheduled-end"
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description" className="text-sm font-medium text-gray-700">
          Description
        </Label>
        <Textarea
          id="description"
          placeholder="Detailed description of the work to be performed..."
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={4}
          className="mt-1"
          data-testid="wo-description"
        />
      </div>

      {/* Checklist */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-700">Checklist Items</Label>
        
        {/* Add new checklist item */}
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Add checklist item..."
            value={newChecklistItem}
            onChange={(e) => setNewChecklistItem(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addChecklistItem())}
            className="flex-1"
            data-testid="new-checklist-item"
          />
          <Button
            type="button"
            onClick={addChecklistItem}
            disabled={!newChecklistItem.trim()}
            size="sm"
            data-testid="add-checklist-item"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Display checklist items */}
        {formData.checklist_items.length > 0 && (
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {formData.checklist_items.map((item, index) => (
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

      {/* Tags */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-700">Tags</Label>
        
        {/* Add new tag */}
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Add tag..."
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            className="flex-1"
            data-testid="new-tag"
          />
          <Button
            type="button"
            onClick={addTag}
            disabled={!newTag.trim() || formData.tags.includes(newTag.trim())}
            size="sm"
            data-testid="add-tag"
          >
            <Tag className="w-4 h-4" />
          </Button>
        </div>

        {/* Display tags */}
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                <span>{tag}</span>
                <Button
                  type="button"
                  onClick={() => removeTag(tag)}
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                >
                  <X className="w-2 h-2" />
                </Button>
              </Badge>
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
          data-testid="cancel-work-order"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading || !formData.title.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white"
          data-testid="submit-work-order"
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Creating...</span>
            </div>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Create Work Order
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

export default WorkOrderForm;