import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, CheckCircle } from 'lucide-react';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    if (hashParams.get('type') === 'recovery') {
      setIsRecovery(true);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovery(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({ title: 'Passwords do not match', variant: 'destructive' });
      return;
    }

    if (password.length < 6) {
      toast({ title: 'Password too short', description: 'Must be at least 6 characters.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setSuccess(true);
      toast({ title: 'Password updated successfully!' });
      setTimeout(() => navigate('/'), 2000);
    } catch (error: any) {
      toast({ title: 'Reset failed', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-nature flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <CheckCircle className="w-16 h-16 text-primary mx-auto" />
            <h2 className="text-2xl font-bold text-primary">Password Updated!</h2>
            <p className="text-muted-foreground">Redirecting you to the app...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isRecovery) {
    return (
      <div className="min-h-screen bg-gradient-nature flex flex-col">
        <div className="p-4">
          <Button variant="ghost" onClick={() => navigate('/auth')} className="text-white hover:bg-white/20 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center">
            <CardContent className="pt-8 pb-8 space-y-4">
              <h2 className="text-xl font-bold text-primary">Invalid Reset Link</h2>
              <p className="text-muted-foreground">This link is invalid or has expired. Please request a new password reset.</p>
              <Button onClick={() => navigate('/auth')} className="w-full">Go to Login</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-nature flex flex-col">
      <div className="p-4">
        <Button variant="ghost" onClick={() => navigate('/auth')} className="text-white hover:bg-white/20 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Login
        </Button>
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-primary">Set New Password</CardTitle>
            <CardDescription>Enter your new password below</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
