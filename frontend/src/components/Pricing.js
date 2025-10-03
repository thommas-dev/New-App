import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Check, Loader2, Users } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const Pricing = () => {
  const [loading, setLoading] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [packages, setPackages] = useState({});
  const [userCount, setUserCount] = useState(1);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const { toast } = useToast();

  useEffect(() => {
    fetchSubscriptionStatus();
    fetchPackages();
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

  const fetchPackages = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/payments/packages`);
      if (response.ok) {
        const data = await response.json();
        setPackages(data);
      }
    } catch (error) {
      console.error('Failed to fetch packages:', error);
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
          origin_url: window.location.origin,
          user_count: userCount
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

  const calculatePrice = (basePrice) => {
    return (basePrice * userCount).toFixed(2);
  };

  const plans = [
    {
      id: 'starter',
      name: 'Starter Plan',
      description: 'Perfect for small teams',
      color: 'border-gray-200',
      popular: false,
      features: packages[`starter_${billingCycle}`]?.features || []
    },
    {
      id: 'professional',
      name: 'Professional Plan',
      description: 'Best for growing businesses',
      color: 'border-blue-500',
      popular: true,
      features: packages[`professional_${billingCycle}`]?.features || []
    },
    {
      id: 'enterprise',
      name: 'Enterprise Plan',
      description: 'For large organizations',
      color: 'border-purple-500',
      popular: false,
      features: packages[`enterprise_${billingCycle}`]?.features || []
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
        <p className="text-xl text-gray-600 mb-6">
          Simple, transparent per-user pricing for your maintenance management needs
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

        {/* Billing Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 rounded-lg p-1 flex">
            <Button
              variant={billingCycle === 'monthly' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setBillingCycle('monthly')}
              className="rounded-md"
            >
              Monthly
            </Button>
            <Button
              variant={billingCycle === 'yearly' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setBillingCycle('yearly')}
              className="rounded-md"
            >
              Yearly
              <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">Save 17%</Badge>
            </Button>
          </div>
        </div>

        {/* User Count Selector */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-4 bg-white rounded-lg border p-4 shadow-sm">
            <Users className="h-5 w-5 text-gray-500" />
            <div className="flex items-center gap-2">
              <Label htmlFor="user-count" className="text-sm font-medium">Number of users:</Label>
              <Input
                id="user-count"
                type="number"
                min="1"
                max="1000"
                value={userCount}
                onChange={(e) => setUserCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 text-center"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => {
          const packageKey = `${plan.id}_${billingCycle}`;
          const packageData = packages[packageKey];
          
          if (!packageData) return null;

          return (
            <Card key={plan.id} className={`relative ${plan.color} ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white">Most Popular</Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">${calculatePrice(packageData.amount)}</span>
                  <span className="text-gray-500">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
                </div>
                <div className="text-sm text-gray-600">
                  ${packageData.amount}/user/{billingCycle === 'monthly' ? 'month' : 'year'}
                </div>
                {packageData.savings && (
                  <div className="text-sm text-green-600 font-medium">
                    Save {packageData.savings}
                  </div>
                )}
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter>
                <Button 
                  className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                  onClick={() => handleSubscribe(packageKey)}
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
                    `Start ${plan.name}`
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <div className="text-center mt-12">
        <h3 className="text-xl font-semibold mb-4">Need a Custom Solution?</h3>
        <p className="text-gray-600 mb-4">
          For large organizations with specific needs, we offer custom plans with tailored features and pricing.
        </p>
        <Button variant="outline" size="lg">
          Contact Sales for Custom Quote
        </Button>
      </div>

      <div className="text-center mt-8 text-gray-600">
        <p>All plans include:</p>
        <p className="text-sm">• 14-day free trial • Cancel anytime • Secure payments powered by Stripe • 24/7 support</p>
      </div>
    </div>
  );
};

export default Pricing;