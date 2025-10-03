import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  HelpCircle,
  Book,
  Mail,
  MessageCircle,
  Settings,
  LayoutDashboard,
  Calendar,
  Clock,
  Building2,
  Wrench,
  CheckSquare,
  Printer,
  Users,
  Send,
  Phone,
  Globe
} from 'lucide-react';

function Support({ user }) {
  const [emailForm, setEmailForm] = useState({
    subject: '',
    message: '',
    priority: 'Medium'
  });
  const [sending, setSending] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    
    try {
      // In a real implementation, you'd send this to your backend
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      toast.success('Support request sent successfully! We\'ll get back to you within 24 hours.');
      setEmailForm({ subject: '', message: '', priority: 'Medium' });
    } catch (error) {
      toast.error('Failed to send support request. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const userManualSections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: Settings,
      content: [
        'Welcome to EquipTrack Pro - your complete maintenance and repair management solution.',
        'After logging in, you\'ll see the main dashboard with access to all features.',
        'Your 14-day free trial gives you full access to all premium features.'
      ]
    },
    {
      id: 'repair-work-orders',
      title: 'Repair Work Orders',
      icon: Wrench,
      content: [
        '• View repair work orders in a 4-column Kanban board: Scheduled → In Progress → Completed → On Hold',
        '• Click any work order card to view detailed information, checklists, and attachments',
        '• Drag and drop work orders between columns to update their status',
        '• Use the search and filter options to find specific work orders',
        '• Click the "New Work Order" button to create repair requests',
        '• Edit checklists by clicking on work orders and adding/removing items'
      ]
    },
    {
      id: 'maintenance-work-orders',
      title: 'Maintenance Work Orders',
      icon: Calendar,
      content: [
        '• Schedule preventive maintenance with Daily, Weekly, and Monthly frequencies',
        '• Click on maintenance type cards to view and create scheduled tasks',
        '• Each maintenance task includes checklists, instructions, and safety notes',
        '• Click on any maintenance task to edit details, checklists, and schedules',
        '• Print maintenance work orders for technicians in the field',
        '• Track completion progress with visual progress bars'
      ]
    },
    {
      id: 'calendar-view',
      title: 'Calendar & Scheduling',
      icon: Calendar,
      content: [
        '• View all scheduled maintenance and repair tasks in calendar format',
        '• Navigate between months to see future and past schedules',
        '• Click on any date to see tasks scheduled for that day',
        '• Click on task cards in the right panel to view full details',
        '• Color coding: Green for maintenance, Blue for repair work orders'
      ]
    },
    {
      id: 'daily-tasks',
      title: 'Daily Tasks Dashboard',
      icon: Clock,
      content: [
        '• See today\'s tasks with status summary: Overdue, Pending, In Progress, Completed',
        '• "Urgent & Upcoming" section shows overdue and tasks starting within 2 hours',
        '• Click on any task card to view details and make updates',
        '• Real-time clock shows current time for scheduling reference',
        '• Visual indicators for overdue tasks and upcoming deadlines'
      ]
    },
    {
      id: 'departments-machines',
      title: 'Departments & Machines',
      icon: Building2,
      content: [
        '• Organize your facility with departments (Admin only)',
        '• Add machines to each department for precise tracking',
        '• Click on department cards to see all machines in that department',
        '• Click on machine cards to view specifications, notes, and maintenance history',
        '• Upload manuals, diagrams, and documentation for each machine',
        '• Create machine-specific maintenance checklists'
      ]
    },
    {
      id: 'checklists-printing',
      title: 'Checklists & Printing',
      icon: CheckSquare,
      content: [
        '• Create detailed checklists for both maintenance and repair tasks',
        '• Check off completed items with real-time progress tracking',
        '• Add or remove checklist items as needed',
        '• Print professional work orders with checklists for field technicians',
        '• Printed orders include signature lines and space for notes',
        '• All checklists show completion percentages on cards'
      ]
    },
    {
      id: 'user-roles',
      title: 'User Roles & Permissions',
      icon: Users,
      content: [
        '• Admin: Full access to create departments, machines, and all work orders',
        '• Maintenance Supervisor: Can create and manage work orders and maintenance tasks',
        '• Both roles can print work orders and manage daily operations',
        '• Role-based menu items ensure users see only relevant features'
      ]
    }
  ];

  const quickTips = [
    { tip: 'Use drag & drop to quickly update work order status', icon: LayoutDashboard },
    { tip: 'Click on any card throughout the system for detailed views', icon: MessageCircle },
    { tip: 'Use the print function to create field-ready work orders', icon: Printer },
    { tip: 'Set up departments and machines first for better organization', icon: Building2 },
    { tip: 'Check the Daily Tasks page every morning for today\'s priorities', icon: Clock }
  ];

  return (
    <div className="space-y-6" data-testid="support-page">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
              <HelpCircle className="w-6 h-6 mr-2 text-blue-600" />
              Support & Help Center
            </h2>
            <p className="text-gray-600 mt-1">
              User manual, quick tips, and developer support for EquipTrack Pro
            </p>
          </div>
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            Version 1.0
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="manual" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="manual" className="flex items-center space-x-2">
            <Book className="w-4 h-4" />
            <span>User Manual</span>
          </TabsTrigger>
          <TabsTrigger value="tips" className="flex items-center space-x-2">
            <MessageCircle className="w-4 h-4" />
            <span>Quick Tips</span>
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center space-x-2">
            <Mail className="w-4 h-4" />
            <span>Contact Developer</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Book className="w-5 h-5 mr-2 text-green-600" />
                EquipTrack Pro User Manual
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {userManualSections.map((section) => {
                const Icon = section.icon;
                return (
                  <div key={section.id} className="space-y-3">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <Icon className="w-5 h-5 mr-2 text-blue-600" />
                      {section.title}
                    </h3>
                    <div className="pl-7 space-y-2">
                      {section.content.map((item, index) => (
                        <p key={index} className="text-gray-700 text-sm leading-relaxed">
                          {item}
                        </p>
                      ))}
                    </div>
                    {section.id !== userManualSections[userManualSections.length - 1].id && (
                      <Separator className="mt-4" />
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tips" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <MessageCircle className="w-5 h-5 mr-2 text-orange-600" />
                Quick Tips & Best Practices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickTips.map((tip, index) => {
                  const Icon = tip.icon;
                  return (
                    <div key={index} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-blue-600" />
                        </div>
                        <p className="text-sm text-gray-800 leading-relaxed">{tip.tip}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <h4 className="text-lg font-medium text-green-900 mb-3">Pro Tip: Workflow Optimization</h4>
                <p className="text-green-800 text-sm leading-relaxed mb-3">
                  For maximum efficiency, start each day by checking the Daily Tasks page, then use the Calendar 
                  view to plan your week. Create maintenance schedules during low-activity periods and always 
                  keep machine documentation updated for faster troubleshooting.
                </p>
                <div className="flex items-center space-x-2 text-xs text-green-700">
                  <CheckSquare className="w-3 h-3" />
                  <span>Recommended daily workflow</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact Form */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Mail className="w-5 h-5 mr-2 text-red-600" />
                  Contact Developer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="email-subject">Subject *</Label>
                    <Input
                      id="email-subject"
                      type="text"
                      placeholder="Brief description of your issue or request"
                      value={emailForm.subject}
                      onChange={(e) => setEmailForm(prev => ({ ...prev, subject: e.target.value }))}
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email-priority">Priority</Label>
                    <select
                      id="email-priority"
                      value={emailForm.priority}
                      onChange={(e) => setEmailForm(prev => ({ ...prev, priority: e.target.value }))}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Low">Low - General question</option>
                      <option value="Medium">Medium - Feature request</option>
                      <option value="High">High - Bug report</option>
                      <option value="Critical">Critical - System down</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="email-message">Message *</Label>
                    <Textarea
                      id="email-message"
                      placeholder="Please describe your issue, question, or feedback in detail. Include steps to reproduce if reporting a bug."
                      value={emailForm.message}
                      onChange={(e) => setEmailForm(prev => ({ ...prev, message: e.target.value }))}
                      required
                      rows={6}
                      className="mt-1"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={sending || !emailForm.subject.trim() || !emailForm.message.trim()}
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                  >
                    {sending ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Sending...</span>
                      </div>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Support Request
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Developer Info */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Globe className="w-5 h-5 mr-2 text-purple-600" />
                  Developer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-medium text-purple-900 mb-2">Response Times</h4>
                    <div className="space-y-2 text-sm text-purple-800">
                      <div className="flex justify-between">
                        <span>Critical Issues:</span>
                        <span className="font-medium">Within 4 hours</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Bug Reports:</span>
                        <span className="font-medium">Within 24 hours</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Feature Requests:</span>
                        <span className="font-medium">Within 48 hours</span>
                      </div>
                      <div className="flex justify-between">
                        <span>General Questions:</span>
                        <span className="font-medium">Within 3 business days</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">What to Include</h4>
                    <ul className="space-y-1 text-sm text-blue-800">
                      <li>• Your username and role (Admin/Supervisor)</li>
                      <li>• Browser and device information</li>
                      <li>• Steps to reproduce the issue</li>
                      <li>• Screenshots if applicable</li>
                      <li>• Expected vs. actual behavior</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-900 mb-2">Contact Information</h4>
                    <div className="space-y-2 text-sm text-green-800">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4" />
                        <span>support@equiptrack.pro</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4" />
                        <span>+1 (555) 123-4567</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>Mon-Fri, 9AM-6PM EST</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">
                    EquipTrack Pro is actively developed and maintained
                  </p>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    Last updated: October 2025
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Support;