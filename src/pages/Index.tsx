import React, { useState, useEffect } from 'react';
import { Lightbulb, Bug, Mountain, Cpu, MessageCircle } from 'lucide-react';
import { UserHeader } from '@/components/UserHeader';
import { QuickActionCard } from '@/components/QuickActionCard';
import { WeatherCard } from '@/components/WeatherCard';
import { FarmerTripCard } from '@/components/FarmerTripCard';
import { SoilConditionsModal } from '@/components/SoilConditionsModal';
import { CropAdvisoryModal } from '@/components/CropAdvisoryModal';
import { AIRecommendationsModal } from '@/components/AIRecommendationsModal';
import { BottomNavigation } from '@/components/BottomNavigation';
import { ContentSection } from '@/components/ContentSection';
import { useAuth } from '@/hooks/useAuth';
import { useLocationTracker } from '@/hooks/useLocationTracker';
import { useNavigate } from 'react-router-dom';
import farmHero from '@/assets/farm-hero.jpg';

const Index = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [showSoilModal, setShowSoilModal] = useState(false);
  const [showCropAdvisory, setShowCropAdvisory] = useState(false);
  const [showAIRecommendations, setShowAIRecommendations] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
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
      title: 'Crop Advisory',
      description: 'Expert farming tips and recommendations',
      action: () => setShowCropAdvisory(true)
    },
    {
      icon: Bug,
      title: 'Pest & Diseases',
      description: 'Identify and treat crop problems',
      action: () => setActiveTab('scan')
    },
    {
      icon: Mountain,
      title: 'Soil Conditions',
      description: 'Monitor soil health and nutrients',
      action: () => setShowSoilModal(true)
    },
    {
      icon: Cpu,
      title: 'AI Recommendations',
      description: 'Smart farming suggestions',
      action: () => setShowAIRecommendations(true)
    }
  ];

  const farmerTrips = [
    {
      title: 'Morning Field Inspection',
      location: 'North Field',
      time: '6:00 AM',
      status: 'completed' as const,
      description: 'Checked rice crop growth and irrigation needs'
    },
    {
      title: 'Fertilizer Application',
      location: 'South Field',
      time: '10:00 AM',
      status: 'active' as const,
      description: 'Applying organic fertilizer to wheat crops'
    },
    {
      title: 'Market Visit',
      location: 'Local Market',
      time: '2:00 PM',
      status: 'pending' as const,
      description: 'Check current market prices for harvest planning'
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
              <h1 className="text-2xl font-bold mb-1">Smart Farming</h1>
              <p className="text-sm opacity-90">AI-powered crop recommendations</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-3">Quick Actions</h2>
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
            <h2 className="text-lg font-semibold text-foreground mb-3">Weather Forecast</h2>
            <WeatherCard />
          </div>

          {/* Today's Farmer Trips */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-3">Today's Activities</h2>
            <div className="space-y-3">
              {farmerTrips.map((trip, index) => (
                <FarmerTripCard
                  key={index}
                  title={trip.title}
                  location={trip.location}
                  time={trip.time}
                  status={trip.status}
                  description={trip.description}
                />
              ))}
            </div>
          </div>


          {/* Farming Tips */}
          <div className="bg-gradient-earth text-white p-4 rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <MessageCircle className="w-5 h-5" />
              <h3 className="font-semibold">Today's Tip</h3>
            </div>
            <p className="text-sm opacity-90 leading-relaxed">
              Monitor your crops closely during this season. The current weather conditions are ideal for rapid growth, 
              but also watch for potential pest activity in warm, humid conditions.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4">
          <ContentSection activeTab={activeTab} />
        </div>
      )}

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <SoilConditionsModal isOpen={showSoilModal} onClose={() => setShowSoilModal(false)} />
      <CropAdvisoryModal isOpen={showCropAdvisory} onClose={() => setShowCropAdvisory(false)} />
      <AIRecommendationsModal isOpen={showAIRecommendations} onClose={() => setShowAIRecommendations(false)} />
    </div>
  );
};

export default Index;
