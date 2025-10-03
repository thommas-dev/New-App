import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import MachineDetail from './MachineDetail';
import { 
  Settings, 
  Plus, 
  Trash2, 
  Building2,
  AlertCircle 
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function MachineManagement({ user }) {
  const [machines, setMachines] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMachine, setNewMachine] = useState({ name: '', department_id: '' });
  const [creating, setCreating] = useState(false);
  const [filterDepartment, setFilterDepartment] = useState('');
  const [selectedMachine, setSelectedMachine] = useState(null);

  const fetchMachines = async () => {
    try {
      const response = await axios.get(`${API}/machines`);
      setMachines(response.data);
    } catch (error) {
      console.error('Error fetching machines:', error);
      toast.error('Failed to load machines');
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
    const loadData = async () => {
      await Promise.all([fetchMachines(), fetchDepartments()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleCreateMachine = async (e) => {
    e.preventDefault();
    if (!newMachine.name.trim() || !newMachine.department_id) return;

    setCreating(true);
    try {
      const response = await axios.post(`${API}/machines`, {
        name: newMachine.name.trim(),
        department_id: newMachine.department_id
      });
      
      setMachines([...machines, response.data]);
      setNewMachine({ name: '', department_id: '' });
      toast.success('Machine created successfully!');
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to create machine';
      toast.error(message);
    } finally {
      setCreating(false);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter machines by department
  const filteredMachines = filterDepartment && filterDepartment !== 'all'
    ? machines.filter(machine => machine.department_id === filterDepartment)
    : machines;

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

  if (user.role !== 'Admin') {
    return (
      <div className="flex items-center justify-center h-96">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Only administrators can manage machines.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="machine-management">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
              <Settings className="w-6 h-6 mr-2 text-blue-600" />
              Machine Management
            </h2>
            <p className="text-gray-600 mt-1">
              Manage machines within departments for detailed work order tracking
            </p>
          </div>
          
          {/* Department Filter */}
          <div className="flex items-center space-x-3">
            <Label htmlFor="filter-department" className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Filter by Department:
            </Label>
            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger className="w-48" data-testid="filter-department">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Create New Machine */}
      {departments.length > 0 ? (
        <Card className="border-0 shadow-sm bg-gradient-to-r from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-gray-900">
              Add New Machine
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateMachine} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="machine-name" className="text-sm font-medium text-gray-700">
                  Machine Name
                </Label>
                <Input
                  id="machine-name"
                  type="text"
                  placeholder="e.g., CNC Machine 01, Conveyor Belt A"
                  value={newMachine.name}
                  onChange={(e) => setNewMachine({ ...newMachine, name: e.target.value })}
                  className="bg-white border-gray-200 focus:border-green-400 focus:ring-green-400"
                  disabled={creating}
                  data-testid="new-machine-name"
                />
              </div>
              <div>
                <Label htmlFor="machine-department" className="text-sm font-medium text-gray-700">
                  Department
                </Label>
                <Select 
                  value={newMachine.department_id} 
                  onValueChange={(value) => setNewMachine({ ...newMachine, department_id: value })}
                  disabled={creating}
                >
                  <SelectTrigger className="bg-white border-gray-200 focus:border-green-400 focus:ring-green-400" data-testid="new-machine-department">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button 
                  type="submit" 
                  disabled={creating || !newMachine.name.trim() || !newMachine.department_id}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  data-testid="create-machine-btn"
                >
                  {creating ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Adding...</span>
                    </div>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Machine
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-dashed border-orange-300 bg-orange-50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Departments Available</h3>
            <p className="text-gray-600 text-center max-w-md mb-4">
              You need to create at least one department before adding machines. 
              Departments help organize your machines by area or function.
            </p>
            <Button 
              onClick={() => window.location.href = '/departments'}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Building2 className="w-4 h-4 mr-2" />
              Go to Department Management
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Machines List */}
      {filteredMachines.length === 0 ? (
        <Card className="border-2 border-dashed border-gray-300">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Settings className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filterDepartment ? 'No Machines in Selected Department' : 'No Machines Yet'}
            </h3>
            <p className="text-gray-600 text-center max-w-md">
              {filterDepartment 
                ? 'This department doesn\'t have any machines yet. Add some machines to start tracking maintenance work.'
                : 'Add your first machine to start organizing maintenance work by specific equipment.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMachines.map((machine) => {
            return (
              <Card key={machine.id} className="hover:shadow-lg transition-all duration-200 card-animation border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-medium text-gray-900 flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
                          <Settings className="w-5 h-5 text-white" />
                        </div>
                        {machine.name}
                      </CardTitle>
                      <p className="text-sm text-gray-500 mt-1 ml-13">
                        Added {formatDate(machine.created_at)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteMachine(machine.id, machine.name)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                      data-testid={`delete-machine-${machine.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Department */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <Building2 className="w-4 h-4 text-gray-500 mr-2" />
                        <span className="text-sm text-gray-600">Department</span>
                      </div>
                      <Badge variant="secondary" className="bg-white border">
                        {machine.department_name}
                      </Badge>
                    </div>
                    
                    {/* Machine ID for reference */}
                    <div className="text-xs text-gray-400 font-mono">
                      ID: {machine.id.slice(0, 8)}...
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MachineManagement;
