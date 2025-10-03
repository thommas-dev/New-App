import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import MachineDetail from './MachineDetail';
import { 
  X, 
  Building2, 
  Settings, 
  Plus, 
  Trash2, 
  Edit3,
  Save,
  Calendar
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function DepartmentDetail({ department, onClose, onUpdate, user }) {
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [departmentData, setDepartmentData] = useState({
    name: department.name
  });
  const [machines, setMachines] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [showAddMachine, setShowAddMachine] = useState(false);
  const [newMachineName, setNewMachineName] = useState('');
  const [addingMachine, setAddingMachine] = useState(false);

  useEffect(() => {
    fetchMachines();
  }, []);

  const fetchMachines = async () => {
    try {
      const response = await axios.get(`${API}/machines?department_id=${department.id}`);
      setMachines(response.data);
    } catch (error) {
      console.error('Error fetching machines:', error);
      toast.error('Failed to load machines');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // In a full implementation, you'd update the department via API
      const response = await axios.put(`${API}/departments/${department.id}`, {
        name: departmentData.name
      });
      
      toast.success('Department updated successfully!');
      setEditMode(false);
      
      if (onUpdate) {
        onUpdate({ ...department, ...departmentData });
      }
    } catch (error) {
      toast.error('Failed to update department');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMachine = async () => {
    if (!newMachineName.trim()) return;

    setAddingMachine(true);
    try {
      const response = await axios.post(`${API}/machines`, {
        name: newMachineName.trim(),
        department_id: department.id
      });
      
      setMachines([...machines, response.data]);
      setNewMachineName('');
      setShowAddMachine(false);
      toast.success('Machine added successfully!');
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to add machine';
      toast.error(message);
    } finally {
      setAddingMachine(false);
    }
  };

  const handleDeleteMachine = async (machineId, machineName) => {
    if (!window.confirm(`Are you sure you want to delete "${machineName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await axios.delete(`${API}/machines/${machineId}`);
      setMachines(machines.filter(machine => machine.id !== machineId));
      toast.success('Machine deleted successfully!');
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to delete machine';
      toast.error(message);
    }
  };

  const handleMachineClick = (machine) => {
    setSelectedMachine(machine);
  };

  const handleMachineUpdate = (updatedMachine) => {
    setMachines(prevMachines =>
      prevMachines.map(machine =>
        machine.id === updatedMachine.id ? updatedMachine : machine
      )
    );
    setSelectedMachine(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white">
        <CardHeader className="pb-4 border-b">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  {user.role === 'Admin' ? (
                    <Input
                      value={departmentData.name}
                      onChange={(e) => setDepartmentData(prev => ({ ...prev, name: e.target.value }))}
                      className="text-xl font-semibold mb-2"
                      data-testid="edit-department-name"
                    />
                  ) : (
                    <CardTitle className="text-xl text-gray-900">{department.name}</CardTitle>
                  )}
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {machines.length} machine{machines.length !== 1 ? 's' : ''}
                    </Badge>
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Created {formatDate(department.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {user.role === 'Admin' && (
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={loading}
                  data-testid="save-department-btn"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Saving...' : 'Save'}
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onClose()}
                data-testid="close-department-modal"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Add Machine Section */}
              {user.role === 'Admin' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-gray-900">Machines in this Department</h3>
                    <Button
                      onClick={() => setShowAddMachine(!showAddMachine)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      size="sm"
                      data-testid="add-machine-btn"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Machine
                    </Button>
                  </div>
                  
                  {showAddMachine && (
                    <div className="flex space-x-2 mb-4">
                      <Input
                        type="text"
                        placeholder="Machine name (e.g., CNC Machine 01)"
                        value={newMachineName}
                        onChange={(e) => setNewMachineName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddMachine()}
                        className="flex-1"
                        data-testid="new-machine-name-input"
                      />
                      <Button
                        onClick={handleAddMachine}
                        disabled={addingMachine || !newMachineName.trim()}
                        size="sm"
                        data-testid="confirm-add-machine"
                      >
                        {addingMachine ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        onClick={() => setShowAddMachine(false)}
                        variant="outline"
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Machines List */}
              {machines.length === 0 ? (
                <Card className="border-2 border-dashed border-gray-300">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Settings className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Machines Yet</h3>
                    <p className="text-gray-600 text-center max-w-md">
                      This department doesn't have any machines yet. 
                      {user.role === 'Admin' && ' Add some machines to start tracking maintenance work.'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {machines.map((machine) => (
                    <Card 
                      key={machine.id} 
                      className="hover:shadow-lg transition-all duration-200 card-animation border-0 shadow-sm cursor-pointer"
                      onClick={() => handleMachineClick(machine)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                              <Settings className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-base font-medium text-gray-900">
                                {machine.name}
                              </CardTitle>
                              <p className="text-xs text-gray-500 mt-1">
                                Added {formatDate(machine.created_at)}
                              </p>
                            </div>
                          </div>
                          
                          {user.role === 'Admin' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteMachine(machine.id, machine.name);
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                              data-testid={`delete-machine-${machine.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="text-xs text-gray-400 font-mono">
                          ID: {machine.id.slice(0, 8)}...
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Machine Detail Modal */}
      {selectedMachine && (
        <MachineDetail
          machine={selectedMachine}
          onClose={() => setSelectedMachine(null)}
          onUpdate={handleMachineUpdate}
          user={user}
        />
      )}
    </div>
  );
}

export default DepartmentDetail;