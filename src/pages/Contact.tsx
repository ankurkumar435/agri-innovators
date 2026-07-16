import React, { useState } from 'react';
import { ArrowLeft, Mail, Phone, MapPin, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

const Contact = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast({ title: t('messageSent'), description: t('messageSentDesc') });
      setFormData({ name: '', email: '', subject: '', message: '' });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-nature text-white p-4">
        <div className="flex items-center gap-3 mb-2">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-white hover:bg-white/20">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl font-bold">{t('contactUsTitle')}</h1>
        </div>
        <p className="text-sm opacity-90">{t('getInTouch')}</p>
      </div>

      <div className="p-4 space-y-6">
        <div className="grid gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-nature-primary rounded-full flex items-center justify-center">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{t('email')}</h3>
                <p className="text-muted-foreground">support@smartfarm.com</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-nature-secondary rounded-full flex items-center justify-center">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{t('phone')}</h3>
                <p className="text-muted-foreground">+91 8172984454</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-earth rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{t('address')}</h3>
                <p className="text-muted-foreground">Maharishi University Of Information and Technology</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">{t('sendUsMessage')}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input name="name" placeholder={t('yourName')} value={formData.name} onChange={handleInputChange} required />
            <Input name="email" type="email" placeholder={t('yourEmail')} value={formData.email} onChange={handleInputChange} required />
            <Input name="subject" placeholder={t('subject')} value={formData.subject} onChange={handleInputChange} required />
            <Textarea name="message" placeholder={t('yourMessage')} value={formData.message} onChange={handleInputChange} rows={4} required />
            <Button type="submit" className="w-full bg-nature-primary hover:bg-nature-primary/90" disabled={loading}>
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              {t('sendMessageBtn')}
            </Button>
          </form>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold text-foreground mb-3">{t('supportHours')}</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>{t('mondayFriday')}</span>
              <span>8:00 AM - 6:00 PM</span>
            </div>
            <div className="flex justify-between">
              <span>{t('saturday')}</span>
              <span>9:00 AM - 4:00 PM</span>
            </div>
            <div className="flex justify-between">
              <span>{t('sunday')}</span>
              <span>{t('closed')}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Contact;
