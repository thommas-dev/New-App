import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Trash2
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function MachineDetail({ machine, onClose, onUpdate, user }) {
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [machineData, setMachineData] = useState({
    name: machine.name,
    notes: machine.notes || '',
    specifications: machine.specifications || '',
    location_details: machine.location_details || ''
  });
  const [checklist, setChecklist] = useState(machine.checklist || []);
  const [files, setFiles] = useState(machine.files || []);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [newNote, setNewNote] = useState('');

  const handleSave = async () => {
    setLoading(true);
    try {
      // In a full implementation, you'd update the machine via API
      // For now, we'll just simulate the save
      
      toast.success('Machine updated successfully!');
      setEditMode(false);
      
      if (onUpdate) {
        onUpdate({ ...machine, ...machineData, checklist, files });
      }
    } catch (error) {
      toast.error('Failed to update machine');
    } finally {
      setLoading(false);
    }
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

  const handleChecklistToggle = (itemId, completed) => {
    setChecklist(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { 
              ...item, 
              completed, 
              completed_by: completed ? user.username : null,
              completed_at: completed ? new Date().toISOString() : null
            } 
          : item
      )
    );
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // In a full implementation, you'd upload to a server
      const newFile = {
        id: Date.now().toString(),
        name: file.name,
        size: file.size,
        type: file.type,
        uploaded_at: new Date().toISOString(),
        uploaded_by: user.username,
        url: URL.createObjectURL(file) // Temporary URL for demo
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
                      value={machineData.name}
                      onChange={(e) => setMachineData(prev => ({ ...prev, name: e.target.value }))}
                      className="text-xl font-semibold mb-2"
                      data-testid="edit-machine-name"
                    />
                  ) : (
                    <CardTitle className="text-xl text-gray-900">{machine.name}</CardTitle>
                  )}
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Building2 className="w-4 h-4" />
                    <span>{machine.department_name}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {!editMode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditMode(true)}
                  data-testid="edit-machine-btn"
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
                  data-testid="save-machine-btn"
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
                onClick={onClose}
                className="h-8 w-8 p-0"
                data-testid="close-machine-detail"
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
                <TabsTrigger value="files">Files & Diagrams</TabsTrigger>
                <TabsTrigger value="maintenance">Maintenance History</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Machine Notes</Label>
                    {editMode ? (
                      <Textarea
                        value={machineData.notes}
                        onChange={(e) => setMachineData(prev => ({ ...prev, notes: e.target.value }))}
                        rows={4}
                        className="mt-1"
                        placeholder="Add notes about this machine (operating procedures, safety notes, etc.)"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap p-3 bg-gray-50 rounded-lg">
                        {machineData.notes || 'No notes added yet.'}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Specifications</Label>
                    {editMode ? (
                      <Textarea
                        value={machineData.specifications}
                        onChange={(e) => setMachineData(prev => ({ ...prev, specifications: e.target.value }))}
                        rows={3}
                        className="mt-1"
                        placeholder="Technical specifications, model numbers, capacity, etc."
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap p-3 bg-gray-50 rounded-lg">
                        {machineData.specifications || 'No specifications added yet.'}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Location Details</Label>
                    {editMode ? (
                      <Input
                        value={machineData.location_details}
                        onChange={(e) => setMachineData(prev => ({ ...prev, location_details: e.target.value }))}
                        className="mt-1"
                        placeholder="Specific location within department (e.g., Bay 3, Line A, Floor 2)"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900 p-3 bg-gray-50 rounded-lg">
                        {machineData.location_details || 'Location not specified.'}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Machine ID</Label>
                      <p className="text-sm font-mono text-gray-800">{machine.id.slice(0, 8)}...</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Created</Label>
                      <p className="text-sm text-gray-800">{formatDate(machine.created_at)}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="documentation" className="space-y-4">
                <h3 className="text-lg font-medium">Machine Documentation</h3>
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Machine documentation and reference materials will be managed here.</p>
                  <p className="text-sm mt-2">Upload manuals, specifications, and maintenance guides.</p>
                </div>
              </TabsContent>

              <TabsContent value="files" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Files & Diagrams</h3>
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <Label htmlFor="file-upload">
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
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600" />
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
                    <p className="text-sm">Upload PDFs, diagrams, manuals, or photos related to this machine</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="maintenance" className="space-y-4">
                <h3 className="text-lg font-medium">Maintenance History</h3>
                <div className="text-center py-8 text-gray-500">
                  <Settings className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Maintenance history tracking will be implemented with the Maintenance Work Orders feature.</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}

export default MachineDetail;