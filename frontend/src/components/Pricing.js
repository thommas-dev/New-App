import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Check, Loader2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const Pricing = () => {
  const [loading, setLoading] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/subscription/status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const status = await response.json();
        setSubscriptionStatus(status);
      }
    } catch (error) {
      console.error('Failed to fetch subscription status:', error);
    }
  };

  const handleSubscribe = async (packageId) => {
    if (loading) return;
    
    setLoading(true);
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/payments/create-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          package_id: packageId,
          origin_url: window.location.origin
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect to Stripe Checkout
        window.location.href = data.checkout_url;
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.detail || "Failed to initiate payment",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Error",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const features = [
    'Unlimited Work Orders',
    'Kanban Board Management',
    'Department & Machine Management',
    'Calendar & Daily Tasks View',
    'Preventive Maintenance Scheduling',
    'Checklist Management',
    'Print Functionality',
    'User Role Management',
    'Email Support'
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
        <p className="text-xl text-gray-600 mb-6">
          Simple, transparent pricing for your maintenance management needs
        </p>
        
        {subscriptionStatus?.is_trial && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 inline-block">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Free Trial</Badge>
              <span className="text-blue-700 font-medium">
                {subscriptionStatus.trial_days_remaining} days remaining
              </span>
            </div>
          </div>
        )}
        
        {subscriptionStatus?.has_active_subscription && !subscriptionStatus?.is_trial && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 inline-block">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-green-600">Active Subscription</Badge>
              <span className="text-green-700 font-medium">
                {subscriptionStatus.subscription_type}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Monthly Plan */}
        <Card className="relative">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Monthly Plan</CardTitle>
            <CardDescription>Perfect for getting started</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">$29.99</span>
              <span className="text-gray-500">/month</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => handleSubscribe('monthly')}
              disabled={loading || (subscriptionStatus?.has_active_subscription && !subscriptionStatus?.is_trial)}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : subscriptionStatus?.has_active_subscription && !subscriptionStatus?.is_trial ? (
                'Current Plan'
              ) : (
                'Subscribe Monthly'
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Yearly Plan */}
        <Card className="relative border-2 border-blue-500">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-blue-500 text-white">Most Popular</Badge>
          </div>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Yearly Plan</CardTitle>
            <CardDescription>Best value - Save 16%</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">$299.99</span>
              <span className="text-gray-500">/year</span>
            </div>
            <div className="text-sm text-green-600 font-medium">
              Save $59.89 compared to monthly
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700" 
              onClick={() => handleSubscribe('yearly')}
              disabled={loading || (subscriptionStatus?.has_active_subscription && !subscriptionStatus?.is_trial)}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : subscriptionStatus?.has_active_subscription && !subscriptionStatus?.is_trial ? (
                'Current Plan'
              ) : (
                'Subscribe Yearly'
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="text-center mt-8 text-gray-600">
        <p>All plans include:</p>
        <p className="text-sm">• 14-day free trial • Cancel anytime • Secure payments powered by Stripe</p>
      </div>
    </div>
  );
};

export default Pricing;