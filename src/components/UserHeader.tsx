import React from 'react';
import { MapPin, Bell, Menu } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserHeaderProps {
  userName: string;
  phoneNumber: string;
  location: string;
  avatarUrl?: string;
}

export const UserHeader: React.FC<UserHeaderProps> = ({
  userName,
  phoneNumber,
  location,
  avatarUrl
}) => {
  return (
    <div className="bg-gradient-nature text-white p-4 rounded-b-3xl shadow-medium">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12 border-2 border-white/20">
            <AvatarImage src={avatarUrl} alt={userName} />
            <AvatarFallback className="bg-white/20 text-white font-semibold">
              {userName.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex flex-col">
            <h2 className="font-semibold text-lg">{userName}</h2>
            <p className="text-sm opacity-90">{phoneNumber}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Bell className="w-6 h-6 opacity-80" />
          <Menu className="w-6 h-6 opacity-80" />
        </div>
      </div>
      
      <div className="flex items-center gap-1 mt-3 text-sm opacity-90">
        <MapPin className="w-4 h-4" />
        <span>{location}</span>
      </div>
    </div>
  );
};