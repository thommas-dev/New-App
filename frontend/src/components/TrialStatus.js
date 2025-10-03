import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Clock, CreditCard, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TrialStatus = () => {
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
    } finally {
      setLoading(false);
    }
  };

  if (loading || !subscriptionStatus) {
    return null;
  }

  // Don't show if user has active subscription
  if (subscriptionStatus.has_active_subscription && !subscriptionStatus.is_trial) {
    return null;
  }

  // Show trial status or upgrade prompt
  if (subscriptionStatus.is_trial) {
    const isExpiring = subscriptionStatus.trial_days_remaining <= 3;
    
    return (
      <Card className={`mb-4 ${isExpiring ? 'border-orange-200 bg-orange-50' : 'border-blue-200 bg-blue-50'}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className={`h-5 w-5 ${isExpiring ? 'text-orange-600' : 'text-blue-600'}`} />
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant={isExpiring ? "destructive" : "secondary"}>
                    Free Trial
                  </Badge>
                  <span className={`font-medium ${isExpiring ? 'text-orange-700' : 'text-blue-700'}`}>
                    {subscriptionStatus.trial_days_remaining} day{subscriptionStatus.trial_days_remaining !== 1 ? 's' : ''} remaining
                  </span>
                </div>
                <p className={`text-sm ${isExpiring ? 'text-orange-600' : 'text-blue-600'} mt-1`}>
                  {isExpiring 
                    ? 'Your trial is expiring soon. Subscribe to continue using EquipTrack.'
                    : 'Enjoy full access to all features during your trial period.'
                  }
                </p>
              </div>
            </div>
            <Button 
              size="sm" 
              onClick={() => navigate('/pricing')}
              className={isExpiring ? 'bg-orange-600 hover:bg-orange-700' : ''}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Upgrade Now
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show expired trial / no access
  return (
    <Card className="mb-4 border-red-200 bg-red-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="destructive">Trial Expired</Badge>
              </div>
              <p className="text-sm text-red-600 mt-1">
                Your trial has ended. Subscribe to regain access to EquipTrack.
              </p>
            </div>
          </div>
          <Button 
            size="sm" 
            onClick={() => navigate('/pricing')}
            className="bg-red-600 hover:bg-red-700"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Subscribe Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrialStatus;