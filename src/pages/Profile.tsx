import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Settings, Globe, LogOut, Edit, Save, X, Lock, Mail, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import NotificationSettings from '@/components/NotificationSettings';

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { language, setLanguage, t } = useLanguage();
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState({
    farmer_name: '',
    farm_name: '',
    phone: '',
    location: ''
  });
  
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

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
        setEditData({
          farmer_name: data.farmer_name || '',
          farm_name: data.farm_name || '',
          phone: data.phone || '',
          location: data.location || ''
        });
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user?.id,
          ...editData,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setProfile({ ...profile, ...editData });
      setEditing(false);
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.'
      });
    } catch (error: any) {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

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
      // First, verify old password by signing in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email!,
        password: oldPassword
      });

      if (signInError) {
        throw new Error('Current password is incorrect');
      }

      // Update password
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-nature text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-xl font-bold">{t('profile')}</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditing(!editing)}
            className="text-white hover:bg-white/20"
          >
            {editing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Profile Information */}
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="bg-nature-primary text-white text-lg">
                {profile?.farmer_name ? getInitials(profile.farmer_name) : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-foreground">
                {profile?.farmer_name || 'User'}
              </h2>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">{t('farmerName') || 'Farmer Name'}</label>
              {editing ? (
                <Input
                  value={editData.farmer_name}
                  onChange={(e) => setEditData({...editData, farmer_name: e.target.value})}
                  placeholder={t('enterName') || 'Enter your name'}
                />
              ) : (
                <p className="text-muted-foreground mt-1">{profile?.farmer_name || t('notSet') || 'Not set'}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">{t('farmName') || 'Farm Name'}</label>
              {editing ? (
                <Input
                  value={editData.farm_name}
                  onChange={(e) => setEditData({...editData, farm_name: e.target.value})}
                  placeholder={t('enterFarmName') || 'Enter your farm name'}
                />
              ) : (
                <p className="text-muted-foreground mt-1">{profile?.farm_name || t('notSet') || 'Not set'}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">{t('phone') || 'Phone'}</label>
              {editing ? (
                <Input
                  value={editData.phone}
                  onChange={(e) => setEditData({...editData, phone: e.target.value})}
                  placeholder={t('enterPhone') || 'Enter your phone number'}
                />
              ) : (
                <p className="text-muted-foreground mt-1">{profile?.phone || t('notSet') || 'Not set'}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">{t('location') || 'Location'}</label>
              {editing ? (
                <Input
                  value={editData.location}
                  onChange={(e) => setEditData({...editData, location: e.target.value})}
                  placeholder={t('enterLocation') || 'Enter your location'}
                />
              ) : (
                <p className="text-muted-foreground mt-1">{profile?.location || t('notSet') || 'Not set'}</p>
              )}
            </div>

            {editing && (
              <Button 
                onClick={handleSave} 
                disabled={loading}
                className="w-full bg-nature-primary hover:bg-nature-primary/90"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </Button>
            )}
          </div>
        </Card>

        {/* Password Management */}
        <Card className="p-4 space-y-3">
          <h3 className="font-semibold text-foreground mb-3">{t('security') || 'Security'}</h3>
          
          {/* Change Password */}
          <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <Lock className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">{t('changePassword') || 'Change Password'}</div>
                  <p className="text-sm text-muted-foreground">{t('updatePassword') || 'Update your password using current password'}</p>
                </div>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('changePassword') || 'Change Password'}</DialogTitle>
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

          {/* Reset Password via Email */}
          <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <Mail className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">{t('resetPassword') || 'Reset Password'}</div>
                  <p className="text-sm text-muted-foreground">{t('resetViaEmail') || 'Reset password via email verification'}</p>
                </div>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('resetPassword') || 'Reset Password'}</DialogTitle>
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
        </Card>

        {/* Language Settings */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky rounded-full flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">{t('language') || 'Language'}</h3>
              <p className="text-sm text-muted-foreground">{t('chooseLanguage') || 'Choose your preferred language'}</p>
            </div>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">हिंदी</SelectItem>
                <SelectItem value="pa">ਪੰਜਾਬੀ</SelectItem>
                <SelectItem value="mr">मराठी</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Notification Settings */}
        <NotificationSettings />

        {/* Settings Options */}
        <div className="space-y-3">
          <Card className="p-4">
            <Button
              variant="ghost"
              className="w-full justify-start p-0 h-auto"
              onClick={() => navigate('/contact')}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-nature-secondary rounded-full flex items-center justify-center">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-foreground">{t('contactSupport') || 'Contact Support'}</h3>
                  <p className="text-sm text-muted-foreground">{t('getHelp') || 'Get help and support'}</p>
                </div>
              </div>
            </Button>
          </Card>

          <Card className="p-4">
            <Button
              variant="ghost"
              className="w-full justify-start p-0 h-auto"
              onClick={() => navigate('/about')}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-earth rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-foreground">{t('aboutUs') || 'About Us'}</h3>
                  <p className="text-sm text-muted-foreground">{t('learnMore') || 'Learn more about SmartFarm'}</p>
                </div>
              </div>
            </Button>
          </Card>
        </div>

        {/* Sign Out */}
        <Card className="p-4">
          <Button
            variant="ghost"
            className="w-full justify-start p-0 h-auto text-destructive hover:text-destructive"
            onClick={handleSignOut}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-destructive rounded-full flex items-center justify-center">
                <LogOut className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">{t('signOut') || 'Sign Out'}</h3>
                <p className="text-sm text-muted-foreground">{t('signOutAccount') || 'Sign out of your account'}</p>
              </div>
            </div>
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Profile;