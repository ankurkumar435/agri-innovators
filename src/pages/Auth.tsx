import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, MapPin } from 'lucide-react';

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<string>('');
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [showOtp, setShowOtp] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const [signUpData, setSignUpData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    farmName: ''
  });

  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          setCurrentLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          try {
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`
            );
            const data = await response.json();
            setLocation(`${data.city}, ${data.principalSubdivision}, ${data.countryName}`);
          } catch (error) {
            setLocation('Location not available');
          }
        },
        () => {
          setLocation('Location access denied');
        }
      );
    }
  }, []);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setSignUpData({ ...signUpData, phone: value });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (signUpData.phone.length !== 10) {
      toast({ title: 'Invalid phone number', description: 'Please enter a valid 10-digit phone number.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: signUpData.email,
        password: signUpData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            farmer_name: `${signUpData.firstName} ${signUpData.lastName}`,
            farm_name: signUpData.farmName,
            phone: signUpData.phone,
            location: location
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Store signup email for OTP verification
        setSignupEmail(signUpData.email);
        setShowOtp(true);
        setResendCooldown(60);
        // Create/update profile
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', data.user.id)
          .single();

        if (existingProfile) {
          await supabase
            .from('profiles')
            .update({
              farmer_name: `${signUpData.firstName} ${signUpData.lastName}`,
              farm_name: signUpData.farmName,
              phone: signUpData.phone,
              location: location
            })
            .eq('user_id', data.user.id);
        } else {
          await supabase
            .from('profiles')
            .insert({
              user_id: data.user.id,
              farmer_name: `${signUpData.firstName} ${signUpData.lastName}`,
              farm_name: signUpData.farmName,
              phone: signUpData.phone,
              location: location
            });
        }

        if (currentLocation) {
          await supabase
            .from('user_locations')
            .insert([{
              user_id: data.user.id,
              latitude: currentLocation.lat,
              longitude: currentLocation.lng,
              city: location.split(',')[0]?.trim() || '',
              region: location.split(',')[1]?.trim() || '',
              country: location.split(',')[2]?.trim() || ''
            }]);
        }
      }
      
      toast({ 
        title: 'OTP Sent!', 
        description: 'Please check your email for the verification code.'
      });
    } catch (error: any) {
      toast({ 
        title: 'Registration failed', 
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpValue.length !== 6) {
      toast({ title: 'Invalid OTP', description: 'Please enter the 6-digit code.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: signupEmail,
        token: otpValue,
        type: 'signup'
      });

      if (error) throw error;

      toast({ title: 'Account verified!', description: 'Welcome to Smart Farming.' });
      navigate('/');
    } catch (error: any) {
      toast({ title: 'Verification failed', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: signInData.email,
        password: signInData.password
      });

      if (error) throw error;
      
      toast({ title: 'Welcome back!' });
      navigate('/');
    } catch (error: any) {
      toast({ 
        title: 'Login failed', 
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (showOtp) {
    return (
      <div className="min-h-screen bg-gradient-nature flex flex-col">
        <div className="p-4">
          <Button 
            variant="ghost" 
            onClick={() => setShowOtp(false)}
            className="text-white hover:bg-white/20 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-primary">Verify Your Email</CardTitle>
              <CardDescription>Enter the 6-digit code sent to {signupEmail}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otpValue} onChange={setOtpValue}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button onClick={handleVerifyOtp} className="w-full" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Didn't receive the code?{' '}
                <button
                  disabled={resendCooldown > 0}
                  onClick={async () => {
                    setLoading(true);
                    try {
                      const { error } = await supabase.auth.resend({ type: 'signup', email: signupEmail });
                      if (error) throw error;
                      setResendCooldown(60);
                      toast({ title: 'OTP Resent!', description: 'Check your email for the new code.' });
                    } catch (err: any) {
                      toast({ title: 'Resend failed', description: err.message, variant: 'destructive' });
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="text-primary underline disabled:opacity-50 disabled:no-underline"
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                </button>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-nature flex flex-col">
      <div className="p-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="text-white hover:bg-white/20 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-primary">Smart Farming</CardTitle>
            <CardDescription>Join our AI-powered farming community</CardDescription>
            {location && (
              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mt-2">
                <MapPin className="w-4 h-4" />
                <span>{location}</span>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input id="signin-email" type="email" placeholder="Enter your email" value={signInData.email} onChange={(e) => setSignInData({ ...signInData, email: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input id="signin-password" type="password" placeholder="Enter your password" value={signInData.password} onChange={(e) => setSignInData({ ...signInData, password: e.target.value })} required />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={async () => {
                        if (!signInData.email) {
                          toast({ title: 'Enter your email', description: 'Please enter your email address first.', variant: 'destructive' });
                          return;
                        }
                        setLoading(true);
                        try {
                          const { error } = await supabase.auth.resetPasswordForEmail(signInData.email, {
                            redirectTo: `${window.location.origin}/reset-password`,
                          });
                          if (error) throw error;
                          toast({ title: 'Reset link sent!', description: 'Check your email for the password reset link.' });
                        } catch (err: any) {
                          toast({ title: 'Failed to send reset link', description: err.message, variant: 'destructive' });
                        } finally {
                          setLoading(false);
                        }
                      }}
                      className="text-sm text-primary underline hover:text-primary/80"
                    >
                      Forgot Password?
                    </button>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" placeholder="John" value={signUpData.firstName} onChange={(e) => setSignUpData({ ...signUpData, firstName: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Doe" value={signUpData.lastName} onChange={(e) => setSignUpData({ ...signUpData, lastName: e.target.value })} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="farmName">Farm Name</Label>
                    <Input id="farmName" placeholder="Green Valley Farm" value={signUpData.farmName} onChange={(e) => setSignUpData({ ...signUpData, farmName: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="john@gmail.com" value={signUpData.email} onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number (10 digits)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      inputMode="numeric"
                      placeholder="9876543210"
                      value={signUpData.phone}
                      onChange={handlePhoneChange}
                      maxLength={10}
                      pattern="\d{10}"
                      required
                    />
                    {signUpData.phone.length > 0 && signUpData.phone.length < 10 && (
                      <p className="text-xs text-destructive">{signUpData.phone.length}/10 digits entered</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" placeholder="Create a strong password" value={signUpData.password} onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })} required />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
