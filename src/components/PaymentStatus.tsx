import { Badge } from '@/components/ui/badge';
import { CreditCard, Smartphone, Wallet, Banknote, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface PaymentStatusProps {
  method: 'cash' | 'card' | 'upi' | 'netbanking' | 'wallet' | 'razorpay';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  className?: string;
}

export function PaymentStatus({ method, status, className = '' }: PaymentStatusProps) {
  const getMethodIcon = () => {
    switch (method) {
      case 'razorpay':
        return <CreditCard className="h-3 w-3" />;
      case 'upi':
        return <Smartphone className="h-3 w-3" />;
      case 'wallet':
        return <Wallet className="h-3 w-3" />;
      case 'card':
        return <CreditCard className="h-3 w-3" />;
      case 'netbanking':
        return <Banknote className="h-3 w-3" />;
      default:
        return <Banknote className="h-3 w-3" />;
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-3 w-3 text-green-600" />;
      case 'failed':
        return <XCircle className="h-3 w-3 text-red-600" />;
      case 'pending':
        return <Clock className="h-3 w-3 text-yellow-600" />;
      case 'cancelled':
        return <AlertCircle className="h-3 w-3 text-gray-600" />;
      default:
        return null;
    }
  };

  const getMethodLabel = () => {
    switch (method) {
      case 'razorpay':
        return 'Online';
      case 'netbanking':
        return 'Net Banking';
      default:
        return method.charAt(0).toUpperCase() + method.slice(1);
    }
  };

  const getStatusVariant = () => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'pending':
        return 'secondary';
      case 'cancelled':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <Badge variant={getStatusVariant()} className="flex items-center space-x-1">
        {getMethodIcon()}
        <span>{getMethodLabel()}</span>
        {getStatusIcon()}
      </Badge>
    </div>
  );
}
