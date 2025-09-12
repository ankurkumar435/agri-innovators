import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface QuickActionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({
  icon: Icon,
  title,
  description,
  onClick
}) => {
  return (
    <Card 
      className="p-4 cursor-pointer transition-all duration-200 hover:shadow-medium hover:scale-105 bg-gradient-nature border-0 text-white"
      onClick={onClick}
    >
      <div className="flex flex-col items-center text-center space-y-2">
        <Icon className="w-8 h-8 text-white" />
        <h3 className="font-semibold text-sm">{title}</h3>
        <p className="text-xs opacity-90 leading-tight">{description}</p>
      </div>
    </Card>
  );
};