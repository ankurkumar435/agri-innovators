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
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, MapPin } from 'lucide-react';
import { FieldMapPicker } from '@/components/FieldMapPicker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { COMMON_CROPS, GROWTH_STAGES, computeCentroid, computePolygonAreaAcres } from '@/hooks/useFarmerFields';

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<string>('');
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [showOtp, setShowOtp] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showFieldSetup, setShowFieldSetup] = useState(false);
  const [fieldPolygon, setFieldPolygon] = useState<{ lat: number; lng: number }[]>([]);
  const [fieldName, setFieldName] = useState('');
  const [fieldCrop, setFieldCrop] = useState('');
  const [fieldStage, setFieldStage] = useState('');
  const [fieldSowingDate, setFieldSowingDate] = useState('');
  const [fieldHarvestDate, setFieldHarvestDate] = useState('');
  const [fieldNotes, setFieldNotes] = useState('');

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
    if (user && !showFieldSetup && !showOtp) {
      navigate('/');
    }
  }, [user, navigate, showFieldSetup, showOtp]);

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
            setLocation(t('locationNotSet'));
          }
        },
        () => {
          setLocation(t('locationNotSet'));
        }
      );
    }
  }, [t]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setSignUpData({ ...signUpData, phone: value });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (signUpData.phone.length !== 10) {
      toast({ title: t('invalidPhone'), description: t('invalidPhoneDesc'), variant: 'destructive' });
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
        setSignupEmail(signUpData.email);
        setShowOtp(true);
        setResendCooldown(60);
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
      
      toast({ title: t('otpSent'), description: t('otpSentDesc') });
    } catch (error: any) {
      toast({ title: t('registrationFailed'), description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpValue.length !== 6) {
      toast({ title: t('invalidOtp'), description: t('invalidOtpDesc'), variant: 'destructive' });
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

      toast({ title: t('accountVerified'), description: t('welcomeSmartFarming') });
      setShowOtp(false);
      setShowFieldSetup(true);
    } catch (error: any) {
      toast({ title: t('verificationFailed'), description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveField = async () => {
    if (!user) {
      toast({ title: 'Please wait', description: 'Finalizing your account…' });
      return;
    }
    if (fieldPolygon.length < 3) {
      toast({ title: 'Draw your field', description: 'Outline your field on the satellite map before saving.', variant: 'destructive' });
      return;
    }
    if (!fieldName.trim()) {
      toast({ title: 'Enter a field name', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const center = computeCentroid(fieldPolygon);
      const area = computePolygonAreaAcres(fieldPolygon);
      const { error } = await supabase.from('farmer_fields').insert({
        user_id: user.id,
        name: fieldName.trim(),
        polygon: fieldPolygon as any,
        area_acres: Number(area.toFixed(3)),
        center_lat: center.lat,
        center_lng: center.lng,
        crop: fieldCrop || null,
        growth_stage: fieldStage || null,
        sowing_date: fieldSowingDate || null,
        expected_harvest_date: fieldHarvestDate || null,
        notes: fieldNotes || null,
      });
      if (error) throw error;
      toast({ title: 'Field saved', description: 'Recommendations will now be tailored to your field.' });
      setShowFieldSetup(false);
      navigate('/');
    } catch (err: any) {
      toast({ title: 'Could not save field', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const skipFieldSetup = () => {
    setShowFieldSetup(false);
    navigate('/');
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
      
      toast({ title: t('welcomeBack') });
      navigate('/');
    } catch (error: any) {
      toast({ title: t('loginFailed'), description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (showFieldSetup) {
    const area = computePolygonAreaAcres(fieldPolygon);
    return (
      <div className="min-h-screen bg-gradient-nature flex flex-col">
        <div className="p-4 flex items-center justify-between">
          <h2 className="text-white font-semibold">Map your field</h2>
          <Button variant="ghost" onClick={skipFieldSetup} className="text-white hover:bg-white/20">
            Skip for now
          </Button>
        </div>
        <div className="flex-1 flex items-start justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="text-xl text-primary">Outline your field on the satellite map</CardTitle>
              <CardDescription>
                This lets us tailor soil analysis, weather alerts, pest warnings and AI recommendations to your exact field, crop and growth stage.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FieldMapPicker onChange={setFieldPolygon} />

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1">
                  <Label>Field name</Label>
                  <Input value={fieldName} onChange={(e) => setFieldName(e.target.value)} placeholder="e.g. North field" />
                </div>
                <div className="space-y-1">
                  <Label>Crop</Label>
                  <Select value={fieldCrop} onValueChange={setFieldCrop}>
                    <SelectTrigger><SelectValue placeholder="Select crop" /></SelectTrigger>
                    <SelectContent>
                      {COMMON_CROPS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Growth stage</Label>
                  <Select value={fieldStage} onValueChange={setFieldStage}>
                    <SelectTrigger><SelectValue placeholder="Select stage" /></SelectTrigger>
                    <SelectContent>
                      {GROWTH_STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Sowing date</Label>
                  <Input type="date" value={fieldSowingDate} onChange={(e) => setFieldSowingDate(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Expected harvest</Label>
                  <Input type="date" value={fieldHarvestDate} onChange={(e) => setFieldHarvestDate(e.target.value)} />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label>Notes (optional)</Label>
                  <Textarea rows={2} value={fieldNotes} onChange={(e) => setFieldNotes(e.target.value)} />
                </div>
                <div className="col-span-2 flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm text-muted-foreground">Calculated area</span>
                  <span className="font-semibold">{area.toFixed(2)} acres</span>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="ghost" onClick={skipFieldSetup}>Skip</Button>
                <Button onClick={handleSaveField} disabled={loading}>
                  {loading ? 'Saving…' : 'Save field & continue'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
            {t('back')}
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-primary">{t('verifyEmail')}</CardTitle>
              <CardDescription>{t('enterOtpSent')} {signupEmail}</CardDescription>
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
                {loading ? t('verifying') : t('verifyAndContinue')}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                {t('didntReceiveCode')}{' '}
                <button
                  disabled={resendCooldown > 0}
                  onClick={async () => {
                    setLoading(true);
                    try {
                      const { error } = await supabase.auth.resend({ type: 'signup', email: signupEmail });
                      if (error) throw error;
                      setResendCooldown(60);
                      toast({ title: t('otpResent'), description: t('otpResentDesc') });
                    } catch (err: any) {
                      toast({ title: t('resendFailedTitle'), description: err.message, variant: 'destructive' });
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="text-primary underline disabled:opacity-50 disabled:no-underline"
                >
                  {resendCooldown > 0 ? `${t('resendIn')} ${resendCooldown}s` : t('resendOtp')}
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
          {t('backToHome')}
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-primary">{t('smartFarming')}</CardTitle>
            <CardDescription>{t('joinCommunity')}</CardDescription>
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
                <TabsTrigger value="signin">{t('signIn')}</TabsTrigger>
                <TabsTrigger value="signup">{t('signUp')}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">{t('email')}</Label>
                    <Input id="signin-email" type="email" placeholder={t('enterEmail')} value={signInData.email} onChange={(e) => setSignInData({ ...signInData, email: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">{t('password')}</Label>
                    <Input id="signin-password" type="password" placeholder={t('enterPassword')} value={signInData.password} onChange={(e) => setSignInData({ ...signInData, password: e.target.value })} required />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? t('signingIn') : t('signIn')}
                  </Button>
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={async () => {
                        if (!signInData.email) {
                          toast({ title: t('enterEmailFirst'), description: t('enterEmailFirstDesc'), variant: 'destructive' });
                          return;
                        }
                        setLoading(true);
                        try {
                          const { error } = await supabase.auth.resetPasswordForEmail(signInData.email, {
                            redirectTo: `${window.location.origin}/reset-password`,
                          });
                          if (error) throw error;
                          toast({ title: t('resetLinkSent'), description: t('resetLinkSentDesc') });
                        } catch (err: any) {
                          toast({ title: t('resetLinkFailed'), description: err.message, variant: 'destructive' });
                        } finally {
                          setLoading(false);
                        }
                      }}
                      className="text-sm text-primary underline hover:text-primary/80"
                    >
                      {t('forgotPassword')}
                    </button>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">{t('firstName')}</Label>
                      <Input id="firstName" placeholder={t('enterFirstName')} value={signUpData.firstName} onChange={(e) => setSignUpData({ ...signUpData, firstName: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">{t('lastName')}</Label>
                      <Input id="lastName" placeholder={t('enterLastName')} value={signUpData.lastName} onChange={(e) => setSignUpData({ ...signUpData, lastName: e.target.value })} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="farmName">{t('farmName')}</Label>
                    <Input id="farmName" placeholder={t('enterFarmName')} value={signUpData.farmName} onChange={(e) => setSignUpData({ ...signUpData, farmName: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('email')}</Label>
                    <Input id="email" type="email" placeholder={t('enterEmailAddress')} value={signUpData.email} onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t('phoneNumberLabel')}</Label>
                    <Input
                      id="phone"
                      type="tel"
                      inputMode="numeric"
                      placeholder={t('enterPhone10')}
                      value={signUpData.phone}
                      onChange={handlePhoneChange}
                      maxLength={10}
                      pattern="\d{10}"
                      required
                    />
                    {signUpData.phone.length > 0 && signUpData.phone.length < 10 && (
                      <p className="text-xs text-destructive">{signUpData.phone.length}/10 {t('digitsEntered')}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">{t('password')}</Label>
                    <Input id="password" type="password" placeholder={t('enterStrongPassword')} value={signUpData.password} onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })} required />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? t('creatingAccount') : t('createAccount')}
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
