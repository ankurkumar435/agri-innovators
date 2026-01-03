import React, { useState } from 'react';
import { Menu, LogOut, LogIn, User, Globe, Headphones, Info, UserPlus } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';

export const AuthDropdown: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const { toast } = useToast();
  
  // Language dialog
  const [showLanguageDialog, setShowLanguageDialog] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
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