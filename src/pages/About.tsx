import React from 'react';
import { ArrowLeft, Leaf, Users, Target, Award, TrendingUp, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

const About = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const features = [
    { icon: Leaf, title: t('sustainableFarming'), description: t('sustainableDesc') },
    { icon: TrendingUp, title: t('increasedYield'), description: t('increasedYieldDesc') },
    { icon: Shield, title: t('riskManagement'), description: t('riskManagementDesc') },
  ];

  const team = [
    { name: 'Ankur Kumar', role: 'Agricultural Scientist', description: 'Leading expert in sustainable farming practices with 15+ years of experience.' },
    { name: 'Anchal Gupta', role: 'AI Technology Lead', description: 'Specializing in machine learning applications for agricultural optimization.' },
    { name: 'Shanvi Kesherwani', role: 'Field Operations Manager', description: 'Coordinating field testing and farmer feedback integration.' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-nature text-white p-4">
        <div className="flex items-center gap-3 mb-2">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-white hover:bg-white/20">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl font-bold">{t('aboutSmartFarm')}</h1>
        </div>
        <p className="text-sm opacity-90">{t('aboutTagline')}</p>
      </div>

      <div className="p-4 space-y-6">
        <Card className="p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-nature rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-3">{t('ourMission')}</h2>
            <p className="text-muted-foreground leading-relaxed">{t('missionText')}</p>
          </div>
        </Card>

        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">{t('whatWeOffer')}</h2>
          <div className="space-y-3">
            {features.map((feature, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-nature-primary rounded-full flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 text-center">{t('ourImpact')}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-nature-primary">10,000+</div>
              <div className="text-sm text-muted-foreground">{t('farmersServed')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-nature-secondary">25%</div>
              <div className="text-sm text-muted-foreground">{t('avgYieldIncrease')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-earth">50+</div>
              <div className="text-sm text-muted-foreground">{t('countries')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-sky">95%</div>
              <div className="text-sm text-muted-foreground">{t('satisfactionRate')}</div>
            </div>
          </div>
        </Card>

        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">{t('meetOurTeam')}</h2>
          <div className="space-y-3">
            {team.map((member, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gradient-earth rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{member.name}</h3>
                    <p className="text-sm text-nature-primary font-medium mb-1">{member.role}</p>
                    <p className="text-sm text-muted-foreground">{member.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Card className="p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-earth rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-3">{t('recognition')}</h2>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>🏆 2023 AgTech Innovation Award</p>
              <p>🌟 Best Sustainable Technology Solution</p>
              <p>🎖️ Global Impact in Agriculture Recognition</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-nature text-white">
          <div className="text-center">
            <h2 className="text-lg font-bold mb-2">{t('joinRevolution')}</h2>
            <p className="text-sm opacity-90 mb-4">{t('joinRevolutionText')}</p>
            <Button variant="secondary" onClick={() => navigate('/contact')} className="bg-white text-nature-primary hover:bg-white/90">
              {t('getStartedToday')}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default About;
