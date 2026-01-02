import React, { useState } from 'react';
import { Menu, LogOut, LogIn, User, Lock, Mail, Key, Globe, Headphones, Info, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const AuthDropdown: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const { toast } = useToast();
  
  // Password change states
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  // Password reset states
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetEmail, setResetEmail] = useState(user?.email || '');
  const [resetLoading, setResetLoading] = useState(false);
  
  // Language dialog
  const [showLanguageDialog, setShowLanguageDialog] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast({
        title: 'Error',
        description: 'Please fill in all password fields',
        variant: 'destructive'
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'New passwords do not match',
        variant: 'destructive'
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters',
        variant: 'destructive'
      });
      return;
    }

    setPasswordLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email!,
        password: oldPassword
      });

      if (signInError) {
        throw new Error('Current password is incorrect');
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      toast({
        title: 'Success',
        description: 'Password updated successfully'
      });
      
      setShowPasswordDialog(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail) {
      toast({
        title: 'Error',
        description: 'Please enter your email',
        variant: 'destructive'
      });
      return;
    }

    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth`
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Password reset email sent. Please check your inbox.'
      });
      
      setShowResetDialog(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setResetLoading(false);
    }
  };

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang as any);
    toast({
      title: t('language') || 'Language',
      description: `Language changed to ${newLang === 'en' ? 'English' : newLang === 'hi' ? 'हिंदी' : newLang === 'pa' ? 'ਪੰਜਾਬੀ' : 'मराठी'}`
    });
  };

  const languageLabel = language === 'en' ? 'English' : language === 'hi' ? 'हिंदी' : language === 'pa' ? 'ਪੰਜਾਬੀ' : 'मराठी';

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
            <Menu className="w-6 h-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-background border border-border z-50">
          {user ? (
            <>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.email?.split('@')[0]}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                <User className="w-4 h-4 mr-2" />
                {t('profile') || 'Profile'}
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-muted-foreground">{t('security') || 'Security'}</DropdownMenuLabel>
              
              <DropdownMenuItem onClick={() => setShowPasswordDialog(true)} className="cursor-pointer">
                <Lock className="w-4 h-4 mr-2" />
                {t('changePassword') || 'Change Password'}
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => setShowResetDialog(true)} className="cursor-pointer">
                <Mail className="w-4 h-4 mr-2" />
                {t('resetPassword') || 'Reset Password'}
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-muted-foreground">{t('settings') || 'Settings'}</DropdownMenuLabel>
              
              <DropdownMenuItem onClick={() => setShowLanguageDialog(true)} className="cursor-pointer">
                <Globe className="w-4 h-4 mr-2" />
                <span className="flex-1">{t('language') || 'Language'}</span>
                <span className="text-xs text-muted-foreground">{languageLabel}</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={() => navigate('/contact')} className="cursor-pointer">
                <Headphones className="w-4 h-4 mr-2" />
                {t('contactSupport') || 'Contact Support'}
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => navigate('/about')} className="cursor-pointer">
                <Info className="w-4 h-4 mr-2" />
                {t('aboutUs') || 'About Us'}
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                {t('signOut') || 'Logout'}
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => {
                  signOut();
                  navigate('/auth');
                }} 
                className="cursor-pointer"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Login to Another Account
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem onClick={() => navigate('/auth')} className="cursor-pointer">
                <LogIn className="w-4 h-4 mr-2" />
                {t('signIn') || 'Login'}
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={() => setShowLanguageDialog(true)} className="cursor-pointer">
                <Globe className="w-4 h-4 mr-2" />
                <span className="flex-1">{t('language') || 'Language'}</span>
                <span className="text-xs text-muted-foreground">{languageLabel}</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={() => navigate('/about')} className="cursor-pointer">
                <Info className="w-4 h-4 mr-2" />
                {t('aboutUs') || 'About Us'}
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => navigate('/contact')} className="cursor-pointer">
                <Headphones className="w-4 h-4 mr-2" />
                {t('contactSupport') || 'Contact Support'}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              {t('changePassword') || 'Change Password'}
            </DialogTitle>
            <DialogDescription>
              {t('enterCurrentNew') || 'Enter your current password and new password'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium">{t('currentPassword') || 'Current Password'}</label>
              <Input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder={t('enterCurrent') || 'Enter current password'}
              />
            </div>
            <div>
              <label className="text-sm font-medium">{t('newPassword') || 'New Password'}</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t('enterNew') || 'Enter new password (min 6 characters)'}
              />
            </div>
            <div>
              <label className="text-sm font-medium">{t('confirmPassword') || 'Confirm New Password'}</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('confirmNew') || 'Confirm new password'}
              />
            </div>
            <Button 
              onClick={handleChangePassword} 
              disabled={passwordLoading}
              className="w-full bg-nature-primary hover:bg-nature-primary/90"
            >
              {passwordLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Key className="w-4 h-4 mr-2" />
              )}
              {t('updatePassword') || 'Update Password'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              {t('resetPassword') || 'Reset Password'}
            </DialogTitle>
            <DialogDescription>
              {t('sendResetEmail') || 'We will send a password reset link to your email'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium">{t('email') || 'Email'}</label>
              <Input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder={t('enterEmail') || 'Enter your email'}
              />
            </div>
            <Button 
              onClick={handleResetPassword} 
              disabled={resetLoading}
              className="w-full bg-nature-primary hover:bg-nature-primary/90"
            >
              {resetLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Mail className="w-4 h-4 mr-2" />
              )}
              {t('sendResetLink') || 'Send Reset Link'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Language Selection Dialog */}
      <Dialog open={showLanguageDialog} onOpenChange={setShowLanguageDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              {t('language') || 'Language'}
            </DialogTitle>
            <DialogDescription>
              {t('chooseLanguage') || 'Choose your preferred language'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Select value={language} onValueChange={(value) => {
              handleLanguageChange(value);
              setShowLanguageDialog(false);
            }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">
                  <div className="flex items-center gap-2">
                    <span>🇬🇧</span>
                    <span>English</span>
                  </div>
                </SelectItem>
                <SelectItem value="hi">
                  <div className="flex items-center gap-2">
                    <span>🇮🇳</span>
                    <span>हिंदी (Hindi)</span>
                  </div>
                </SelectItem>
                <SelectItem value="pa">
                  <div className="flex items-center gap-2">
                    <span>🇮🇳</span>
                    <span>ਪੰਜਾਬੀ (Punjabi)</span>
                  </div>
                </SelectItem>
                <SelectItem value="mr">
                  <div className="flex items-center gap-2">
                    <span>🇮🇳</span>
                    <span>मराठी (Marathi)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};