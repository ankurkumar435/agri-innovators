import React from 'react';
import { MapPin, Clock, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface FarmerTripCardProps {
  title: string;
  location: string;
  time: string;
  status: 'completed' | 'pending' | 'active';
  description: string;
}

export const FarmerTripCard: React.FC<FarmerTripCardProps> = ({
  title,
  location,
  time,
  status,
  description
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'completed': return 'text-success';
      case 'active': return 'text-warning';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'active': return Clock;
      default: return Clock;
    }
  };

  const StatusIcon = getStatusIcon();

  return (
    <Card className="p-4 bg-card border border-border rounded-2xl shadow-soft hover:shadow-medium transition-all duration-200">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-semibold text-foreground">{title}</h4>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <MapPin className="w-4 h-4" />
              <span>{location}</span>
            </div>
          </div>
          <StatusIcon className={`w-5 h-5 ${getStatusColor()}`} />
        </div>
        
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{time}</span>
        </div>
      </div>
    </Card>
  );
};