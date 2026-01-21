import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Lightbulb, Bug, Mountain, Cpu } from 'lucide-react';
import { UserHeader } from '@/components/UserHeader';
import { QuickActionCard } from '@/components/QuickActionCard';
import { FarmerTipsCard } from '@/components/FarmerTipsCard';
import { TodayActivities } from '@/components/TodayActivities';
import { BottomNavigation } from '@/components/BottomNavigation';
import { WeatherCard } from '@/components/WeatherCard';
import { useAuth } from '@/hooks/useAuth';
import { useLocationTracker } from '@/hooks/useLocationTracker';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import farmHero from '@/assets/farm-hero.jpg';

// Lazy load heavy components (modals and tabs only)
const ContentSection = lazy(() => import('@/components/ContentSection').then(m => ({ default: m.ContentSection })));
const SoilConditionsModal = lazy(() => import('@/components/SoilConditionsModal').then(m => ({ default: m.SoilConditionsModal })));
const CropAdvisoryModal = lazy(() => import('@/components/CropAdvisoryModal').then(m => ({ default: m.CropAdvisoryModal })));
const AIRecommendationsModal = lazy(() => import('@/components/AIRecommendationsModal').then(m => ({ default: m.AIRecommendationsModal })));

// Loading skeleton for content
const ContentSkeleton = () => (
  <div className="p-4 animate-pulse space-y-4">
    <div className="h-8 bg-muted rounded w-40"></div>
    <div className="h-32 bg-muted rounded"></div>
  </div>
);

const Index = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [showSoilModal, setShowSoilModal] = useState(false);
  const [showCropAdvisory, setShowCropAdvisory] = useState(false);
  const [showAIRecommendations, setShowAIRecommendations] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  // Start location tracking for live updates
  useLocationTracker();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded mb-4 w-48"></div>
          <div className="h-4 bg-muted rounded w-32"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const quickActions = [
    {
      icon: Lightbulb,
      title: t('cropAdvisory'),
      description: t('cropAdvisoryDesc'),
      action: () => setShowCropAdvisory(true)
    },
    {
      icon: Bug,
      title: t('pestDiseases'),
      description: t('pestDiseasesDesc'),
      action: () => setActiveTab('scan')
    },
    {
      icon: Mountain,
      title: t('soilConditions'),
      description: t('soilConditionsDesc'),
      action: () => setShowSoilModal(true)
    },
    {
      icon: Cpu,
      title: t('aiRecommendations'),
      description: t('aiRecommendationsDesc'),
      action: () => setShowAIRecommendations(true)
    }
  ];
  return (
    <div className="min-h-screen bg-background">
      <UserHeader />

      {activeTab === 'home' ? (
        <div className="p-4 space-y-6 pb-20">
          {/* Hero Section */}
          <div className="relative rounded-2xl overflow-hidden shadow-strong">
            <img 
              src={farmHero} 
              alt="Farm landscape" 
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-4 left-4 text-white">
              <h1 className="text-2xl font-bold mb-1">{t('smartFarming')}</h1>
              <p className="text-sm opacity-90">{t('aiPoweredRecommendations')}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-3">{t('quickActions')}</h2>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <QuickActionCard
                  key={action.title}
                  icon={action.icon}
                  title={action.title}
                  description={action.description}
                  onClick={action.action}
                />
              ))}
            </div>
          </div>

          {/* Weather Forecast */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-3">{t('weatherForecast')}</h2>
            <WeatherCard />
          </div>

          {/* Today's Activities */}
          <TodayActivities />

          {/* Farming Tips */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-3">{t('todaysTip')}</h2>
            <FarmerTipsCard />
          </div>
        </div>
      ) : (
        <div className="p-4">
          <Suspense fallback={<ContentSkeleton />}>
            <ContentSection activeTab={activeTab} />
          </Suspense>
        </div>
      )}

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Lazy load modals - only when opened */}
      {showSoilModal && (
        <Suspense fallback={null}>
          <SoilConditionsModal isOpen={showSoilModal} onClose={() => setShowSoilModal(false)} />
        </Suspense>
      )}
      {showCropAdvisory && (
        <Suspense fallback={null}>
          <CropAdvisoryModal isOpen={showCropAdvisory} onClose={() => setShowCropAdvisory(false)} />
        </Suspense>
      )}
      {showAIRecommendations && (
        <Suspense fallback={null}>
          <AIRecommendationsModal isOpen={showAIRecommendations} onClose={() => setShowAIRecommendations(false)} />
        </Suspense>
      )}
    </div>
  );
};

export default Index;
