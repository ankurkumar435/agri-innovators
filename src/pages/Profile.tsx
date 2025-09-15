import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Settings, Globe, LogOut, Edit, Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('en');
  const [editData, setEditData] = useState({
    farmer_name: '',
    farm_name: '',
    phone: '',
    location: ''
  });

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
            <h1 className="text-xl font-bold">Profile</h1>
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
              <label className="text-sm font-medium text-foreground">Farmer Name</label>
              {editing ? (
                <Input
                  value={editData.farmer_name}
                  onChange={(e) => setEditData({...editData, farmer_name: e.target.value})}
                  placeholder="Enter your name"
                />
              ) : (
                <p className="text-muted-foreground mt-1">{profile?.farmer_name || 'Not set'}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Farm Name</label>
              {editing ? (
                <Input
                  value={editData.farm_name}
                  onChange={(e) => setEditData({...editData, farm_name: e.target.value})}
                  placeholder="Enter your farm name"
                />
              ) : (
                <p className="text-muted-foreground mt-1">{profile?.farm_name || 'Not set'}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Phone</label>
              {editing ? (
                <Input
                  value={editData.phone}
                  onChange={(e) => setEditData({...editData, phone: e.target.value})}
                  placeholder="Enter your phone number"
                />
              ) : (
                <p className="text-muted-foreground mt-1">{profile?.phone || 'Not set'}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Location</label>
              {editing ? (
                <Input
                  value={editData.location}
                  onChange={(e) => setEditData({...editData, location: e.target.value})}
                  placeholder="Enter your location"
                />
              ) : (
                <p className="text-muted-foreground mt-1">{profile?.location || 'Not set'}</p>
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

        {/* Language Settings */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky rounded-full flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Language</h3>
              <p className="text-sm text-muted-foreground">Choose your preferred language</p>
            </div>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
                <SelectItem value="hi">हिंदी</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

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
                  <h3 className="font-semibold text-foreground">Contact Support</h3>
                  <p className="text-sm text-muted-foreground">Get help and support</p>
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
                  <h3 className="font-semibold text-foreground">About Us</h3>
                  <p className="text-sm text-muted-foreground">Learn more about SmartFarm</p>
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
                <h3 className="font-semibold">Sign Out</h3>
                <p className="text-sm text-muted-foreground">Sign out of your account</p>
              </div>
            </div>
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Profile;