import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState('checking'); // checking, success, error
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      checkPaymentStatus(sessionId);
    } else {
      setStatus('error');
    }
  }, [searchParams]);

  const checkPaymentStatus = async (sessionId, attempts = 0) => {
    const maxAttempts = 5;
    
    if (attempts >= maxAttempts) {
      setStatus('error');
      toast({
        title: "Payment Verification Timeout",
        description: "Unable to verify payment. Please contact support if you were charged.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/payments/status/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.payment_status === 'paid') {
          setStatus('success');
          setPaymentDetails(data);
        } else if (data.status === 'expired') {
          setStatus('error');
          toast({
            title: "Payment Session Expired",
            description: "Your payment session has expired. Please try again.",
            variant: "destructive",
          });
        } else {
          // Payment still processing, continue polling
          setTimeout(() => checkPaymentStatus(sessionId, attempts + 1), 2000);
        }
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      if (attempts < maxAttempts - 1) {
        setTimeout(() => checkPaymentStatus(sessionId, attempts + 1), 2000);
      } else {
        setStatus('error');
      }
    }
  };

  const handleContinue = () => {
    navigate('/dashboard');
  };

  if (status === 'checking') {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <Loader2 className="h-16 w-16 animate-spin text-blue-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Verifying Your Payment</h2>
              <p className="text-gray-600">
                Please wait while we confirm your payment with our payment processor...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <CardTitle className="text-2xl text-green-700">Payment Successful!</CardTitle>
              <CardDescription>
                Thank you for subscribing to EquipTrack
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {paymentDetails && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold mb-2">Payment Details</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Amount:</span>
                      <span>${(paymentDetails.amount_total / 100).toFixed(2)} {paymentDetails.currency.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="capitalize text-green-600">{paymentDetails.payment_status}</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="text-center">
                <Button onClick={handleContinue} className="w-full">
                  Continue to Dashboard
                </Button>
              </div>
              
              <p className="text-sm text-gray-600 text-center mt-4">
                A confirmation email has been sent to your registered email address.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-2xl text-red-700">Payment Error</CardTitle>
            <CardDescription>
              There was an issue with your payment
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 mb-6">
              Your payment could not be processed or verified. If you believe this is an error, 
              please contact our support team.
            </p>
            
            <div className="space-y-3">
              <Button onClick={() => navigate('/pricing')} className="w-full">
                Try Again
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard')} 
                className="w-full"
              >
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentSuccess;