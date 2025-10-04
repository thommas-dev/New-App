import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import DepartmentDetail from './DepartmentDetail';
import { 
  Building2, 
  Plus, 
  Trash2, 
  Calendar,
  AlertCircle 
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function DepartmentManagement({ user }) {
  const [departments, setDepartments] = useState([]);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [creating, setCreating] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${API}/departments`);
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to load departments');
    }
  };

  const fetchMachines = async () => {
    try {
      const response = await axios.get(`${API}/machines`);
      setMachines(response.data);
    } catch (error) {
      console.error('Error fetching machines:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchDepartments(), fetchMachines()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    if (!newDepartmentName.trim()) return;

    setCreating(true);
    try {
      const response = await axios.post(`${API}/departments`, {
        name: newDepartmentName.trim()
      });
      
      setDepartments([...departments, response.data]);
      setNewDepartmentName('');
      toast.success('Department created successfully!');
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to create department';
      toast.error(message);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteDepartment = async (departmentId, departmentName) => {
    if (!window.confirm(`Are you sure you want to delete "${departmentName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await axios.delete(`${API}/departments/${departmentId}`);
      setDepartments(departments.filter(dept => dept.id !== departmentId));
      toast.success('Department deleted successfully!');
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to delete department';
      toast.error(message);
    }
  };

  const getMachineCountForDepartment = (departmentId) => {
    return machines.filter(machine => machine.department_id === departmentId).length;
  };

  const handleDepartmentClick = (department) => {
    setSelectedDepartment(department);
  };

  const handleDepartmentUpdate = async (updatedDepartment) => {
    setDepartments(prevDepartments =>
      prevDepartments.map(dept =>
        dept.id === updatedDepartment.id ? updatedDepartment : dept
      )
    );
    // Refresh machines list to update counts
    await fetchMachines();
    setSelectedDepartment(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (user.role !== 'Admin') {
    return (
      <div className="flex items-center justify-center h-96">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Only administrators can manage departments.
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
    <div className="space-y-6" data-testid="department-management">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
              <Building2 className="w-6 h-6 mr-2 text-blue-600" />
              Department Management
            </h2>
            <p className="text-gray-600 mt-1">
              Organize your facility into departments for better work order tracking
            </p>
          </div>
        </div>
      </div>

      {/* Create New Department */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-gray-900">
            Create New Department
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateDepartment} className="flex space-x-3">
            <div className="flex-1">
              <Label htmlFor="department-name" className="sr-only">
                Department Name
              </Label>
              <Input
                id="department-name"
                type="text"
                placeholder="Enter department name (e.g., Production, Maintenance, Quality)"
                value={newDepartmentName}
                onChange={(e) => setNewDepartmentName(e.target.value)}
                className="bg-white border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                disabled={creating}
                data-testid="new-department-name"
              />
            </div>
            <Button 
              type="submit" 
              disabled={creating || !newDepartmentName.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
              data-testid="create-department-btn"
            >
              {creating ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </div>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Departments List */}
      {departments.length === 0 ? (
        <Card className="border-2 border-dashed border-gray-300">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Departments Yet</h3>
            <p className="text-gray-600 text-center max-w-md">
              Create your first department to start organizing your facility. 
              Departments help you categorize work orders and machines.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((department) => {
            const machineCount = getMachineCountForDepartment(department.id);
            
            return (
              <Card 
              key={department.id} 
              className="hover:shadow-lg transition-all duration-200 card-animation border-0 shadow-sm cursor-pointer"
              onClick={() => handleDepartmentClick(department)}
            >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-medium text-gray-900 flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                          <Building2 className="w-5 h-5 text-white" />
                        </div>
                        {department.name}
                      </CardTitle>
                      <p className="text-sm text-gray-500 mt-1 ml-13">
                        Created {formatDate(department.created_at)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDepartment(department.id, department.name);
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                      data-testid={`delete-department-${department.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Machine Count */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Machines</span>
                      <Badge variant="secondary" className="bg-white border">
                        {machineCount}
                      </Badge>
                    </div>
                    
                    {/* Department ID for reference */}
                    <div className="text-xs text-gray-400 font-mono">
                      ID: {department.id.slice(0, 8)}...
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Department Detail Modal */}
      {selectedDepartment && (
        <DepartmentDetail
          department={selectedDepartment}
          onClose={() => setSelectedDepartment(null)}
          onUpdate={handleDepartmentUpdate}
          user={user}
        />
      )}
    </div>
  );
}

export default DepartmentManagement;
