import React, { useState } from 'react';
import { Menu, LogOut, LogIn, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const AuthDropdown: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
          <Menu className="w-6 h-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-background border border-border">
        {user ? (
          <>
            <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
              <User className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/about')} className="cursor-pointer">
              About Us
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/contact')} className="cursor-pointer">
              Contact Us
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem onClick={() => navigate('/auth')} className="cursor-pointer">
              <LogIn className="w-4 h-4 mr-2" />
              Login
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/about')} className="cursor-pointer">
              About Us
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/contact')} className="cursor-pointer">
              Contact Us
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};